// Creates a Stripe Checkout Session for the VIP funnel.
// Products supported (inline price_data — no Stripe dashboard products needed):
//   - vip_bundle  ($27)      required base line item
//   - ship_it_kit ($7)       optional bump line item
//   - prompt_vault ($7)      single-item downsell
//
// Auth: requires a valid Supabase JWT (the user placing the order).
// Idempotency is enforced at the webhook by unique index on
// purchases.stripe_checkout_session_id.
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return json(503, { error: "checkout_unavailable", message: "Stripe is not configured yet." });
  }

  // AuthN
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json(401, { error: "Unauthorized" });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsErr } = await supabase.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims) return json(401, { error: "Unauthorized" });
  const userId = claimsData.claims.sub as string;
  const userEmail = (claimsData.claims.email as string | undefined) ?? undefined;

  let body: {
    product_type?: string;
    include_bump?: boolean;
    success_url?: string;
    cancel_url?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  const origin = req.headers.get("Origin") ?? Deno.env.get("APP_URL") ?? "https://appreneur.ai";
  const success_url = body.success_url ?? `${origin}/thank-you?vip=1&session_id={CHECKOUT_SESSION_ID}`;
  const cancel_url = body.cancel_url ?? `${origin}/vip-offer`;

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let productType = body.product_type ?? "vip_bundle";

  if (productType === "vip_bundle") {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: 2700,
        product_data: { name: "Appreneur VIP Bundle" },
      },
    });
    if (body.include_bump) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: 700,
          product_data: { name: "Ship It Launch Kit" },
        },
      });
    }
  } else if (productType === "prompt_vault") {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: 700,
        product_data: { name: "Prompt Framework Vault" },
      },
    });
  } else {
    return json(400, { error: "Unknown product_type" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      customer_email: userEmail,
      success_url,
      cancel_url,
      metadata: {
        user_id: userId,
        product_type: productType,
        include_bump: body.include_bump ? "true" : "false",
      },
    });

    return json(200, { url: session.url, id: session.id });
  } catch (err) {
    console.error("Stripe checkout create error", err);
    return json(500, { error: "checkout_error", message: (err as Error).message });
  }
});
