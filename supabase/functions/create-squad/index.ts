import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(user.id, 100);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const { name, description } = await req.json();

    // Validate input
    if (!name || name.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Nome do squad é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (name.length > 50) {
      return new Response(
        JSON.stringify({ error: "Nome do squad deve ter no máximo 50 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (description && description.length > 200) {
      return new Response(
        JSON.stringify({ error: "Descrição deve ter no máximo 200 caracteres" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create squad
    const { data: squad, error: squadError } = await supabase
      .from("squads")
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        max_members: 10,
        squad_streak: 0,
      })
      .select()
      .single();

    if (squadError) {
      console.error("Error creating squad:", squadError);
      throw new Error("Erro ao criar squad");
    }

    // Add creator as leader
    const { error: memberError } = await supabase
      .from("squad_members")
      .insert({
        squad_id: squad.id,
        user_id: user.id,
        role: "leader",
      });

    if (memberError) {
      console.error("Error adding squad leader:", memberError);
      // Rollback squad creation
      await supabase.from("squads").delete().eq("id", squad.id);
      throw new Error("Erro ao adicionar líder do squad");
    }

    return new Response(
      JSON.stringify({ success: true, squad }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in create-squad:", error);
    return handleError(error, corsHeaders);
  }
});
