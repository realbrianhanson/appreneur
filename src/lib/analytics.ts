/**
 * Analytics utility functions.
 *
 * External analytics are OFF during prelaunch. These helpers are safe
 * no-ops unless a vendor snippet (GA4 / Meta Pixel) is loaded later.
 * They never send PII (email addresses, auth user ids) to third parties.
 *
 * The prelaunch product has no paid checkout, so purchase / VIP / downsell
 * conversion helpers were intentionally removed. Add them back only when
 * VIP_SALES_ENABLED flips to true AND a real transaction id is available.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const trackGA4Event = (
  eventName: string,
  params?: Record<string, unknown>,
) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
};

export const trackFBEvent = (
  eventName: string,
  params?: Record<string, unknown>,
) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, params);
  }
};

export const trackFBCustomEvent = (
  eventName: string,
  params?: Record<string, unknown>,
) => {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackCustom", eventName, params);
  }
};

/**
 * Track when a user completes registration/signup. No PII — callers may
 * pass a per-session id (already random) that Meta/GA can use for dedup.
 */
export const trackRegistrationComplete = (opts?: { eventId?: string }) => {
  trackGA4Event("sign_up", {
    method: "email",
    ...(opts?.eventId ? { event_id: opts.eventId } : {}),
  });
  trackFBEvent("CompleteRegistration", {
    content_name: "Appreneur Challenge",
    status: "complete",
    ...(opts?.eventId ? { eventID: opts.eventId } : {}),
  });
};

export const trackQuizStart = () => {
  trackGA4Event("quiz_start", { quiz_name: "appreneur_challenge_quiz" });
  trackFBCustomEvent("QuizStart", { content_name: "Appreneur Challenge Quiz" });
};

/**
 * Track quiz completion. Answers stay first-party (Supabase funnel_events);
 * only the event name is forwarded to external analytics — no answer values.
 */
export const trackQuizComplete = () => {
  trackGA4Event("quiz_complete", { quiz_name: "appreneur_challenge_quiz" });
  trackFBEvent("Lead", { content_name: "Appreneur Challenge Quiz Complete" });
};

export const trackChallengeComplete = () => {
  trackGA4Event("challenge_complete", {
    challenge_name: "appreneur_5_day_challenge",
    days_completed: 5,
  });
  trackFBCustomEvent("ChallengeComplete", {
    content_name: "Appreneur 5-Day Challenge",
    status: "complete",
  });
};

export const trackDayComplete = (dayNumber: number) => {
  trackGA4Event("day_complete", {
    challenge_name: "appreneur_5_day_challenge",
    day_number: dayNumber,
  });
  trackFBCustomEvent("DayComplete", {
    content_name: `Day ${dayNumber}`,
    day_number: dayNumber,
  });
};

export const trackPageView = (pagePath: string, pageTitle?: string) => {
  trackGA4Event("page_view", {
    page_path: pagePath,
    page_title: pageTitle || (typeof document !== "undefined" ? document.title : ""),
  });
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
};