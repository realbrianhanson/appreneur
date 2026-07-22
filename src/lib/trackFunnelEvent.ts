/**
 * Client helper for the public `track-funnel-event` edge function. Replaces
 * direct anon writes into `public.funnel_events` — those inserts are now
 * rejected by RLS/GRANTs.
 *
 * Fire-and-forget: failures are swallowed after logging. We NEVER block
 * the user's UI on funnel telemetry.
 */
import { supabase } from "@/integrations/supabase/client";

export type PublicFunnelEventType =
  | "quiz_started"
  | "quiz_completed"
  | "lead_captured";

export interface FunnelEventPayload {
  session_id: string;
  event_type: PublicFunnelEventType;
  event_data?: Record<string, unknown>;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  fb_ad_id?: string | null;
}

export async function trackFunnelEvent(
  payload: FunnelEventPayload,
): Promise<{ ok: boolean }> {
  try {
    const { error } = await supabase.functions.invoke("track-funnel-event", {
      body: payload,
    });
    if (error) {
      // Do NOT surface internal details to the caller — the endpoint only
      // returns generic errors and there's nothing the UI should do.
      console.warn("track-funnel-event failed");
      return { ok: false };
    }
    return { ok: true };
  } catch {
    console.warn("track-funnel-event failed");
    return { ok: false };
  }
}