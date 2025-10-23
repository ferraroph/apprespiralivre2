import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreatePaymentRequest {
  product_id: "streak_freeze" | "premium_monthly" | "remove_ads";
}

interface Product {
  id: string;
  name: string;
  amount: number;
  currency: string;
  description: string;
}

const PRODUCTS: Record<string, Product> = {
  streak_freeze: {
    id: "streak_freeze",
    name: "Congelamento de Sequência",
    amount: 490, // R$ 4.90 in cents
    currency: "BRL",
    description: "Proteja sua sequência por 1 dia",
  },
  premium_monthly: {
    id: "premium_monthly",
    name: "Premium Mensal",
    amount: 990, // R$ 9.90 in cents
    currency: "BRL",
    description: "Acesso a conteúdo premium por 30 dias",
  },
  remove_ads: {
    id: "remove_ads",
    name: "Remover Anúncios",
    amount: 1490, // R$ 14.90 in cents
    currency: "BRL",
    description: "Remova anúncios permanentemente",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY")!;

    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Authenticate user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate request
    const body: CreatePaymentRequest = await req.json();

    if (!body.product_id || !PRODUCTS[body.product_id]) {
      return new Response(
        JSON.stringify({ error: "Invalid product_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const product = PRODUCTS[body.product_id];

    // Get user profile for email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .single();

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: product.currency.toLowerCase(),
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin") || "http://localhost:8080"}/profile?payment=success`,
      cancel_url: `${req.headers.get("origin") || "http://localhost:8080"}/profile?payment=cancelled`,
      customer_email: profile?.email || user.email,
      metadata: {
        user_id: user.id,
        product_id: product.id,
      },
    });

    // Store pending purchase in database
    const { error: insertError } = await supabase.from("purchases").insert({
      user_id: user.id,
      product_id: product.id,
      stripe_payment_id: session.id,
      amount: product.amount,
      currency: product.currency,
      status: "pending",
    });

    if (insertError) {
      console.error("Error inserting purchase:", insertError);
      throw new Error("Failed to create purchase record");
    }

    return new Response(
      JSON.stringify({
        checkout_url: session.url,
        session_id: session.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in create-payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
