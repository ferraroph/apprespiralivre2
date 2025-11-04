import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { trackAchievementUnlock } from "../_shared/track-achievement.ts";
import { withRateLimit } from "../_shared/rate-limit.ts";
import { createErrorResponse, ErrorCodes, handleError } from "../_shared/error-handler.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return createErrorResponse(
        "Não autorizado",
        ErrorCodes.UNAUTHORIZED,
        401,
        undefined,
        corsHeaders
      );
    }

    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(user.id, 100);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { mood, notes } = await req.json();
    
    // Input validation
    const validMoods = ["good", "neutral", "bad"];
    
    if (!mood || typeof mood !== "string" || !validMoods.includes(mood)) {
      return createErrorResponse(
        "Humor inválido. Use: good, neutral ou bad",
        ErrorCodes.INVALID_INPUT,
        400,
        undefined,
        corsHeaders
      );
    }
    
    if (mood.length > 50) {
      return createErrorResponse(
        "Humor muito longo",
        ErrorCodes.INVALID_INPUT,
        400,
        undefined,
        corsHeaders
      );
    }
    
    if (notes && typeof notes !== "string") {
      return createErrorResponse(
        "Notas devem ser texto",
        ErrorCodes.INVALID_INPUT,
        400,
        undefined,
        corsHeaders
      );
    }
    
    if (notes && notes.length > 500) {
      return createErrorResponse(
        "Notas muito longas (máximo 500 caracteres)",
        ErrorCodes.INVALID_INPUT,
        400,
        undefined,
        corsHeaders
      );
    }
    
    const today = new Date().toISOString().split("T")[0];

    // Check if already checked in today
    const { data: existingCheckin } = await supabase
      .from("checkins")
      .select("*")
      .eq("user_id", user.id)
      .eq("checkin_date", today)
      .maybeSingle();

    if (existingCheckin) {
      return new Response(
        JSON.stringify({ error: "Você já fez check-in hoje!" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get current progress
    const { data: progress } = await supabase
      .from("progress")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const coinsEarned = 10;
    const xpEarned = 5;

    // Create checkin
    const { error: checkinError } = await supabase.from("checkins").insert({
      user_id: user.id,
      checkin_date: today,
      mood,
      notes,
      respi_coins_earned: coinsEarned,
      xp_earned: xpEarned,
    });

    if (checkinError) throw checkinError;

    // Calculate streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = 1;
    let streakLost = false;
    const previousStreak = progress?.current_streak || 0;
    
    if (progress?.last_checkin_date === yesterdayStr) {
      newStreak = previousStreak + 1;
    } else if (previousStreak > 0 && progress?.last_checkin_date) {
      // Streak was broken
      streakLost = true;
    }

    const longestStreak = Math.max(newStreak, progress?.longest_streak || 0);

    // Track streak loss
    if (streakLost) {
      try {
        await supabase.functions.invoke("track-event", {
          body: {
            events: [{
              event_name: "streak_lost",
              user_id: user.id,
              properties: {
                previous_streak_count: previousStreak,
                last_checkin_date: progress?.last_checkin_date,
              },
            }],
          },
        });
      } catch (error) {
        console.error("Error tracking streak loss:", error);
        // Don't throw - analytics should not break the main flow
      }
    }

    // Update progress
    const { error: updateError } = await supabase
      .from("progress")
      .update({
        current_streak: newStreak,
        longest_streak: longestStreak,
        respi_coins: (progress?.respi_coins || 0) + coinsEarned,
        xp: (progress?.xp || 0) + xpEarned,
        last_checkin_date: today,
      })
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    // Check for achievements
    if (newStreak === 7) {
      const achievementData = {
        user_id: user.id,
        achievement_type: "streak_7",
        title: "Uma Semana Livre",
        description: "Completou 7 dias consecutivos",
        icon: "flame",
      };
      
      await supabase.from("achievements").insert(achievementData);
      
      // Track achievement unlock
      await trackAchievementUnlock(supabase, user.id, "streak_7", "Uma Semana Livre");
    }

    return new Response(
      JSON.stringify({
        success: true,
        streak: newStreak,
        coinsEarned,
        xpEarned,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in checkin:", error);
    return handleError(error, corsHeaders);
  }
});
