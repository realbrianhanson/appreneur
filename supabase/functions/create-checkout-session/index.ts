// Creates a Stripe Checkout Session for the VIP funnel.
//
// Prelaunch: this endpoint FAILS CLOSED (HTTP 503) while VIP_SALES_ENABLED is
// off. When re-enabled it also requires an authenticated user, builds the
// success/cancel URLs server-side from a same-origin allowlist, and rate-
// limits per user. Client-sent redirect URLs are never trusted.
//
// Products supported (server-side price map — client-sent prices are ignored):
//   - vip_bundle   ($27)  base VIP upsell
//   - ship_it_kit  ($7)   optional bump line item added to vip_bundle
//   - prompt_vault ($7)   downsell
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

// Same-origin allowlist for building success/cancel URLs. Anything outside
// this list is rejected — we never redirect users to a client-supplied host.
const ALLOWED_ORIGINS = new Set<string>([
  "https://appreneur.ai",
  "https://appreneur.lovable.app",
]);
function pickTrustedOrigin(headerOrigin: string | null): string {
  const envOrigin = Deno.env.get("APP_URL");
  if (envOrigin && ALLOWED_ORIGINS.has(envOrigin)) return envOrigin;
  if (headerOrigin && ALLOWED_ORIGINS.has(headerOrigin)) return headerOrigin;
  return "https://appreneur.ai";
}

// Naive in-memory per-user rate limit: 5 checkout attempts / minute.
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > 5;
}

function isSalesEnabled(): boolean {
  return (Deno.env.get("VIP_SALES_ENABLED") ?? "").toLowerCase() === "true";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  // Kill switch: fail closed until the product is ready to sell.
  if (!isSalesEnabled()) {
    return json(503, {
      error: "sales_disabled",
      message: "VIP details are being finalized. Please try again later.",
    });
  }

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

  // Require an authenticated user for the future enabled path.
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return json(401, { error: "auth_required" });
  }
  const anonClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData } = await anonClient.auth.getClaims(token);
  if (!claimsData?.claims?.sub) return json(401, { error: "auth_required" });
  const userId = claimsData.claims.sub as string;
  const userEmailFromToken = (claimsData.claims.email as string | undefined) ?? undefined;

  if (isRateLimited(`u:${userId}`)) {
    return json(429, { error: "rate_limited" });
  }

  let body: {
    product?: string;
    product_type?: string;
    include_bump?: boolean;
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

  const origin = pickTrustedOrigin(req.headers.get("Origin"));
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

  // Server-built same-origin success/cancel URLs. Client-supplied URLs are
  // ignored to prevent open-redirect abuse.
  const success_url =
    productType === "prompt_vault"
      ? `${origin}/dashboard?purchase=prompt_vault&session_id={CHECKOUT_SESSION_ID}`
      : `${origin}/thank-you?vip=1&session_id={CHECKOUT_SESSION_ID}`;
  const cancel_url =
    productType === "prompt_vault" ? `${origin}/downsell` : `${origin}/vip-offer`;
  const customerEmail = userEmailFromToken;

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
