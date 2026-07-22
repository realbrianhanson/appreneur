/**
 * Analytics utility functions for GA4 and Facebook Pixel tracking.
 *
 * External analytics are disabled by default during prelaunch. These helpers
 * remain safe no-ops unless a vendor snippet is loaded later; they never send
 * PII (email addresses, auth user ids) to third parties.
 */

// Declare global types for analytics
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Track a custom event in Google Analytics 4
 */
export const trackGA4Event = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

/**
 * Track a standard or custom event in Facebook Pixel
 */
export const trackFBEvent = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, params);
  }
};

/**
 * Track a custom event in Facebook Pixel
 */
export const trackFBCustomEvent = (
  eventName: string,
  params?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('trackCustom', eventName, params);
  }
};

// ============================================
// CONVERSION TRACKING EVENTS
// ============================================

/**
 * Track when a user completes registration/signup
 *
 * Never send email addresses or other direct identifiers to third-party
 * analytics. Callers may pass a per-session/user-safe id (already hashed or
 * randomly generated) that Meta/GA can use for dedup.
 */
export const trackRegistrationComplete = (opts?: { eventId?: string }) => {
  // GA4 — no PII.
  trackGA4Event('sign_up', {
    method: 'email',
    ...(opts?.eventId ? { event_id: opts.eventId } : {}),
  });

  // Facebook Pixel - CompleteRegistration is a standard event. No PII.
  trackFBEvent('CompleteRegistration', {
    content_name: 'Appreneur Challenge',
    status: 'complete',
    ...(opts?.eventId ? { eventID: opts.eventId } : {}),
  });

};

/**
 * Track when a user starts the quiz
 */
export const trackQuizStart = () => {
  trackGA4Event('quiz_start', {
    quiz_name: 'appreneur_challenge_quiz',
  });

  trackFBCustomEvent('QuizStart', {
    content_name: 'Appreneur Challenge Quiz',
  });

};

/**
 * Track when a user completes the quiz
 */
export const trackQuizComplete = (answers?: Record<string, string>) => {
  trackGA4Event('quiz_complete', {
    quiz_name: 'appreneur_challenge_quiz',
    ...answers,
  });

  trackFBEvent('Lead', {
    content_name: 'Appreneur Challenge Quiz Complete',
  });

};

/**
 * Track VIP purchase/upgrade
 */
export const trackVIPPurchase = (
  value: number,
  currency: string = 'USD',
  transactionId?: string,
) => {
  // GA4 — use the real Stripe transaction id so dedup works.
  const txId = transactionId || `vip_${Date.now()}`;
  trackGA4Event('purchase', {
    transaction_id: txId,
    value,
    currency,
    items: [
      {
        item_name: 'VIP Bundle',
        item_category: 'upgrade',
        price: value,
        quantity: 1,
      },
    ],
  });

  // Facebook Pixel - Purchase is a standard event
  trackFBEvent('Purchase', {
    value,
    currency,
    content_name: 'VIP Bundle',
    content_type: 'product',
  });

};

/**
 * Track challenge completion (all 5 days done)
 */
export const trackChallengeComplete = () => {
  trackGA4Event('challenge_complete', {
    challenge_name: 'appreneur_5_day_challenge',
    days_completed: 5,
  });

  trackFBCustomEvent('ChallengeComplete', {
    content_name: 'Appreneur 5-Day Challenge',
    status: 'complete',
  });

};

/**
 * Track day completion
 */
export const trackDayComplete = (dayNumber: number) => {
  trackGA4Event('day_complete', {
    challenge_name: 'appreneur_5_day_challenge',
    day_number: dayNumber,
  });

  trackFBCustomEvent('DayComplete', {
    content_name: `Day ${dayNumber}`,
    day_number: dayNumber,
  });

};

/**
 * Track page view (useful for SPA navigation)
 */
export const trackPageView = (pagePath: string, pageTitle?: string) => {
  trackGA4Event('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title,
  });

  // Facebook Pixel tracks page views automatically via init
  // But we can add custom PageView for SPA navigation
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }

};

/**
 * Track VIP offer view
 */
export const trackVIPOfferView = () => {
  trackGA4Event('view_item', {
    items: [
      {
        item_name: 'VIP Bundle',
        item_category: 'upgrade',
        price: 27,
      },
    ],
  });

  trackFBEvent('ViewContent', {
    content_name: 'VIP Offer Page',
    content_type: 'product',
  });

};

/**
 * Track downsell view
 */
export const trackDownsellView = () => {
  trackGA4Event('view_item', {
    items: [
      {
        item_name: 'Downsell Offer',
        item_category: 'upgrade',
        price: 7,
      },
    ],
  });

  trackFBEvent('ViewContent', {
    content_name: 'Downsell Offer Page',
    content_type: 'product',
  });

};
