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

  // Fail-closed feature flag. VIP checkout must remain fully off until the
  // owner explicitly sets VIP_SALES_ENABLED to the string "true" in the
  // edge-function environment. Signature verification below is preserved
  // for when the flag is enabled.
  if (Deno.env.get("VIP_SALES_ENABLED") !== "true") {
    return new Response("unavailable", { status: 503 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    console.error("[stripe-webhook] missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET");
    return new Response("unavailable", { status: 503 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("bad_request", { status: 400 });

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-06-20" });
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    // Log detail internally but never echo signature/error detail publicly.
    console.error("[stripe-webhook] signature verification failed", err);
    return new Response("bad_request", { status: 400 });
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

      let userId: string | null = session.metadata?.user_id || null;
      const productType = (session.metadata?.product_type ?? "vip_bundle") as
        | "vip_bundle"
        | "prompt_vault"
        | "ship_it_kit";
      const includeBump = session.metadata?.include_bump === "true";
      const customerEmail =
        session.customer_details?.email ??
        session.metadata?.customer_email ??
        null;

      // Resolve the buyer if metadata didn't carry a user_id (anonymous
        // checkout path): look them up by email.
      if (!userId && customerEmail) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", customerEmail)
          .maybeSingle();
        if (profile?.id) userId = profile.id;
      }

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;

      // Upsert on the unique stripe_checkout_session_id: the pending row
      // inserted by create-checkout-session is flipped to completed; if it
      // wasn't inserted (e.g. failure) we still create the record here.
      const { error: upsertError } = await supabase
        .from("purchases")
        .upsert(
          {
            user_id: userId,
            product_type: productType,
            amount_cents: session.amount_total ?? 0,
            currency: session.currency ?? "usd",
            stripe_payment_intent_id: paymentIntentId,
            stripe_checkout_session_id: session.id,
            status: "completed",
            metadata: {
              include_bump: includeBump,
              customer_email: customerEmail,
            },
          },
          { onConflict: "stripe_checkout_session_id" },
        );

      if (upsertError) {
        console.error("[stripe-webhook] upsert purchases failed", upsertError);
        return new Response("internal_error", { status: 500 });
      }

      // Flip the VIP flag on the profile for vip_bundle purchases. This is
      // the ONLY legitimate way is_vip is granted — the client-side path is
      // blocked by enforce_profile_privileged_columns.
      if (productType === "vip_bundle" && userId) {
        await supabase.from("profiles").update({ is_vip: true }).eq("id", userId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[stripe-webhook] handler error", err);
    return new Response("internal_error", { status: 500 });
  }
});
