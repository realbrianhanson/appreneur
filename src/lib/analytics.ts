/**
 * Analytics utility functions for GA4 and Facebook Pixel tracking
 * Replace placeholder IDs in index.html meta tags before using
 */

// Warn if analytics IDs are still placeholders
if (typeof document !== 'undefined') {
  const ga4Id = document.querySelector('meta[name="ga4-id"]')?.getAttribute('content');
  const fbId = document.querySelector('meta[name="fb-pixel-id"]')?.getAttribute('content');

  if (!ga4Id || ga4Id === 'G-XXXXXXXXXX') {
    console.warn('[Analytics] GA4 Measurement ID is not configured. Replace G-XXXXXXXXXX in the ga4-id meta tag in index.html.');
  }
  if (!fbId || fbId === 'XXXXXXXXXXXXXXXX') {
    console.warn('[Analytics] Facebook Pixel ID is not configured. Replace XXXXXXXXXXXXXXXX in the fb-pixel-id meta tag in index.html.');
  }
}

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
 */
export const trackRegistrationComplete = (email?: string) => {
  // GA4
  trackGA4Event('sign_up', {
    method: 'email',
    ...(email && { user_email: email }),
  });

  // Facebook Pixel - CompleteRegistration is a standard event
  trackFBEvent('CompleteRegistration', {
    content_name: 'Appreneur Challenge',
    status: 'complete',
  });

  console.log('[Analytics] Registration complete tracked');
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

  console.log('[Analytics] Quiz start tracked');
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

  console.log('[Analytics] Quiz complete tracked');
};

/**
 * Track VIP purchase/upgrade
 */
export const trackVIPPurchase = (value: number, currency: string = 'USD') => {
  // GA4
  trackGA4Event('purchase', {
    transaction_id: `vip_${Date.now()}`,
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

  console.log('[Analytics] VIP purchase tracked:', { value, currency });
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

  console.log('[Analytics] Challenge complete tracked');
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

  console.log('[Analytics] Day complete tracked:', dayNumber);
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

  console.log('[Analytics] Page view tracked:', pagePath);
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
        price: 47,
      },
    ],
  });

  trackFBEvent('ViewContent', {
    content_name: 'VIP Offer Page',
    content_type: 'product',
  });

  console.log('[Analytics] VIP offer view tracked');
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
        price: 27,
      },
    ],
  });

  trackFBEvent('ViewContent', {
    content_name: 'Downsell Offer Page',
    content_type: 'product',
  });

  console.log('[Analytics] Downsell view tracked');
};
