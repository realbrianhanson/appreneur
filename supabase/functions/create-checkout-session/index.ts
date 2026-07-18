// Creates a Stripe Checkout Session for the VIP funnel.
//
// Products supported (server-side price map — client-sent prices are ignored):
//   - vip_bundle   ($27)  base VIP upsell
//   - ship_it_kit  ($7)   optional bump line item added to vip_bundle
//   - prompt_vault ($7)   downsell
//
// Auth: verify_jwt = false so freshly-registered (possibly unconfirmed) users
// can still redirect to Checkout. When a JWT IS present we validate it and
// attach user_id / email; otherwise we accept `email` from the body.
// Idempotency is enforced at the webhook via the unique index on
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

// Trusted server-side price map. Client-sent prices are ignored.
const PRODUCTS = {
  vip_bundle: { name: "Appreneur VIP Bundle", amount_cents: 2700 },
  ship_it_kit: { name: "Ship It Launch Kit", amount_cents: 700 },
  prompt_vault: { name: "Prompt Framework Vault", amount_cents: 700 },
} as const;

type ProductKey = keyof typeof PRODUCTS;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    console.error("STRIPE_SECRET_KEY is not set");
    return new Response(
      JSON.stringify({
        error: "stripe_not_configured",
        message: "STRIPE_SECRET_KEY is missing on the server.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Optional auth — if a JWT is provided we validate and attach the user.
  let userId: string | null = null;
  let userEmailFromToken: string | undefined;
  const authHeader = req.headers.get("Authorization") ?? "";
  if (authHeader.startsWith("Bearer ")) {
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData } = await anonClient.auth.getClaims(token);
    if (claimsData?.claims) {
      userId = claimsData.claims.sub as string;
      userEmailFromToken = (claimsData.claims.email as string | undefined) ?? undefined;
    }
  }

  let body: {
    product?: string;
    product_type?: string;
    include_bump?: boolean;
    email?: string;
    success_url?: string;
    cancel_url?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON body" });
  }

  // Support both `product` (spec) and legacy `product_type`. Also accept the
  // short aliases 'vip' and 'downsell' documented in the batch spec.
  const rawProduct = (body.product ?? body.product_type ?? "vip_bundle").toString();
  const productAlias: Record<string, ProductKey> = {
    vip: "vip_bundle",
    vip_bundle: "vip_bundle",
    downsell: "prompt_vault",
    prompt_vault: "prompt_vault",
  };
  const productType = productAlias[rawProduct];
  if (!productType) return json(400, { error: "Unknown product" });

  const origin = req.headers.get("Origin") ?? Deno.env.get("APP_URL") ?? "https://appreneur.ai";
  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });

  // Build line items from the server-side price map.
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: PRODUCTS[productType].amount_cents,
        product_data: { name: PRODUCTS[productType].name },
      },
    },
  ];
  if (productType === "vip_bundle" && body.include_bump) {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: PRODUCTS.ship_it_kit.amount_cents,
        product_data: { name: PRODUCTS.ship_it_kit.name },
      },
    });
  }

  const totalCents =
    PRODUCTS[productType].amount_cents +
    (productType === "vip_bundle" && body.include_bump ? PRODUCTS.ship_it_kit.amount_cents : 0);

  // Route success back to /thank-you for VIP, /dashboard for downsell, per spec.
  const defaultSuccessUrl =
    productType === "prompt_vault"
      ? `${origin}/dashboard?purchase=prompt_vault&session_id={CHECKOUT_SESSION_ID}`
      : `${origin}/thank-you?vip=1&session_id={CHECKOUT_SESSION_ID}`;
  const success_url = body.success_url ?? defaultSuccessUrl;
  const cancel_url =
    body.cancel_url ??
    (productType === "prompt_vault" ? `${origin}/downsell` : `${origin}/vip-offer`);

  const customerEmail = userEmailFromToken ?? body.email ?? undefined;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      customer_email: customerEmail,
      success_url,
      cancel_url,
      metadata: {
        user_id: userId ?? "",
        product_type: productType,
        include_bump: body.include_bump ? "true" : "false",
        customer_email: customerEmail ?? "",
      },
    });

    // Persist a pending purchase row keyed by checkout session id so admin
    // reporting can see abandoned checkouts and the webhook can reconcile.
    try {
      const service = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      await service.from("purchases").insert({
        user_id: userId,
        product_type: productType,
        amount_cents: totalCents,
        currency: "usd",
        stripe_checkout_session_id: session.id,
        status: "pending",
        metadata: {
          include_bump: !!body.include_bump,
          customer_email: customerEmail ?? null,
        },
      });
    } catch (persistErr) {
      // Non-fatal: Stripe session is already created. The webhook will still
      // upsert on completion.
      console.error("pending purchase insert failed", persistErr);
    }

    return json(200, { url: session.url, id: session.id });
  } catch (err) {
    console.error("Stripe checkout create error", err);
    return json(500, { error: "checkout_error", message: (err as Error).message });
  }
});
