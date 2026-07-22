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
export const PRIMARY_CTA_LABEL = "Start the Free Challenge";
export const SECONDARY_CTA_LABEL = "See the 5-Day Challenge";
export const REGISTRATION_CTA_LABEL = "Create My Free Account";
export const HERO_EYEBROW =
  "FREE 5-DAY SELF-PACED CHALLENGE · NO CODE REQUIRED";
export const HERO_SUPPORT_COPY =
  "A practical, step-by-step challenge that takes you from idea to a working first version—with one focused mission and one concrete win each day.";
export const CTA_MICROCOPY =
  "Free · Self-paced · No credit card · Beginner-friendly";

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
