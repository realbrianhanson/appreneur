import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set<string>([
  "https://appreneur.lovable.app",
  "https://appreneur.ai",
  "https://www.appreneur.ai",
  "http://localhost:5173",
  "http://localhost:8080",
]);
const PREVIEW_ORIGIN_RE =
  /^https:\/\/(?:id-preview--)?[a-z0-9-]+\.(?:lovable\.app|lovableproject\.com)$/;

function buildCors(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") || "";
  const allowed =
    ALLOWED_ORIGINS.has(origin) || PREVIEW_ORIGIN_RE.test(origin);
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://appreneur.ai",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

serve(async (req) => {
  const corsHeaders = buildCors(req);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
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

    // Fetch user's progress
    const { data: progress, error: progressError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .order("day_number", { ascending: true });

    if (progressError) {
      console.error("[get-progress] fetch error", progressError);
      return new Response(
        JSON.stringify({ error: "internal_error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no progress exists, initialize it
    if (!progress || progress.length === 0) {
      // Server derives user id from the caller's JWT (auth.uid()).
      const { error: initError } = await supabase.rpc("initialize_user_progress");

      if (initError) {
        console.error("[get-progress] init error", initError);
        return new Response(
          JSON.stringify({ error: "internal_error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Fetch the newly created progress
      const { data: newProgress, error: newProgressError } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .order("day_number", { ascending: true });

      if (newProgressError) {
        console.error("[get-progress] refetch error", newProgressError);
        return new Response(
          JSON.stringify({ error: "internal_error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ progress: newProgress }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user stats as well
    const { data: stats, error: statsError } = await supabase.rpc("get_user_stats", {
      p_user_id: user.id,
    });

    return new Response(
      JSON.stringify({ 
        progress,
        stats: statsError ? null : stats,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[get-progress] handler error", error);
    return new Response(
      JSON.stringify({ error: "internal_error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
