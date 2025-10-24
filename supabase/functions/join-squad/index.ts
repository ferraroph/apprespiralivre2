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

    const { squad_id } = await req.json();

    if (!squad_id) {
      return new Response(
        JSON.stringify({ error: "ID do squad é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if squad exists
    const { data: squad, error: squadError } = await supabase
      .from("squads")
      .select("*")
      .eq("id", squad_id)
      .single();

    if (squadError || !squad) {
      return new Response(
        JSON.stringify({ error: "Squad não encontrado" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("squad_members")
      .select("*")
      .eq("squad_id", squad_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (existingMember) {
      return new Response(
        JSON.stringify({ error: "Você já é membro deste squad" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check member count
    const { count, error: countError } = await supabase
      .from("squad_members")
      .select("*", { count: "exact", head: true })
      .eq("squad_id", squad_id);

    if (countError) {
      console.error("Error counting members:", countError);
      throw new Error("Erro ao verificar membros do squad");
    }

    if (count && count >= squad.max_members) {
      return new Response(
        JSON.stringify({ error: "Squad está cheio" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Add user as member
    const { error: memberError } = await supabase
      .from("squad_members")
      .insert({
        squad_id: squad_id,
        user_id: user.id,
        role: "member",
      });

    if (memberError) {
      console.error("Error adding squad member:", memberError);
      throw new Error("Erro ao entrar no squad");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Entrou no squad com sucesso" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in join-squad:", error);
    return handleError(error, corsHeaders);
  }
});
