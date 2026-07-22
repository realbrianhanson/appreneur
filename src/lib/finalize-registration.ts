import { supabase } from "@/integrations/supabase/client";

export interface FinalizeRegistrationResponse {
  progress_ready: boolean;
  email_status: "sent" | "not_configured" | "failed" | "pending" | "skipped";
  webhook_status: "sent" | "failed" | "pending" | "skipped";
}

export interface FinalizeRegistrationInput {
  firstName?: string;
  quizAnswers?: Record<string, string>;
  utmParams?: Record<string, string>;
}

/**
 * Idempotently finalize a signed-in user's early-access registration:
 * initializes progress, claims + sends the welcome email once, and fires
 * user.registered once. Requires an active Supabase session (JWT).
 *
 * Callers must NOT pass email addresses / user ids in the body — identity is
 * derived from the JWT server-side.
 */
export async function finalizeRegistration(
  input: FinalizeRegistrationInput = {},
): Promise<{ ok: boolean; data?: FinalizeRegistrationResponse; error?: string }> {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    return { ok: false, error: "no_session" };
  }
  try {
    const { data, error } = await supabase.functions.invoke(
      "finalize-registration",
      {
        body: {
          first_name: input.firstName,
          quiz_answers: input.quizAnswers,
          utm_params: input.utmParams,
        },
      },
    );
    if (error) {
      return { ok: false, error: error.message };
    }
    return { ok: true, data: data as FinalizeRegistrationResponse };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "finalize_failed",
    };
  }
}