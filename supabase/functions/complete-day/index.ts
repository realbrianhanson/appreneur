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

// Max time we accept per invocation. Keeps a bad client from padding
// the timer, and caps the field far below any plausible legitimate run.
const MAX_TIME_PER_CALL_S = 4 * 60 * 60; // 4 hours
// Absolute upper bound stored on a row; further increments are ignored.
const MAX_TOTAL_TIME_S = 24 * 60 * 60; // 24 hours per day

serve(async (req) => {
  const corsHeaders = buildCors(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { day_number, time_spent_seconds } = await req.json();

    if (typeof day_number !== "number" || !Number.isInteger(day_number)) {
      return new Response(
        JSON.stringify({ error: "day_number must be an integer" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (day_number < 1 || day_number > 5) {
      return new Response(
        JSON.stringify({ error: "day_number must be between 1 and 5" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Load the row via the anon client so RLS still applies to reads.
    const { data: dayProgress, error: dayError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("day_number", day_number)
      .single();

    if (dayError || !dayProgress) {
      return new Response(
        JSON.stringify({ error: "Day progress not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // This endpoint is intentionally non-authoritative. The only path
    // that can mark a day complete is public.complete_task after every
    // canonical required task has been checked off. If that has not
    // already happened, refuse the request.
    if (!dayProgress.is_completed || !dayProgress.completed_at) {
      return new Response(
        JSON.stringify({
          error: "Day not yet completed",
          detail: "Finish all required tasks first — completion is server-authoritative.",
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Safely record time. Cap per-call and per-row. Skip when the client
    // sent nothing so repeated calls (e.g. accidental retries) are idempotent.
    let addSeconds = 0;
    if (
      typeof time_spent_seconds === "number" &&
      Number.isFinite(time_spent_seconds) &&
      time_spent_seconds > 0
    ) {
      addSeconds = Math.floor(Math.min(time_spent_seconds, MAX_TIME_PER_CALL_S));
    }

    if (addSeconds > 0) {
      const currentTotal = dayProgress.time_spent_seconds || 0;
      const nextTotal = Math.min(currentTotal + addSeconds, MAX_TOTAL_TIME_S);
      if (nextTotal !== currentTotal) {
        // Use admin client because the gating trigger only allows the
        // service role to touch progress rows freely; time_spent_seconds
        // itself is safe via RLS but a single admin path keeps this simple.
        const { error: timeError } = await admin
          .from("user_progress")
          .update({ time_spent_seconds: nextTotal, updated_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .eq("day_number", day_number);
        if (timeError) {
          console.error("Error updating time_spent_seconds:", timeError);
        }
      }
    }

    // Report the *existing* completion/unlock state — this endpoint
    // never marks a day complete and never unlocks a next day.
    let nextDayUnlocked = false;
    if (day_number < 5) {
      const { data: nextRow } = await supabase
        .from("user_progress")
        .select("is_unlocked")
        .eq("user_id", user.id)
        .eq("day_number", day_number + 1)
        .maybeSingle();
      nextDayUnlocked = !!nextRow?.is_unlocked;
    }

    const isGraduation = day_number === 5;
    const { data: statsData } = await supabase.rpc("get_user_stats", { p_user_id: user.id });

    return new Response(
      JSON.stringify({
        success: true,
        day_completed: day_number,
        next_day_unlocked: nextDayUnlocked,
        is_graduation: isGraduation,
        stats: statsData ?? null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in complete-day:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
