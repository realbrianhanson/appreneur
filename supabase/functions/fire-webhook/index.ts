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
  const allow = ALLOWED_ORIGINS.has(origin) || /^https:\/\/id-preview--.*\.lovable\.app$/.test(origin)
    ? origin
    : "https://appreneur.ai";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

type WebhookEventType = 
  | 'user.registered'
  | 'user.waitlisted'
  | 'purchase.completed'
  | 'user.started_day'
  | 'user.completed_day'
  | 'user.completed_challenge'
  | 'testimonial.submitted';

interface WebhookRequest {
  event_type: WebhookEventType;
  payload: Record<string, unknown>;
}

interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string | null;
  events: string[];
  is_active: boolean;
}

async function createHmacSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const data = encoder.encode(payload);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// SSRF guard: HTTPS only; reject localhost, .local/.internal, loopback,
// link-local, and private IPv4/IPv6 destinations.
function isSafeWebhookUrl(input: string): { ok: true; url: URL } | { ok: false; reason: string } {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    return { ok: false, reason: 'invalid_url' };
  }
  if (parsed.protocol !== 'https:') return { ok: false, reason: 'https_required' };
  const host = parsed.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '0.0.0.0' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.localhost')
  ) {
    return { ok: false, reason: 'blocked_host' };
  }
  if (host.startsWith('[') && host.endsWith(']')) {
    const ip = host.slice(1, -1).toLowerCase();
    if (ip === '::1' || ip === '::' || ip.startsWith('fe80') || ip.startsWith('fc') || ip.startsWith('fd')) {
      return { ok: false, reason: 'blocked_ipv6' };
    }
  }
  const v4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const a = parseInt(v4[1], 10);
    const b = parseInt(v4[2], 10);
    if (
      a === 127 || a === 0 ||
      (a === 169 && b === 254) ||
      a === 10 ||
      (a === 192 && b === 168) ||
      (a === 172 && b >= 16 && b <= 31)
    ) {
      return { ok: false, reason: 'blocked_ipv4' };
    }
  }
  return { ok: true, url: parsed };
}

const DELIVERY_TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 3;

function shouldRetry(status: number | undefined, error?: string): boolean {
  if (error) return true; // network/abort error
  if (status === undefined) return true;
  if (status === 408 || status === 429) return true;
  if (status >= 500 && status < 600) return true;
  return false;
}

function withTimeout(ms: number): AbortSignal {
  const anyAbort = AbortSignal as unknown as { timeout?: (ms: number) => AbortSignal };
  if (typeof anyAbort.timeout === 'function') return anyAbort.timeout(ms);
  const c = new AbortController();
  setTimeout(() => c.abort(), ms);
  return c.signal;
}

