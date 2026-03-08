import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SchedulerRequest {
  trigger_type: 'cohort_reminder' | 'daily_unlock' | 'missed_day' | 'completion_check';
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { trigger_type } = await req.json() as SchedulerRequest;
    const results: { sent: number; errors: string[] } = { sent: 0, errors: [] };

    const sendSmsUrl = `${supabaseUrl}/functions/v1/send-sms`;

    if (trigger_type === 'cohort_reminder') {
      // Find users in cohorts starting tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const dayAfter = new Date(tomorrow);
      dayAfter.setDate(dayAfter.getDate() + 1);

      const { data: cohorts } = await supabase
        .from('cohorts')
        .select('id')
        .gte('start_date', tomorrow.toISOString())
        .lt('start_date', dayAfter.toISOString());

      if (cohorts && cohorts.length > 0) {
        const cohortIds = cohorts.map(c => c.id);
        
        const { data: users } = await supabase
          .from('profiles')
          .select('id, phone')
          .in('cohort_id', cohortIds)
          .not('phone', 'is', null);

        for (const user of users || []) {
          try {
            const response = await fetch(sendSmsUrl, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                user_id: user.id,
                message_type: 'cohort_reminder',
              }),
            });
            
            if (response.ok) {
              results.sent++;
            } else {
              const error = await response.json();
              results.errors.push(`User ${user.id}: ${error.error}`);
            }
          } catch (e: unknown) {
            const errorMsg = e instanceof Error ? e.message : 'Unknown error';
            results.errors.push(`User ${user.id}: ${errorMsg}`);
          }
        }
      }
    }

    if (trigger_type === 'daily_unlock') {
      // Find users in active cohorts who haven't completed today's mission
      const today = new Date();
      
      const { data: activeCohorts } = await supabase
        .from('cohorts')
        .select('id, start_date')
        .lte('start_date', today.toISOString())
        .eq('is_active', true);

      for (const cohort of activeCohorts || []) {
        const startDate = new Date(cohort.start_date);
        const dayNumber = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        if (dayNumber < 1 || dayNumber > 5) continue;

        // Get users in this cohort with phones who haven't completed this day
        const { data: users } = await supabase
          .from('profiles')
          .select(`
            id, 
            phone,
            user_progress!inner(day_number, is_completed)
          `)
          .eq('cohort_id', cohort.id)
          .not('phone', 'is', null);

        for (const user of users || []) {
          const dayProgress = (user.user_progress as any[])?.find(
            (p: any) => p.day_number === dayNumber
          );
          
          if (dayProgress?.is_completed) continue;

          try {
            const response = await fetch(sendSmsUrl, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                user_id: user.id,
                message_type: 'daily_unlock',
                day_number: dayNumber,
              }),
            });
            
            if (response.ok) {
              results.sent++;
            } else {
              const error = await response.json();
              results.errors.push(`User ${user.id}: ${error.error}`);
            }
          } catch (e: unknown) {
            const errorMsg = e instanceof Error ? e.message : 'Unknown error';
            results.errors.push(`User ${user.id}: ${errorMsg}`);
          }
        }
      }
    }

    if (trigger_type === 'missed_day') {
      // Find users who haven't completed today's mission and last activity >24h ago
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const { data: activeCohorts } = await supabase
        .from('cohorts')
        .select('id, start_date')
        .lte('start_date', now.toISOString())
        .eq('is_active', true);

      for (const cohort of activeCohorts || []) {
        const startDate = new Date(cohort.start_date);
        const dayNumber = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        if (dayNumber < 1 || dayNumber > 7) continue;

        const { data: users } = await supabase
          .from('profiles')
          .select(`
            id, 
            phone,
            user_progress(day_number, is_completed, updated_at)
          `)
          .eq('cohort_id', cohort.id)
          .not('phone', 'is', null);

        for (const user of users || []) {
          const progress = user.user_progress as any[];
          const dayProgress = progress?.find((p: any) => p.day_number === dayNumber);
          
          if (dayProgress?.is_completed) continue;

          // Check last activity
          const lastActivity = progress?.reduce((latest: Date | null, p: any) => {
            const updated = new Date(p.updated_at);
            return !latest || updated > latest ? updated : latest;
          }, null);

          if (lastActivity && lastActivity > yesterday) continue;

          try {
            const response = await fetch(sendSmsUrl, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                user_id: user.id,
                message_type: 'missed_day',
                day_number: dayNumber,
              }),
            });
            
            if (response.ok) {
              results.sent++;
            } else {
              const error = await response.json();
              results.errors.push(`User ${user.id}: ${error.error}`);
            }
          } catch (e: unknown) {
            const errorMsg = e instanceof Error ? e.message : 'Unknown error';
            results.errors.push(`User ${user.id}: ${errorMsg}`);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        trigger_type,
        sent: results.sent,
        errors: results.errors.length > 0 ? results.errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Scheduler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});