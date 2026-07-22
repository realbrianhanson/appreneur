import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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

// Simple in-memory cache
const cache = new Map<string, { data: unknown; expiry: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

serve(async (req: Request) => {
  const corsHeaders = buildCors(req);
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    let body: Record<string, unknown> = {};
    if (req.method === "POST") {
      try { body = await req.json(); } catch { body = {}; }
    }
    const featured =
      url.searchParams.get("featured") === "true" || body.featured === true;
    const limit = Math.min(
      50,
      Math.max(1, parseInt(String(body.limit ?? url.searchParams.get("limit") ?? "20")))
    );
    const offset = Math.max(
      0,
      parseInt(String(body.offset ?? url.searchParams.get("offset") ?? "0"))
    );
    const minRating = Math.max(
      0,
      parseInt(String(body.min_rating ?? url.searchParams.get("min_rating") ?? "0"))
    );

    // Generate cache key
    const cacheKey = `testimonials_${featured}_${limit}_${offset}_${minRating}`;

    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      return new Response(JSON.stringify(cached.data), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "X-Cache": "HIT",
        },
      });
    }

    // Use anon key — RLS already restricts SELECT to approved testimonials
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    // Service-role client only used to mint short-lived signed URLs for
    // approved screenshots — never exposes unapproved rows.
    const signer = createClient(supabaseUrl, serviceKey);

    // Build query
    let query = supabase
      .from("testimonials")
      .select(
        "id, name, content, rating, app_name, app_screenshot_url, app_screenshot_path, is_featured, created_at",
        { count: "exact" }
      )
      .eq("is_approved", true);

    if (featured) {
      query = query.eq("is_featured", true);
    }

    if (minRating > 0) {
      query = query.gte("rating", minRating);
    }

    // Order: featured first, then by created_at
    query = query
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: testimonials, count, error } = await query;

    if (error) {
      throw error;
    }

    // Resolve screenshots: sign object paths for approved rows, keep legacy
    // full URLs as-is. Never sign a path for an unapproved row (RLS above
    // already excluded them, but be explicit).
    const SIGN_TTL = 300; // 5 minutes
    const resolved = await Promise.all(
      (testimonials || []).map(async (t: Record<string, unknown>) => {
        const path = (t.app_screenshot_path as string | null) ?? null;
        const legacy = (t.app_screenshot_url as string | null) ?? null;
        let screenshot: string | null = null;
        if (path) {
          const { data: signed } = await signer.storage
            .from("app-screenshots")
            .createSignedUrl(path, SIGN_TTL);
          screenshot = signed?.signedUrl ?? null;
        } else if (legacy && /^https?:\/\//i.test(legacy)) {
          screenshot = legacy;
        }
        return {
          id: t.id,
          name: t.name,
          content: t.content,
          rating: t.rating,
          app_name: t.app_name,
          app_screenshot_url: screenshot,
          is_featured: t.is_featured,
          created_at: t.created_at,
        };
      })
    );

    // Get completion count for stats
    const { count: completedCount } = await supabase
      .from("user_progress")
      .select("*", { count: "exact", head: true })
      .eq("day_number", 7)
      .eq("is_completed", true);

    const response = {
      testimonials: resolved,
      total: count || 0,
      hasMore: offset + limit < (count || 0),
      completedCount: completedCount || 0,
    };

    // Update cache
    cache.set(cacheKey, {
      data: response,
      expiry: Date.now() + CACHE_DURATION,
    });

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
