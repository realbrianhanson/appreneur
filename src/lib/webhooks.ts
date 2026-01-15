import { supabase } from "@/integrations/supabase/client";

export type WebhookEventType = 
  | 'user.registered'
  | 'user.waitlisted'
  | 'purchase.completed'
  | 'user.started_day'
  | 'user.completed_day'
  | 'user.completed_challenge'
  | 'testimonial.submitted';

export interface WebhookPayloads {
  'user.registered': {
    user_id: string;
    email: string;
    first_name: string;
    cohort_id?: string;
    utm_params?: Record<string, string>;
    quiz_answers?: Record<string, string>;
  };
  'user.waitlisted': {
    email: string;
    first_name?: string;
    target_cohort?: string;
  };
  'purchase.completed': {
    user_id: string;
    product_type: string;
    amount_cents: number;
    currency: string;
    stripe_payment_id?: string;
  };
  'user.started_day': {
    user_id: string;
    day_number: number;
  };
  'user.completed_day': {
    user_id: string;
    day_number: number;
    completed_at: string;
  };
  'user.completed_challenge': {
    user_id: string;
    cohort_id?: string;
    app_url?: string;
  };
  'testimonial.submitted': {
    user_id: string;
    quote: string;
    rating?: number;
  };
}

export async function fireWebhook<T extends WebhookEventType>(
  eventType: T,
  payload: WebhookPayloads[T]
): Promise<{ success: boolean; event_id?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('fire-webhook', {
      body: {
        event_type: eventType,
        payload,
      },
    });

    if (error) {
      console.error('Webhook error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, event_id: data?.event_id };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Failed to fire webhook:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

export const WEBHOOK_EVENT_DESCRIPTIONS: Record<WebhookEventType, string> = {
  'user.registered': 'Fires when a new user signs up',
  'user.waitlisted': 'Fires when a user joins the waitlist',
  'purchase.completed': 'Fires when any purchase is completed',
  'user.started_day': 'Fires when a user begins a challenge day',
  'user.completed_day': 'Fires when a user finishes a challenge day',
  'user.completed_challenge': 'Fires when a user completes Day 7',
  'testimonial.submitted': 'Fires when a user submits a testimonial',
};

export const ALL_WEBHOOK_EVENTS: WebhookEventType[] = [
  'user.registered',
  'user.waitlisted',
  'purchase.completed',
  'user.started_day',
  'user.completed_day',
  'user.completed_challenge',
  'testimonial.submitted',
];