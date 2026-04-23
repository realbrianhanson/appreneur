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

// Resources flagged as VIP-only. Anything not in this set is available to any
// authenticated user. Keep this in sync with the frontend resource catalog.
const VIP_ONLY_PREFIXES = [
  "vip/",
  "prompt-vault/",
  "ship-it-kit/",
];

function isVipResource(key: string): boolean {
  return VIP_ONLY_PREFIXES.some((p) => key.startsWith(p));
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

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    // Validate input
    let body: { resource_key?: unknown };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const resourceKey = typeof body.resource_key === "string" ? body.resource_key.trim() : "";
    if (!resourceKey || resourceKey.includes("..") || resourceKey.startsWith("/")) {
      return new Response(JSON.stringify({ error: "Invalid resource_key" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Service-role client for VIP check + signed URL
    const adminClient = createClient(supabaseUrl, serviceKey);

    // VIP gate
    if (isVipResource(resourceKey)) {
      const { data: profile, error: profileErr } = await adminClient
        .from("profiles")
        .select("is_vip")
        .eq("id", userId)
        .maybeSingle();

      if (profileErr) {
        console.error("Profile lookup failed:", profileErr);
        return new Response(JSON.stringify({ error: "Profile lookup failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!profile?.is_vip) {
        return new Response(JSON.stringify({ error: "VIP membership required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Generate a signed URL valid for 5 minutes
    const { data: signed, error: signErr } = await adminClient.storage
      .from("challenge-resources")
      .createSignedUrl(resourceKey, 300);

    if (signErr || !signed?.signedUrl) {
      return new Response(
        JSON.stringify({ error: "Resource not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the download (best-effort)
    try {
      await adminClient.from("downloads").insert({
        user_id: userId,
        resource_key: resourceKey,
        user_agent: req.headers.get("user-agent") || null,
      });
    } catch (e) {
      console.error("Failed to log download:", e);
    }

    return new Response(
      JSON.stringify({ url: signed.signedUrl, expires_in: 300 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("get-resource-url error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});