async function deliverWebhook(
  supabase: any,
  endpoint: WebhookEndpoint,
  eventId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<{ success: boolean; status?: number; error?: string }> {
  // SSRF check immediately before delivery. Endpoints saved earlier may have
  // been valid at save time but must still pass now.
  const safety = isSafeWebhookUrl(endpoint.url);
  if (safety.ok === false) {
    const timestamp = new Date().toISOString();
    await supabase.from('webhook_deliveries').insert({
      webhook_event_id: eventId,
      webhook_endpoint_id: endpoint.id,
      status: 'failed',
      attempts: 0,
      last_attempt_at: timestamp,
      response_body: `blocked: ${safety.reason}`.slice(0, 200),
    });
    return { success: false, error: `blocked_${safety.reason}` };
  }

  const timestamp = new Date().toISOString();
  const body = JSON.stringify({
    event: eventType,
    data: payload,
    timestamp,
    event_id: eventId,
  });

  // Create delivery record. Attempt counter is updated after each try.
  const { data: delivery, error: deliveryError } = await supabase
    .from('webhook_deliveries')
    .insert({
      webhook_event_id: eventId,
      webhook_endpoint_id: endpoint.id,
      status: 'pending',
      attempts: 0,
      last_attempt_at: timestamp,
    })
    .select('id')
    .single();

  if (deliveryError || !delivery) {
    console.error('Failed to create delivery record:', deliveryError);
    return { success: false, error: 'Failed to create delivery record' };
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Webhook-Timestamp': timestamp,
    'X-Webhook-Event': eventType,
  };
  if (endpoint.secret) {
    const signature = await createHmacSignature(body, endpoint.secret);
    headers['X-Webhook-Signature'] = `sha256=${signature}`;
  }

  let lastStatus: number | undefined;
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    lastStatus = undefined;
    lastError = undefined;
    try {
      const response = await fetch(safety.url.toString(), {
        method: 'POST',
        headers,
        body,
        signal: withTimeout(DELIVERY_TIMEOUT_MS),
      });
      // Deliberately drop the response body — never store arbitrary bytes
      // from third-party endpoints. Discarding it also releases the socket.
      await response.body?.cancel().catch(() => {});
      lastStatus = response.status;
      const success = response.status >= 200 && response.status < 300;

      const isFinal = success || !shouldRetry(response.status) || attempt === MAX_ATTEMPTS;
      await supabase
        .from('webhook_deliveries')
        .update({
          status: success ? 'delivered' : isFinal ? 'failed' : 'pending',
          response_status: response.status,
          response_body: null,
          attempts: attempt,
          last_attempt_at: new Date().toISOString(),
        })
        .eq('id', delivery.id);

      if (success) return { success: true, status: response.status };
      if (!shouldRetry(response.status)) return { success: false, status: response.status };
    } catch (error: unknown) {
      lastError = error instanceof Error ? error.name : 'network_error';
      const isFinal = attempt === MAX_ATTEMPTS;
      await supabase
        .from('webhook_deliveries')
        .update({
          status: isFinal ? 'failed' : 'pending',
          response_body: lastError.slice(0, 200),
          attempts: attempt,
          last_attempt_at: new Date().toISOString(),
        })
        .eq('id', delivery.id);
    }
    // Bounded backoff before the next retry.
    if (attempt < MAX_ATTEMPTS) {
      const backoff = 250 * Math.pow(2, attempt - 1); // 250ms, 500ms
      await new Promise((r) => setTimeout(r, backoff));
    }
  }

  return { success: false, status: lastStatus, error: lastError };
}

serve(async (req: Request) => {
  const corsHeaders = buildCors(req);
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Auth: must be either (a) service-role caller, or (b) an authenticated admin user
    const authHeader = req.headers.get('Authorization') ?? '';
    const bearer = authHeader.replace(/^Bearer\s+/i, '');
    const isServiceRole = bearer && bearer === supabaseServiceKey;

    if (!isServiceRole) {
      if (!bearer) {
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${bearer}` } },
      });
      const { data: userData, error: userErr } = await userClient.auth.getUser();
      if (userErr || !userData?.user) {
        return new Response(
          JSON.stringify({ success: false, error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const { data: isAdmin } = await userClient.rpc('is_admin', { _user_id: userData.user.id });
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ success: false, error: 'Forbidden: admin role required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { event_type, payload } = await req.json() as WebhookRequest;

    if (!event_type || !payload) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing event_type or payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create webhook event record
    const { data: event, error: eventError } = await supabase
      .from('webhook_events')
      .insert({
        event_type,
        payload,
      })
      .select('id')
      .single();

    if (eventError || !event) {
      console.error('Failed to create event:', eventError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create event record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find all active endpoints subscribed to this event
    const { data: endpoints, error: endpointsError } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .eq('is_active', true)
      .contains('events', [event_type]);

    if (endpointsError) {
      console.error('Failed to fetch endpoints:', endpointsError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to fetch endpoints' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: { endpoint_id: string; success: boolean; status?: number; error?: string }[] = [];

    // Deliver to all subscribed endpoints
    for (const endpoint of (endpoints as WebhookEndpoint[]) || []) {
      const result = await deliverWebhook(supabase, endpoint, event.id, event_type, payload);
      results.push({
        endpoint_id: endpoint.id,
        ...result,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        event_id: event.id,
        deliveries: results.length,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Webhook function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});