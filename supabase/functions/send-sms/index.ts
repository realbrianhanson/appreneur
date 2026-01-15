import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SMSRequest {
  user_id?: string;
  phone?: string;
  message_type: 'cohort_reminder' | 'daily_unlock' | 'missed_day' | 'completion' | 'event_reminder' | 'custom';
  custom_message?: string;
  day_number?: number;
}

const messageTemplates: Record<string, (data: { name: string; day?: number; link: string }) => string> = {
  cohort_reminder: ({ name }) => 
    `Hey ${name}! The Appreneur Challenge starts TOMORROW at 10am EST. Get ready to build your first app! 🚀`,
  
  daily_unlock: ({ name, day, link }) => {
    const messages: Record<number, string> = {
      1: `${name}, Day 1 is LIVE! Today you'll find your winning app idea. Let's go → ${link}`,
      2: `${name}, Day 2 unlocked! Time to validate your idea with real data. → ${link}`,
      3: `Day 3: Time to BUILD. Today your app comes to life. → ${link}`,
      4: `${name}, Day 4! Add AI features that make your app stand out. → ${link}`,
      5: `Day 5: Polish time! Make your app beautiful and user-friendly. → ${link}`,
      6: `${name}, Day 6: Get ready for launch! Final testing today. → ${link}`,
      7: `🚀 SHIP DAY! This is it. Deploy your app and show the world. → ${link}`,
    };
    return messages[day || 1] || `${name}, your daily mission is ready! → ${link}`;
  },
  
  missed_day: ({ name, day, link }) => 
    `Hey ${name}, you're falling behind on Day ${day}. It's only 60 minutes to catch up. Don't let your app idea die. → ${link}`,
  
  completion: ({ name, link }) => 
    `🎉 YOU DID IT ${name}! Your app is LIVE. Share it with the world and join us at the 3-Day Event to learn how to get users. → ${link}`,
  
  event_reminder: ({ link }) => 
    `Reminder: AI For Business Live starts tomorrow at 11am EST. Don't miss it! → ${link}`,
};

async function sendTwilioSMS(to: string, body: string): Promise<{ success: boolean; sid?: string; error?: string }> {
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

  if (!accountSid || !authToken || !fromNumber) {
    return { success: false, error: 'Twilio credentials not configured' };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber,
          Body: body,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || 'Failed to send SMS' };
    }

    return { success: true, sid: data.sid };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, phone, message_type, custom_message, day_number } = await req.json() as SMSRequest;

    let userPhone = phone;
    let userName = 'there';

    // If user_id provided, look up their info
    if (user_id) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('phone, first_name')
        .eq('id', user_id)
        .single();

      if (profileError || !profile) {
        return new Response(
          JSON.stringify({ success: false, error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!profile.phone) {
        return new Response(
          JSON.stringify({ success: false, error: 'User has no phone number' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userPhone = profile.phone;
      userName = profile.first_name || 'there';
    }

    if (!userPhone) {
      return new Response(
        JSON.stringify({ success: false, error: 'No phone number provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit - max 1 SMS per user per day (except Day 7)
    if (user_id && day_number !== 7) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: recentSMS } = await supabase
        .from('sms_logs')
        .select('id')
        .eq('user_id', user_id)
        .eq('status', 'sent')
        .gte('sent_at', today.toISOString())
        .limit(1);

      if (recentSMS && recentSMS.length > 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit: max 1 SMS per day' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Generate message
    const dashboardLink = Deno.env.get('APP_URL') || 'https://appreneur.ai/dashboard';
    let messageBody: string;

    if (custom_message) {
      messageBody = custom_message;
    } else if (message_type === 'custom') {
      return new Response(
        JSON.stringify({ success: false, error: 'Custom message required for custom type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const template = messageTemplates[message_type];
      if (!template) {
        return new Response(
          JSON.stringify({ success: false, error: 'Unknown message type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      messageBody = template({ name: userName, day: day_number, link: dashboardLink });
    }

    // Send SMS via Twilio
    const result = await sendTwilioSMS(userPhone, messageBody);

    // Log to database
    const { error: logError } = await supabase
      .from('sms_logs')
      .insert({
        user_id: user_id || null,
        phone: userPhone,
        message_type,
        message_body: messageBody,
        status: result.success ? 'sent' : 'failed',
        provider_message_id: result.sid || null,
        error_message: result.error || null,
        sent_at: result.success ? new Date().toISOString() : null,
      });

    if (logError) {
      console.error('Failed to log SMS:', logError);
    }

    return new Response(
      JSON.stringify({
        success: result.success,
        twilio_sid: result.sid,
        error: result.error,
      }),
      { 
        status: result.success ? 200 : 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    console.error('SMS function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});