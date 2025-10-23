import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

    if (!stripeSecretKey || !stripeWebhookSecret) {
      throw new Error("Stripe configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Get the signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "No signature provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the raw body
    const body = await req.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Received event:", event.type);

    // Handle checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const userId = session.metadata?.user_id;
      const productId = session.metadata?.product_id;
      const sessionId = session.id;

      if (!userId || !productId) {
        console.error("Missing metadata in session:", session.id);
        return new Response(
          JSON.stringify({ error: "Missing metadata" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update purchase status to completed
      const { error: updateError } = await supabase
        .from("purchases")
        .update({ status: "completed" })
        .eq("stripe_payment_id", sessionId)
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating purchase:", updateError);
        throw new Error("Failed to update purchase");
      }

      // Apply product benefits to user profile
      await applyProductBenefits(supabase, userId, productId);

      console.log(`Successfully processed payment for user ${userId}, product ${productId}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in webhook-stripe:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function applyProductBenefits(
  supabase: any,
  userId: string,
  productId: string
): Promise<void> {
  // Get current profile
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("streak_freeze_count, premium_until, ads_removed")
    .eq("id", userId)
    .single();

  if (fetchError) {
    console.error("Error fetching profile:", fetchError);
    throw new Error("Failed to fetch profile");
  }

  let updateData: any = {};

  switch (productId) {
    case "streak_freeze":
      // Increment streak_freeze_count by 1
      updateData.streak_freeze_count = (profile.streak_freeze_count || 0) + 1;
      break;

    case "premium_monthly":
      // Set premium_until to NOW() + 30 days
      const premiumUntil = new Date();
      premiumUntil.setDate(premiumUntil.getDate() + 30);
      updateData.premium_until = premiumUntil.toISOString();
      break;

    case "remove_ads":
      // Set ads_removed to true
      updateData.ads_removed = true;
      break;

    default:
      console.error("Unknown product_id:", productId);
      throw new Error("Unknown product");
  }

  // Update profile with benefits
  const { error: updateError } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId);

  if (updateError) {
    console.error("Error applying benefits:", updateError);
    throw new Error("Failed to apply benefits");
  }

  console.log(`Applied benefits for product ${productId} to user ${userId}`);
}
