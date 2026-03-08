import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Define required tasks for each day
const dayTasks: Record<number, string[]> = {
  1: ["watch_video", "define_idea", "create_wireframe", "share_community"],
  2: ["watch_video", "setup_project", "build_layout", "add_navigation"],
  3: ["watch_video", "add_features", "connect_data", "test_app"],
  4: ["watch_video", "add_ai_feature", "refine_prompts", "integrate_ai"],
  5: ["watch_video", "deploy_app", "launch_app", "share_success"],
};

serve(async (req) => {
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
    const { day_number, task_id } = await req.json();

    if (!day_number || !task_id) {
      return new Response(
        JSON.stringify({ error: "day_number and task_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (day_number < 1 || day_number > 7) {
      return new Response(
        JSON.stringify({ error: "day_number must be between 1 and 7" }),
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

    // Get required tasks for this day
    const requiredTasks = dayTasks[day_number] || [];

    // Call the complete_task function
    const { data: result, error: completeError } = await supabase.rpc("complete_task", {
      p_user_id: user.id,
      p_day_number: day_number,
      p_task_id: task_id,
      p_required_tasks: requiredTasks,
    });

    if (completeError) {
      console.error("Error completing task:", completeError);
      return new Response(
        JSON.stringify({ error: "Failed to complete task" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        result,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in complete-task:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
