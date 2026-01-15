import { supabase } from "@/integrations/supabase/client";

type EmailTemplate = "welcome" | "vip_confirmation" | "day_unlock" | "completion";

interface SendEmailParams {
  template: EmailTemplate;
  to: string;
  data: Record<string, unknown>;
}

export async function sendEmail({ template, to, data }: SendEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await supabase.functions.invoke("send-email", {
      body: { template, to, data },
    });

    if (response.error) {
      console.error("Error sending email:", response.error);
      return { success: false, error: response.error.message };
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Helper functions for specific email types
export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  cohortStartDate: string,
  loginUrl: string = window.location.origin + "/login"
) {
  return sendEmail({
    template: "welcome",
    to: email,
    data: { firstName, cohortStartDate, loginUrl },
  });
}

export async function sendVIPConfirmationEmail(
  email: string,
  firstName: string,
  loginUrl: string = window.location.origin + "/dashboard"
) {
  return sendEmail({
    template: "vip_confirmation",
    to: email,
    data: { firstName, loginUrl },
  });
}

export async function sendDayUnlockEmail(
  email: string,
  firstName: string,
  dayNumber: number,
  missionTitle: string,
  loginUrl: string = window.location.origin + "/dashboard"
) {
  return sendEmail({
    template: "day_unlock",
    to: email,
    data: { firstName, dayNumber, missionTitle, loginUrl },
  });
}

export async function sendCompletionEmail(
  email: string,
  firstName: string,
  loginUrl: string = window.location.origin + "/dashboard/graduation"
) {
  return sendEmail({
    template: "completion",
    to: email,
    data: { firstName, loginUrl },
  });
}
