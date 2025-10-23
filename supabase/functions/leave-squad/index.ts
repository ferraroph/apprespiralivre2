import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { squad_id } = await req.json();

    if (!squad_id) {
      return new Response(
        JSON.stringify({ error: "ID do squad é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is a member
    const { data: membership, error: memberError } = await supabase
      .from("squad_members")
      .select("*")
      .eq("squad_id", squad_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (memberError || !membership) {
      return new Response(
        JSON.stringify({ error: "Você não é membro deste squad" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If user is leader, handle leader transfer
    if (membership.role === "leader") {
      // Get other members
      const { data: otherMembers, error: membersError } = await supabase
        .from("squad_members")
        .select("*")
        .eq("squad_id", squad_id)
        .neq("user_id", user.id)
        .order("joined_at", { ascending: true });

      if (membersError) {
        console.error("Error fetching other members:", membersError);
        throw new Error("Erro ao buscar membros do squad");
      }

      if (otherMembers && otherMembers.length > 0) {
        // Transfer leadership to the oldest member
        const newLeader = otherMembers[0];
        const { error: updateError } = await supabase
          .from("squad_members")
          .update({ role: "leader" })
          .eq("id", newLeader.id);

        if (updateError) {
          console.error("Error transferring leadership:", updateError);
          throw new Error("Erro ao transferir liderança");
        }
      }
      // If no other members, squad will be empty and can be deleted by cleanup job
    }

    // Remove user from squad
    const { error: deleteError } = await supabase
      .from("squad_members")
      .delete()
      .eq("id", membership.id);

    if (deleteError) {
      console.error("Error leaving squad:", deleteError);
      throw new Error("Erro ao sair do squad");
    }

    return new Response(
      JSON.stringify({ success: true, message: "Saiu do squad com sucesso" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in leave-squad:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
