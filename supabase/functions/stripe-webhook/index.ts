// Stripe webhook: records completed Checkout Sessions into public.purchases.
// Idempotency: unique index on purchases.stripe_checkout_session_id ensures
// duplicate delivery cannot double-count revenue.
//
// Public endpoint — do NOT require a Supabase JWT. Instead, verify the
// Stripe-Signature header against STRIPE_WEBHOOK_SECRET before trusting
// anything in the request body.
import { createClient } from "npm:@supabase/supabase-js@2";
import Stripe from "npm:stripe@14";

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    return new Response("Stripe webhook not configured", { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Signature verification failed", err);
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  // service_role client so we can bypass RLS to record purchases.
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        return new Response("ignored: not paid", { status: 200 });
      }

      const userId = session.metadata?.user_id;
      const productType = (session.metadata?.product_type ?? "vip_bundle") as
        | "vip_bundle"
        | "prompt_vault"
        | "ship_it_kit";
      const includeBump = session.metadata?.include_bump === "true";

      if (!userId) {
        console.error("checkout.session.completed missing user_id metadata");
        return new Response("missing metadata", { status: 200 });
      }

      // Idempotent insert — the unique index on stripe_checkout_session_id
      // guarantees at-most-once even if Stripe retries this delivery.
      const { error: insertError } = await supabase.from("purchases").insert({
        user_id: userId,
        product_type: productType,
        amount_cents: session.amount_total ?? 0,
        currency: session.currency ?? "usd",
        stripe_payment_intent_id:
          typeof session.payment_intent === "string"
            ? session.payment_intent
            : session.payment_intent?.id ?? null,
        stripe_checkout_session_id: session.id,
        status: "completed",
        metadata: {
          include_bump: includeBump,
          customer_email: session.customer_details?.email,
        },
      });

      // 23505 = unique_violation — already recorded from a prior delivery.
      if (insertError && insertError.code !== "23505") {
        console.error("Insert purchases failed", insertError);
        return new Response("db error", { status: 500 });
      }

      // Flip the VIP flag on the profile for vip_bundle / prompt_vault upsells.
      if (productType === "vip_bundle") {
        await supabase.from("profiles").update({ is_vip: true }).eq("id", userId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook handler error", err);
    return new Response("handler error", { status: 500 });
  }
});
