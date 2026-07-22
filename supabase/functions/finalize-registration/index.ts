import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set([
  "https://appreneur.lovable.app",
  "https://appreneur.ai",
  "https://www.appreneur.ai",
  "http://localhost:5173",
  "http://localhost:8080",
]);

function buildCors(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const allow =
    ALLOWED_ORIGINS.has(origin) ||
    /^https:\/\/id-preview--.*\.lovable\.app$/.test(origin)
      ? origin
      : "https://appreneur.ai";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

function escapeHtml(input: unknown): string {
  const s = String(input ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// AbortSignal.timeout is available on the modern Deno runtime; fall back to
// an AbortController for older versions.
function withTimeout(ms: number): AbortSignal {
  const anyAbort = AbortSignal as unknown as {
    timeout?: (ms: number) => AbortSignal;
  };
  if (typeof anyAbort.timeout === "function") {
    return anyAbort.timeout(ms);
  }
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

const NETWORK_TIMEOUT_MS = 10_000;

interface WelcomeTemplateData {
  firstName: string;
  dashboardUrl: string;
}

function buildWelcomeEmail(data: WelcomeTemplateData): {
  subject: string;
  html: string;
  text: string;
} {
  const firstName = escapeHtml(data.firstName || "there");
  const dashboardUrl = escapeHtml(data.dashboardUrl);
  const subject = "Welcome to the Appreneur Challenge — Day 1 is ready";
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${subject}</title></head>
<body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#0a0a0f;color:#ffffff;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <h1 style="font-size:24px;color:#ffffff;margin:0 0 24px 0;">Welcome, ${firstName}</h1>
    <p style="font-size:16px;line-height:1.6;color:#d4d4d8;margin:0 0 16px 0;">
      Welcome to the Appreneur Challenge — a free, self-paced, five-day
      program that walks you from app idea to a working first version.
    </p>
    <p style="font-size:16px;line-height:1.6;color:#d4d4d8;margin:0 0 24px 0;">
      Day 1 is ready in your dashboard. One focused lesson, one clear
      deliverable — start whenever you're ready.
    </p>
    <p style="margin:24px 0;">
      <a href="${dashboardUrl}"
        style="display:inline-block;background:#f59e0b;color:#0a0a0f;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:8px;">
        Start Day 1
      </a>
    </p>
    <p style="font-size:14px;line-height:1.6;color:#a1a1aa;margin:24px 0 0 0;">
      Not expecting this email? You can ignore it and we'll remove you from the list.
    </p>
    <hr style="border:0;border-top:1px solid #27272a;margin:32px 0;">
    <p style="font-size:12px;line-height:1.5;color:#71717a;margin:0;">
      Appreneur Challenge — a project of AI For Business.<br>
      This is a transactional email sent because you created a free account.
    </p>
  </div>
</body></html>`;
  const text = [
    `Welcome, ${data.firstName || "there"}`,
    "",
    "Welcome to the Appreneur Challenge — a free, self-paced, five-day program that walks you from app idea to a working first version.",
    "",
    "Day 1 is ready in your dashboard. One focused mission, one concrete win — start whenever you're ready.",
    "",
    `Start Day 1: ${data.dashboardUrl}`,
    "",
    "—",
    "Appreneur Challenge — a project of AI For Business.",
    "This is a transactional email sent because you created a free account.",
  ].join("\n");
  return { subject, html, text };
}

serve(async (req: Request) => {
  const corsHeaders = buildCors(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // 1) Require an authenticated user JWT. Reject anon.
  const authHeader = req.headers.get("Authorization") ?? "";
  const bearer = authHeader.replace(/^Bearer\s+/i, "");
  if (!bearer || bearer === supabaseAnonKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${bearer}` } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = userData.user.id;
  const userEmail = userData.user.email ?? "";

  // Optional body for attribution context (validated but never trusted to
  // change the user id).
  let firstName = "";
  let quizAnswers: Record<string, string> | undefined;
  let utmParams: Record<string, string> | undefined;
  try {
    const raw = await req.text();
    if (raw) {
      const body = JSON.parse(raw) as Record<string, unknown>;
      if (typeof body.first_name === "string" && body.first_name.length <= 120) {
        firstName = body.first_name;
      }
      if (body.quiz_answers && typeof body.quiz_answers === "object") {
        quizAnswers = body.quiz_answers as Record<string, string>;
      }
      if (body.utm_params && typeof body.utm_params === "object") {
        utmParams = body.utm_params as Record<string, string>;
      }
    }
  } catch {
    // ignore body parse errors; JWT owns identity
  }

  const service = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // If we lack a first name from the body, try the profile.
  if (!firstName) {
    try {
      const { data: profile } = await service
        .from("profiles")
        .select("first_name")
        .eq("id", userId)
        .maybeSingle();
      firstName = profile?.first_name ?? "";
    } catch {}
  }

  // 2) Initialize progress for this user (idempotent, service-role only).
  let progressReady = false;
  try {
    const { error: initErr } = await service.rpc("initialize_user_progress_for", {
      p_user_id: userId,
    });
    if (initErr) throw initErr;
    progressReady = true;
    await service
      .from("registration_deliveries")
      .upsert(
        { user_id: userId, progress_initialized_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
  } catch (err) {
    console.error("[finalize-registration] progress init error", err);
  }

  // 3) Email — claim + send. Missing config yields "not_configured".
  const resendKey = Deno.env.get("RESEND_API_KEY") ?? "";
  const fromEmail = Deno.env.get("FROM_EMAIL") ?? "";
  const replyTo = Deno.env.get("REPLY_TO_EMAIL") ?? "";
  let emailStatus: "sent" | "not_configured" | "failed" | "pending" | "skipped" =
    "pending";

  if (!resendKey || !fromEmail || !replyTo) {
    emailStatus = "not_configured";
    await service
      .from("registration_deliveries")
      .update({ email_status: "not_configured", email_claim_expires_at: null })
      .eq("user_id", userId)
      .neq("email_status", "sent");
  } else if (!userEmail) {
    emailStatus = "skipped";
  } else {
    const { data: claim, error: claimErr } = await service.rpc(
      "claim_registration_delivery",
      { _user_id: userId, _kind: "email" },
    );
    if (claimErr) {
      console.error("[finalize-registration] email claim error", claimErr);
      emailStatus = "failed";
    } else if ((claim as { claimed?: boolean })?.claimed) {
      try {
        const origin = req.headers.get("Origin") || "https://appreneur.ai";
        const safeOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://appreneur.ai";
        const dashboardUrl = `${safeOrigin}/dashboard`;
        const built = buildWelcomeEmail({ firstName, dashboardUrl });
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [userEmail],
            reply_to: replyTo,
            subject: built.subject,
            html: built.html,
            text: built.text,
          }),
          signal: withTimeout(NETWORK_TIMEOUT_MS),
        });
        if (!resp.ok) {
          const errText = await resp.text().catch(() => "");
          console.error("[finalize-registration] resend error", resp.status, errText);
          emailStatus = "failed";
          await service
            .from("registration_deliveries")
            .update({
              email_status: "failed",
              email_last_error: `resend ${resp.status}`.slice(0, 200),
              email_claim_expires_at: null,
            })
            .eq("user_id", userId);
        } else {
          emailStatus = "sent";
          await service
            .from("registration_deliveries")
            .update({
              email_status: "sent",
              email_sent_at: new Date().toISOString(),
              email_claim_expires_at: null,
              email_last_error: null,
            })
            .eq("user_id", userId);
        }
      } catch (err) {
        console.error("[finalize-registration] email send exception", err);
        emailStatus = "failed";
        const msg = err instanceof Error ? err.name : "email_send_exception";
        await service
          .from("registration_deliveries")
          .update({
            email_status: "failed",
            email_last_error: msg.slice(0, 200),
            email_claim_expires_at: null,
          })
          .eq("user_id", userId);
      }
    } else {
      // Not claimed — either already sent or another worker is doing it.
      const reason = (claim as { reason?: string })?.reason ?? "";
      if (reason === "already_sent") emailStatus = "sent";
      else emailStatus = "pending";
    }
  }

  // 4) Webhook — claim + fire via fire-webhook using service credentials.
  let webhookStatus: "sent" | "failed" | "pending" | "skipped" = "pending";
  {
    const { data: claim, error: claimErr } = await service.rpc(
      "claim_registration_delivery",
      { _user_id: userId, _kind: "webhook" },
    );
    if (claimErr) {
      console.error("[finalize-registration] webhook claim error", claimErr);
      webhookStatus = "failed";
    } else if ((claim as { claimed?: boolean })?.claimed) {
      try {
        const resp = await fetch(`${supabaseUrl}/functions/v1/fire-webhook`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${supabaseServiceKey}`,
            apikey: supabaseServiceKey,
          },
          body: JSON.stringify({
            event_type: "user.registered",
            payload: {
              user_id: userId,
              email: userEmail,
              first_name: firstName,
              utm_params: utmParams,
              quiz_answers: quizAnswers,
            },
          }),
          signal: withTimeout(NETWORK_TIMEOUT_MS),
        });
        if (!resp.ok) {
          webhookStatus = "failed";
          await service
            .from("registration_deliveries")
            .update({
              webhook_status: "failed",
              webhook_last_error: `fire-webhook ${resp.status}`.slice(0, 200),
              webhook_claim_expires_at: null,
            })
            .eq("user_id", userId);
        } else {
          webhookStatus = "sent";
          await service
            .from("registration_deliveries")
            .update({
              webhook_status: "sent",
              webhook_sent_at: new Date().toISOString(),
              webhook_claim_expires_at: null,
              webhook_last_error: null,
            })
            .eq("user_id", userId);
        }
      } catch (err) {
        console.error("[finalize-registration] webhook exception", err);
        webhookStatus = "failed";
        const msg = err instanceof Error ? err.name : "webhook_exception";
        await service
          .from("registration_deliveries")
          .update({
            webhook_status: "failed",
            webhook_last_error: msg.slice(0, 200),
            webhook_claim_expires_at: null,
          })
          .eq("user_id", userId);
      }
    } else {
      const reason = (claim as { reason?: string })?.reason ?? "";
      if (reason === "already_sent") webhookStatus = "sent";
      else webhookStatus = "pending";
    }
  }

  return new Response(
    JSON.stringify({
      progress_ready: progressReady,
      email_status: emailStatus,
      webhook_status: webhookStatus,
    }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});