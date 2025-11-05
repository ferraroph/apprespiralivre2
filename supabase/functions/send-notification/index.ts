import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createErrorResponse, ErrorCodes, handleError } from "../_shared/error-handler.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  user_id?: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

interface NotificationRequest {
  type: "daily_reminder" | "streak_at_risk" | "achievement" | "custom";
  payload?: NotificationPayload;
  achievement_id?: string;
}

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const cronSecret = Deno.env.get("CRON_SECRET");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check authorization
    const authHeader = req.headers.get("Authorization");
    const cronSecretHeader = req.headers.get("x-cron-secret");
    
    let currentUser: any = null;
    let isAuthorized = false;
    let isCronJob = false;
    
    // Check for cron secret (for automated jobs)
    if (cronSecret && cronSecretHeader === cronSecret) {
      isAuthorized = true;
      isCronJob = true;
    } 
    // Check for authenticated user
    else if (authHeader) {
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
      
      currentUser = user;
      isAuthorized = true;
    }
    
    if (!isAuthorized) {
      return createErrorResponse(
        "Autorização necessária",
        ErrorCodes.UNAUTHORIZED,
        401,
        undefined,
        corsHeaders
      );
    }

    // Validate request
    const body: NotificationRequest = await req.json();
    
    if (!body.type) {
      return new Response(
        JSON.stringify({ error: "Notification type is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let notificationsSent = 0;
    let errors = 0;

    // Handle different notification types
    switch (body.type) {
      case "daily_reminder":
        ({ sent: notificationsSent, errors } = await sendDailyReminders(supabase));
        break;
      
      case "streak_at_risk":
        ({ sent: notificationsSent, errors } = await sendStreakAtRiskNotifications(supabase));
        break;
      
      case "achievement":
        if (!body.payload?.user_id || !body.achievement_id) {
          return new Response(
            JSON.stringify({ error: "user_id and achievement_id required for achievement notifications" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        await sendAchievementNotification(supabase, body.payload.user_id, body.achievement_id);
        notificationsSent = 1;
        break;
      
      case "custom":
        if (!body.payload) {
          return new Response(
            JSON.stringify({ error: "Payload required for custom notifications" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // If not cron job, user can only send to themselves
        const targetUserId = body.payload.user_id || currentUser?.id;
        if (!isCronJob && currentUser && targetUserId !== currentUser.id) {
          return createErrorResponse(
            "Você só pode enviar notificações para si mesmo",
            ErrorCodes.UNAUTHORIZED,
            403,
            undefined,
            corsHeaders
          );
        }
        
        if (targetUserId) {
          await sendNotificationToUser(supabase, targetUserId, body.payload.title, body.payload.body, body.payload.data);
          notificationsSent = 1;
        }
        break;
      
      default:
        return new Response(
          JSON.stringify({ error: "Invalid notification type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notifications_sent: notificationsSent,
        errors: errors 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in send-notification:", error);
    return handleError(error, corsHeaders);
  }
});

// Web Push Protocol implementation
async function sendWebPush(
  subscription: PushSubscription,
  payload: string
): Promise<boolean> {
  const vapidPublicKey = Deno.env.get("VITE_FIREBASE_VAPID_KEY")!;
  const vapidPrivateKey = "eVEOCwCRjqtRJDtg-VPT5LVWY5RpbEaVLDi04lCmgTU"; // Your VAPID private key
  
  const url = new URL(subscription.endpoint);
  const audience = `${url.protocol}//${url.host}`;
  
  // Create JWT for VAPID
  const jwtHeader = {
    typ: "JWT",
    alg: "ES256",
  };
  
  const jwtPayload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
    sub: "mailto:your-email@example.com", // Replace with your email
  };
  
  // For simplicity, using a lightweight approach
  // In production, you'd want to use a proper JWT library
  const vapidHeaders = {
    "Content-Type": "application/octet-stream",
    "TTL": "86400",
    "Crypto-Key": `p256ecdsa=${vapidPublicKey}`,
    "Authorization": `WebPush ${vapidPrivateKey}`,
  };
  
  try {
    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: vapidHeaders,
      body: payload,
    });
    
    return response.ok;
  } catch (error) {
    console.error("Web Push error:", error);
    return false;
  }
}

async function sendDailyReminders(supabase: any) {
  // Query users who haven't checked in today
  const today = new Date().toISOString().split('T')[0];
  
  const { data: usersNeedingReminder, error } = await supabase
    .from("progress")
    .select("user_id")
    .or(`last_checkin_date.is.null,last_checkin_date.neq.${today}`);

  if (error) {
    console.error("Error fetching users for daily reminder:", error);
    return { sent: 0, errors: 1 };
  }

  let sent = 0;
  let errors = 0;

  for (const user of usersNeedingReminder || []) {
    try {
      await sendNotificationToUser(
        supabase,
        user.user_id,
        "Hora do Check-in! 🌟",
        "Não esqueça de registrar seu progresso hoje. Sua jornada é importante!",
        { type: "daily_reminder" }
      );
      sent++;
    } catch (error) {
      console.error(`Error sending daily reminder to user ${user.user_id}:`, error);
      errors++;
    }
  }

  return { sent, errors };
}

async function sendStreakAtRiskNotifications(supabase: any) {
  // Query users who haven't checked in for 48 hours
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  
  const { data: usersAtRisk, error } = await supabase
    .from("progress")
    .select("user_id, current_streak")
    .lt("last_checkin_date", fortyEightHoursAgo)
    .gt("current_streak", 0);

  if (error) {
    console.error("Error fetching users at risk:", error);
    return { sent: 0, errors: 1 };
  }

  let sent = 0;
  let errors = 0;

  for (const user of usersAtRisk || []) {
    try {
      await sendNotificationToUser(
        supabase,
        user.user_id,
        "⚠️ Sua sequência está em risco!",
        `Você está há 48h sem fazer check-in. Não perca sua sequência de ${user.current_streak} dias!`,
        { type: "streak_at_risk", streak: user.current_streak.toString() }
      );
      sent++;
    } catch (error) {
      console.error(`Error sending streak at risk notification to user ${user.user_id}:`, error);
      errors++;
    }
  }

  return { sent, errors };
}

async function sendAchievementNotification(supabase: any, userId: string, achievementId: string) {
  // Fetch achievement details
  const { data: achievement, error } = await supabase
    .from("achievements")
    .select("name, description")
    .eq("id", achievementId)
    .single();

  if (error || !achievement) {
    console.error("Error fetching achievement:", error);
    throw new Error("Achievement not found");
  }

  await sendNotificationToUser(
    supabase,
    userId,
    "🏆 Conquista Desbloqueada!",
    `Parabéns! Você desbloqueou: ${achievement.name}`,
    { 
      type: "achievement", 
      achievement_id: achievementId,
      achievement_name: achievement.name 
    }
  );
}

async function sendNotificationToUser(
  supabase: any,
  userId: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  // Retrieve Web Push subscriptions for user
  const { data: tokens, error: tokenError } = await supabase
    .from("user_tokens")
    .select("push_subscription, id")
    .eq("user_id", userId);

  if (tokenError) {
    console.error("Error fetching user tokens:", tokenError);
    throw new Error("Failed to retrieve user tokens");
  }

  if (!tokens || tokens.length === 0) {
    console.log(`No push subscriptions found for user ${userId}`);
    return;
  }

  const expiredTokenIds: string[] = [];

  // Send notification to each subscription
  for (const tokenRecord of tokens) {
    try {
      if (!tokenRecord.push_subscription) {
        console.log(`No push subscription for token ${tokenRecord.id}`);
        continue;
      }

      // Parse the push subscription JSON
      const subscription: PushSubscription = JSON.parse(tokenRecord.push_subscription);

      // Create notification payload
      const payload = JSON.stringify({
        title,
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        data: data || {},
        vibrate: [200, 100, 200],
      });

      // Send via Web Push Protocol
      const success = await sendWebPush(subscription, payload);

      if (success) {
        // Update last_used_at timestamp
        await supabase
          .from("user_tokens")
          .update({ last_used_at: new Date().toISOString() })
          .eq("id", tokenRecord.id);
        
        console.log(`Notification sent successfully to subscription ${tokenRecord.id}`);
      } else {
        console.error(`Failed to send notification to subscription ${tokenRecord.id}`);
        expiredTokenIds.push(tokenRecord.id);
      }
    } catch (error) {
      console.error(`Error sending notification to subscription ${tokenRecord.id}:`, error);
      expiredTokenIds.push(tokenRecord.id);
    }
  }

  // Clean up expired subscriptions
  if (expiredTokenIds.length > 0) {
    await supabase
      .from("user_tokens")
      .delete()
      .in("id", expiredTokenIds);
    
    console.log(`Cleaned up ${expiredTokenIds.length} expired subscriptions`);
  }
}
