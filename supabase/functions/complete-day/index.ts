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

serve(async (req) => {
  const corsHeaders = buildCors(req);
  // Handle CORS preflight
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
    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { day_number, time_spent_seconds } = await req.json();

    if (!day_number) {
      return new Response(
        JSON.stringify({ error: "day_number is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (day_number < 1 || day_number > 5) {
      return new Response(
        JSON.stringify({ error: "day_number must be between 1 and 5" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if day is unlocked
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

    if (!dayProgress.is_unlocked) {
      return new Response(
        JSON.stringify({ error: "This day is not unlocked yet" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark day as complete
    const { error: updateError } = await supabase
      .from("user_progress")
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
        time_spent_seconds: (dayProgress.time_spent_seconds || 0) + (time_spent_seconds || 0),
      })
      .eq("user_id", user.id)
      .eq("day_number", day_number);

    if (updateError) {
      console.error("Error updating day progress:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to complete day" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Unlock next day if not the last day
    let nextDayUnlocked = false;
    if (day_number < 5) {
      const { error: unlockError } = await supabase
        .from("user_progress")
        .update({ is_unlocked: true })
        .eq("user_id", user.id)
        .eq("day_number", day_number + 1);

      if (!unlockError) {
        nextDayUnlocked = true;
      }
    }

    // Check if this was the final day
    const isGraduation = day_number === 5;

    // Compute fresh stats so the client doesn't have to guess streak.
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
