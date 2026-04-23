import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

async function sendResendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // TODO: Verify this domain in Resend dashboard before going live
      from: "Appreneur Challenge <hello@appreneur.ai>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }

  return response.json();
}

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

// Email templates
const templates = {
  welcome: (data: { firstName: string; loginUrl: string; cohortStartDate: string }) => ({
    subject: "Welcome to the Appreneur Challenge! 🚀",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to the Appreneur Challenge</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-size: 28px; font-weight: bold; color: #ffffff; margin: 0;">
        ⚡ Appreneur Challenge
      </h1>
    </div>
    
    <!-- Main Content -->
    <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px; padding: 32px;">
      <h2 style="font-size: 24px; margin: 0 0 16px 0; color: #ffffff;">
        Welcome, ${data.firstName}! 🎉
      </h2>
      
      <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin: 0 0 24px 0;">
        You're officially registered for the 5-Day Appreneur Challenge! Get ready to build your first app — no coding required.
      </p>
      
      <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="font-size: 14px; color: #a1a1aa; margin: 0 0 8px 0;">Challenge starts:</p>
        <p style="font-size: 18px; font-weight: bold; color: #8b5cf6; margin: 0;">
          ${data.cohortStartDate}
        </p>
      </div>
      
      <h3 style="font-size: 18px; color: #ffffff; margin: 0 0 16px 0;">
        Your Free Bonus Is Ready! 🎁
      </h3>
      
      <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin: 0 0 24px 0;">
        As promised, here's your exclusive PDF: <strong style="color: #ffffff;">"50 Profitable AI App Ideas for 2026"</strong>
      </p>
      
      <a href="${data.loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; margin-bottom: 24px;">
        Access Your Dashboard →
      </a>
      
      <div style="border-top: 1px solid rgba(255, 255, 255, 0.1); margin-top: 32px; padding-top: 24px;">
        <h3 style="font-size: 16px; color: #ffffff; margin: 0 0 12px 0;">
          What to do next:
        </h3>
        <ol style="font-size: 14px; line-height: 1.8; color: #a1a1aa; margin: 0; padding-left: 20px;">
          <li>Download your "50 AI App Ideas" PDF from the dashboard</li>
          <li>Add the challenge start date to your calendar</li>
          <li><a href="https://www.facebook.com/groups/918528500613193" style="color: #8b5cf6; text-decoration: underline;">Join our community</a> and introduce yourself</li>
          <li>Get excited — you're about to build something amazing!</li>
        </ol>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 40px; color: #71717a; font-size: 12px;">
      <p style="margin: 0 0 8px 0;">
        © 2026 AI For Beginners. All rights reserved.
      </p>
      <p style="margin: 0;">
        You're receiving this because you registered for the Appreneur Challenge.
      </p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  vip_confirmation: (data: { firstName: string; loginUrl: string }) => ({
    subject: "Your VIP Access is Ready! 👑",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VIP Access Confirmed</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-size: 28px; font-weight: bold; color: #ffffff; margin: 0;">
        ⚡ Appreneur Challenge
      </h1>
    </div>
    
    <!-- Main Content -->
    <div style="background: linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(251, 191, 36, 0.1) 100%); border: 1px solid rgba(234, 179, 8, 0.4); border-radius: 16px; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-size: 48px;">👑</span>
      </div>
      
      <h2 style="font-size: 24px; margin: 0 0 16px 0; color: #ffffff; text-align: center;">
        Welcome to VIP, ${data.firstName}!
      </h2>
      
      <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin: 0 0 24px 0; text-align: center;">
        Your upgrade is confirmed. You now have access to exclusive resources that will accelerate your app-building journey.
      </p>
      
      <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 style="font-size: 16px; color: #fbbf24; margin: 0 0 16px 0;">
          Your VIP Bundle Includes:
        </h3>
        <ul style="font-size: 14px; line-height: 1.8; color: #ffffff; margin: 0; padding-left: 20px;">
          <li><strong>Done-For-You App Templates</strong> - Skip the setup, start building</li>
          <li><strong>Advanced Prompt Vault</strong> - 100+ battle-tested prompts</li>
          <li><strong>Ship It Kit</strong> - Launch checklist & first 100 users playbook</li>
          <li><strong>Priority Support</strong> - Get unstuck fast with VIP assistance</li>
          <li><strong>3-Day AI For Business Event</strong> - Live training sessions</li>
        </ul>
      </div>
      
      <div style="text-align: center;">
        <a href="${data.loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #eab308 0%, #fbbf24 100%); color: #000000; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
          Access VIP Resources →
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 40px; color: #71717a; font-size: 12px;">
      <p style="margin: 0 0 8px 0;">
        © 2026 AI For Beginners. All rights reserved.
      </p>
      <p style="margin: 0;">
        Questions? Reply to this email for VIP support.
      </p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  day_unlock: (data: { firstName: string; dayNumber: number; missionTitle: string; loginUrl: string }) => ({
    subject: `Day ${data.dayNumber}: ${data.missionTitle} 🚀`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Day ${data.dayNumber} is Live!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-size: 28px; font-weight: bold; color: #ffffff; margin: 0;">
        ⚡ Appreneur Challenge
      </h1>
    </div>
    
    <!-- Main Content -->
    <div style="background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; font-size: 14px; font-weight: 600; padding: 8px 16px; border-radius: 9999px;">
          DAY ${data.dayNumber} OF 5
        </span>
      </div>
      
      <h2 style="font-size: 24px; margin: 0 0 16px 0; color: #ffffff; text-align: center;">
        ${data.missionTitle}
      </h2>
      
      <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin: 0 0 24px 0; text-align: center;">
        Hey ${data.firstName}! Your Day ${data.dayNumber} mission is now unlocked. Let's keep the momentum going!
      </p>
      
      <div style="text-align: center;">
        <a href="${data.loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
          Start Today's Mission →
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 40px; color: #71717a; font-size: 12px;">
      <p style="margin: 0;">
        © 2026 AI For Beginners. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `,
  }),

  completion: (data: { firstName: string; loginUrl: string }) => ({
    subject: "🎉 You Did It! Your Certificate Is Ready",
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Congratulations!</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0a0f; color: #ffffff;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="font-size: 28px; font-weight: bold; color: #ffffff; margin: 0;">
        ⚡ Appreneur Challenge
      </h1>
    </div>
    
    <!-- Main Content -->
    <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%); border: 1px solid rgba(34, 197, 94, 0.4); border-radius: 16px; padding: 32px; text-align: center;">
      <span style="font-size: 64px;">🎓</span>
      
      <h2 style="font-size: 28px; margin: 24px 0 16px 0; color: #ffffff;">
        Congratulations, ${data.firstName}!
      </h2>
      
      <p style="font-size: 18px; line-height: 1.6; color: #22c55e; margin: 0 0 24px 0; font-weight: 600;">
        You've completed the 5-Day Appreneur Challenge!
      </p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #a1a1aa; margin: 0 0 32px 0;">
        You did what most people only dream of — you built a real, working app. That's not just an achievement, it's the start of something bigger.
      </p>
      
      <div style="background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 style="font-size: 18px; color: #ffffff; margin: 0 0 12px 0;">
          🎁 Your Completion Rewards:
        </h3>
        <ul style="font-size: 14px; line-height: 1.8; color: #ffffff; margin: 0; padding-left: 20px; text-align: left;">
          <li>Digital Certificate of Completion</li>
          <li>Exclusive invite to 3-Day AI For Business Event</li>
          <li>Lifetime access to challenge materials</li>
        </ul>
      </div>
      
      <a href="${data.loginUrl}" style="display: inline-block; background: linear-gradient(135deg, #22c55e 0%, #10b981 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
        Get Your Certificate →
      </a>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; margin-top: 40px; color: #71717a; font-size: 12px;">
      <p style="margin: 0;">
        © 2026 AI For Beginners. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
    `,
  }),
};

interface EmailRequest {
  template: "welcome" | "vip_confirmation" | "day_unlock" | "completion";
  to: string;
  data: Record<string, unknown>;
}

const handler = async (req: Request): Promise<Response> => {
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
    // Auth: only service-role (server-to-server) or authenticated admin users can send email
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization") ?? "";
    const bearer = authHeader.replace(/^Bearer\s+/i, "");
    const isServiceRole = bearer && bearer === supabaseServiceKey;

    if (!isServiceRole) {
      if (!bearer) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${bearer}` } },
      });
      const { data: userData, error: userErr } = await userClient.auth.getUser();
      if (userErr || !userData?.user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const { data: isAdmin } = await userClient.rpc("is_admin", { _user_id: userData.user.id });
      if (!isAdmin) {
        return new Response(
          JSON.stringify({ error: "Forbidden: admin role required" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const { template, to, data }: EmailRequest = await req.json();

    if (!template || !to || !data) {
      return new Response(
        JSON.stringify({ error: "template, to, and data are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const templateFn = templates[template];
    if (!templateFn) {
      return new Response(
        JSON.stringify({ error: `Unknown template: ${template}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailContent = templateFn(data as any);

    // Send email via Resend using fetch
    const emailResponse = await sendResendEmail(
      to,
      emailContent.subject,
      emailContent.html
    );

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
