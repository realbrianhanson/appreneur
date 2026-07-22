export const COMMUNITY_URL = "https://www.facebook.com/groups/918528500613193";
export const COMMUNITY_NAME = "Appreneur Community";

/**
 * Single source of truth for the total length of the challenge (in days).
 * The product is a SELF-PACED five-day challenge.
 */
export const TOTAL_DAYS = 5;

/**
 * Internal product/release gate. The customer-facing app must never expose
 * this value or imply the product is unfinished. It exists ONLY so paid
 * checkout and admin release gates fail closed until the owner explicitly
 * confirms the final launch inputs (videos, VIP details, email config).
 *
 * Public copy always describes the product as a complete free 5-day
 * self-paced challenge. See docs/CLAIMS_AND_PROOF.md.
 */
export type ProductStatus = "prelaunch" | "live";
export const PRODUCT_STATUS: ProductStatus = "prelaunch";
export const IS_PRELAUNCH = PRODUCT_STATUS === "prelaunch";

/**
 * Paid product sales are disabled site-wide while the challenge is still being
 * finalized. When false, every VIP / upsell / downsell price is hidden and
 * the checkout edge function fails closed. Flip to true only after the
 * owner supplies final VIP details (see docs/VIP_OFFER_BRIEF.md).
 */
export const VIP_SALES_ENABLED = false;

/**
 * Public-facing launch copy. Single source of truth for CTA/microcopy so
 * every surface stays consistent.
 */
export const CHALLENGE_TAGLINE = "Five focused days, on your schedule.";

/**
 * Control copy for the direct-response landing page. Two documented future
 * headline challengers live in src/content/landingCopy.ts but only the
 * control renders publicly (no client-side A/B assignment yet — analytics
 * and consent must land first).
 */
export const PRIMARY_CTA_LABEL = "Start My Free 5-Day Challenge";
export const SECONDARY_CTA_LABEL = "See What I'll Build";
export const REGISTRATION_CTA_LABEL = "Create My Free Challenge Account";
export const HERO_EYEBROW =
  "THE FREE 5-DAY AI WEBSITE & APP-BUILDING CHALLENGE FOR BEGINNERS";
export const HERO_H1 =
  "Build Your First Website or App With AI—in 5 Days—even if tech has always intimidated you.";
export const HERO_SUPPORT_COPY =
  "If you can type an email and follow a step-by-step video, you can do this. Brian shows you exactly what to click, what to type, and what to do when the AI doesn't get it right the first time.";
export const CTA_MICROCOPY =
  "Free · Self-paced · Start anytime · Beginner-friendly";

/**
 * Belief-bridge mechanism line. This is the sentence that establishes
 * possibility for a scared, nontechnical, older-beginner audience BEFORE
 * we ask them to commit. Keep verbatim on the landing page.
 */
export const MECHANISM_LINE =
  "You do not have to understand the technology. You just have to learn how to direct it.";

/** Supporting analogy rendered next to MECHANISM_LINE. */
export const BELIEF_ANALOGY =
  "Think of AI as the assistant. You're still the business owner.";

/** Short internal daily-cadence line kept for on-page use in the timeline. */
export const CADENCE_LINE =
  "One mission. One deliverable. One step closer every day.";

/** Momentum copy placed near a mid-page CTA — no fake urgency. */
export const MOMENTUM_LINE =
  "The longer the idea stays in your notes, the harder it becomes to believe you'll ever build it. Change that today.";

/** Post-account next action wording (used on Thank You + welcome email). */
export const NEXT_ACTION_LABEL = "Start Day 1";

/**
 * COMMUNITY_URL is only surfaced to users when it points at a real,
 * non-placeholder URL. Callers should check with hasValidCommunityUrl().
 */
export const hasValidCommunityUrl = (): boolean => {
  const url = COMMUNITY_URL?.trim() ?? "";
  if (!url) return false;
  if (/example\.com|placeholder|your-community|TODO/i.test(url)) return false;
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};
