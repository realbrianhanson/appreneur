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

async function deliverWebhook(
  supabase: any,
  endpoint: WebhookEndpoint,
  eventId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<{ success: boolean; status?: number; error?: string }> {
  const timestamp = new Date().toISOString();
  const body = JSON.stringify({
    event: eventType,
    data: payload,
    timestamp,
    event_id: eventId,
  });

  // Create delivery record
  const { data: delivery, error: deliveryError } = await supabase
    .from('webhook_deliveries')
    .insert({
      webhook_event_id: eventId,
      webhook_endpoint_id: endpoint.id,
      status: 'pending',
      attempts: 1,
      last_attempt_at: timestamp,
    })
    .select('id')
    .single();

  if (deliveryError || !delivery) {
    console.error('Failed to create delivery record:', deliveryError);
    return { success: false, error: 'Failed to create delivery record' };
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Timestamp': timestamp,
      'X-Webhook-Event': eventType,
    };

    if (endpoint.secret) {
      const signature = await createHmacSignature(body, endpoint.secret);
      headers['X-Webhook-Signature'] = `sha256=${signature}`;
    }

    const response = await fetch(endpoint.url, {
      method: 'POST',
      headers,
      body,
    });

    const responseBody = await response.text().catch(() => '');
    const success = response.status >= 200 && response.status < 300;

    // Update delivery record
    await supabase
      .from('webhook_deliveries')
      .update({
        status: success ? 'delivered' : 'failed',
        response_status: response.status,
        response_body: responseBody.substring(0, 1000), // Limit response size
      })
      .eq('id', delivery.id);

    return { success, status: response.status };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Update delivery record with error
    await supabase
      .from('webhook_deliveries')
      .update({
        status: 'failed',
        response_body: errorMessage,
      })
      .eq('id', delivery.id);

    return { success: false, error: errorMessage };
  }
}

serve(async (req: Request) => {
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