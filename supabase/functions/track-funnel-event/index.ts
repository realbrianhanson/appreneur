// Public funnel-event tracker.
//
// Replaces direct anon inserts into `public.funnel_events`. Strict CORS
// allowlist, tight schema validation, and IP-derived server-side rate
// limiting. Fail-closed on missing configuration.
//
// This endpoint deliberately does NOT verify a Supabase JWT (browsers
// hit it during pre-registration) but it also never trusts client input
// as identity. All inserts go through service-role using validated
// fields only.
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set<string>([
  "https://appreneur.lovable.app",
  "https://appreneur.ai",
  "https://www.appreneur.ai",
]);
const PREVIEW_ORIGIN_RE = /^https:\/\/id-preview--[a-z0-9-]+\.lovable\.app$/;
const LOCAL_ORIGIN_RE = /^http:\/\/localhost:(5173|8080)$/;

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  if (PREVIEW_ORIGIN_RE.test(origin)) return true;
  if (LOCAL_ORIGIN_RE.test(origin)) return true;
  return false;
}

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const allowed = isAllowedOrigin(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://appreneur.ai",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

const ALLOWED_EVENT_TYPES = new Set<string>([
  "quiz_started",
  "quiz_completed",
  "lead_captured",
]);

// Length limits — reject anything oversized/unexpected.
const MAX_STRING = 255;
const MAX_SESSION_ID = 64;
const MAX_EVENT_DATA_BYTES = 4 * 1024;
const MAX_BODY_BYTES = 16 * 1024;

function safeStr(v: unknown, max: number = MAX_STRING): string | null {
  if (v == null) return null;
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  if (t.length > max) return null;
  return t;
}

// Sliding-window in-memory rate limit, keyed by an HMAC of the caller's IP
// with a server secret. IPs themselves are never stored.
interface Bucket { count: number; windowStart: number; }
const rateBuckets = new Map<string, Bucket>();
const RL_WINDOW_MS = 60_000;
const RL_MAX = 20; // per key per minute

async function hmacKey(ip: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(ip));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

function clientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() ||
    "unknown"
  );
}

function bump(key: string): boolean {
  const now = Date.now();
  const b = rateBuckets.get(key);
  if (!b || now - b.windowStart >= RL_WINDOW_MS) {
    rateBuckets.set(key, { count: 1, windowStart: now });
    return true;
  }
  b.count += 1;
  return b.count <= RL_MAX;
}

// Occasional cleanup so the map can't grow forever.
function maybeCleanup() {
  if (rateBuckets.size < 4096) return;
  const now = Date.now();
  for (const [k, b] of rateBuckets) {
    if (now - b.windowStart >= RL_WINDOW_MS * 2) rateBuckets.delete(k);
  }
}

serve(async (req: Request) => {
  const headers = corsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  const origin = req.headers.get("Origin") || "";
  if (!isAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: "forbidden" }), {
      status: 403,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  const rlSecret = Deno.env.get("FUNNEL_RATE_LIMIT_SECRET") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!rlSecret || !supabaseUrl || !serviceKey) {
    // Fail closed — do NOT silently weaken the rate limit.
    console.error("[track-funnel-event] missing FUNNEL_RATE_LIMIT_SECRET or supabase env");
    return new Response(JSON.stringify({ error: "unavailable" }), {
      status: 503,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  // Body size guard before parsing JSON.
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_body" }), {
      status: 400,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
  if (rawBody.length > MAX_BODY_BYTES) {
    return new Response(JSON.stringify({ error: "payload_too_large" }), {
      status: 413,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>;
    if (!body || typeof body !== "object") throw new Error("not object");
  } catch {
    return new Response(JSON.stringify({ error: "invalid_body" }), {
      status: 400,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  // Reject unknown top-level fields.
  const ALLOWED_FIELDS = new Set([
    "event_type",
    "session_id",
    "event_data",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "fb_ad_id",
  ]);
  for (const k of Object.keys(body)) {
    if (!ALLOWED_FIELDS.has(k)) {
      return new Response(JSON.stringify({ error: "bad_request" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }
  }

  const eventType = safeStr(body.event_type, 64);
  if (!eventType || !ALLOWED_EVENT_TYPES.has(eventType)) {
    return new Response(JSON.stringify({ error: "bad_request" }), {
      status: 400,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  const sessionId = safeStr(body.session_id, MAX_SESSION_ID);
  if (!sessionId) {
    return new Response(JSON.stringify({ error: "bad_request" }), {
      status: 400,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  // event_data: allow only a small, bounded object.
  let eventData: Record<string, unknown> = {};
  if (body.event_data !== undefined) {
    if (
      typeof body.event_data !== "object" ||
      body.event_data === null ||
      Array.isArray(body.event_data)
    ) {
      return new Response(JSON.stringify({ error: "bad_request" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }
    const serialized = JSON.stringify(body.event_data);
    if (serialized.length > MAX_EVENT_DATA_BYTES) {
      return new Response(JSON.stringify({ error: "bad_request" }), {
        status: 400,
        headers: { ...headers, "Content-Type": "application/json" },
      });
    }
    eventData = body.event_data as Record<string, unknown>;
  }

  const utmSource = safeStr(body.utm_source);
  const utmMedium = safeStr(body.utm_medium);
  const utmCampaign = safeStr(body.utm_campaign);
  const utmContent = safeStr(body.utm_content);
  const fbAdId = safeStr(body.fb_ad_id);

  // Rate limit — HMAC of IP with server secret; never store the IP.
  const ip = clientIp(req);
  let rlKey: string;
  try {
    rlKey = await hmacKey(ip, rlSecret);
  } catch (err) {
    console.error("[track-funnel-event] hmac error", err);
    return new Response(JSON.stringify({ error: "unavailable" }), {
      status: 503,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }
  maybeCleanup();
  if (!bump(rlKey)) {
    return new Response(JSON.stringify({ error: "rate_limited" }), {
      status: 429,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  const service = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await service.from("funnel_events").insert({
    session_id: sessionId,
    event_type: eventType,
    event_data: eventData,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_content: utmContent,
    fb_ad_id: fbAdId,
  });

  if (error) {
    console.error("[track-funnel-event] insert error", error);
    return new Response(JSON.stringify({ error: "internal_error" }), {
      status: 500,
      headers: { ...headers, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 202,
    headers: { ...headers, "Content-Type": "application/json" },
  });
});