export const COMMUNITY_URL = "https://www.facebook.com/groups/918528500613193";
export const COMMUNITY_NAME = "Appreneur Community";

/**
 * Single source of truth for the total length of the challenge (in days).
 * The product is a SELF-PACED five-day challenge.
 */
export const TOTAL_DAYS = 5;

/**
 * Product status. "prelaunch" means the lesson videos and resources are still
 * being produced — the funnel and dashboard must not promise a scheduled cohort,
 * countdown, seat count, or "starts on X" date.
 */
export type ProductStatus = "prelaunch" | "live";
export const PRODUCT_STATUS: ProductStatus = "prelaunch";
export const IS_PRELAUNCH = PRODUCT_STATUS === "prelaunch";

/**
 * Paid product sales are disabled site-wide while the challenge is still being
 * built. When false, every VIP / upsell / downsell price is hidden and the
 * checkout edge function fails closed.
 */
export const VIP_SALES_ENABLED = false;

/**
 * Public-facing description of the product cadence. Always self-paced.
 */
export const CHALLENGE_TAGLINE = "Five focused days, on your schedule.";

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
