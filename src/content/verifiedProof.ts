/**
 * Typed, centralized render gate for public marketing claims.
 *
 * Only entries with status === "confirmed" may render to the public site.
 * "pending" and "rejected" claims live here so we can see them, and in
 * docs/CLAIMS_AND_PROOF.md — but they must NEVER be shown to visitors.
 *
 * If a claim isn't in this file with status "confirmed", don't ship it.
 */

export type ClaimStatus = "confirmed" | "pending" | "rejected";

export interface VerifiedClaim {
  /** Stable id, used by consumers and tests. */
  id: string;
  /** Exact wording that may be rendered publicly. */
  text: string;
  /** Where this claim is allowed to render, for reviewer clarity. */
  scope: string;
  /** Human note: source of truth / evidence for this claim. */
  evidence: string;
  status: ClaimStatus;
}

export const VERIFIED_CLAIMS: readonly VerifiedClaim[] = [
  {
    id: "instructor.brian.ai_for_business",
    text:
      "Created by Brian Hanson, founder of AI For Business—one of the world's largest AI training companies.",
    scope: "Instructor authority strip / About section",
    evidence: "Owner-confirmed in launch batch",
    status: "confirmed",
  },
  // Pending claims — DO NOT render publicly. See docs/CLAIMS_AND_PROOF.md.
  { id: "scale.500_plus", text: "500+ students / participants", scope: "TBD", evidence: "unconfirmed", status: "pending" },
  { id: "scale.9_countries", text: "9 countries", scope: "TBD", evidence: "unconfirmed", status: "pending" },
  { id: "rating.4_9", text: "4.9/5 rating", scope: "TBD", evidence: "unconfirmed", status: "pending" },
  { id: "scale.learners_trained", text: "N learners trained (specific number)", scope: "TBD", evidence: "unconfirmed", status: "pending" },
  { id: "scale.aifb_reach", text: "AI For Business audience/scale numbers", scope: "TBD", evidence: "unconfirmed", status: "pending" },
  { id: "instructor.brian_credentials", text: "Additional Brian credentials (Inc 5000, revenue, etc.)", scope: "TBD", evidence: "unconfirmed", status: "pending" },
  { id: "portfolio.owned_apps", text: "Owned app examples / product portfolio", scope: "TBD", evidence: "unconfirmed", status: "pending" },
  { id: "outcomes.participant_results", text: "Specific participant outcomes", scope: "TBD", evidence: "unconfirmed", status: "pending" },
  { id: "community.size", text: "Community size claim", scope: "TBD", evidence: "unconfirmed", status: "pending" },
  { id: "support.promises", text: "Support / response-time promises", scope: "TBD", evidence: "unconfirmed", status: "pending" },
  { id: "offer.guarantee", text: "Money-back / results guarantee", scope: "TBD", evidence: "unconfirmed", status: "pending" },
  { id: "offer.value_stack", text: "Value stack dollar amounts", scope: "TBD", evidence: "unconfirmed", status: "pending" },
  { id: "vip.contents_price_refund", text: "VIP contents / price / refund terms", scope: "TBD", evidence: "unconfirmed", status: "pending" },
  { id: "urgency.seats_or_scarcity", text: "Seat / scarcity claims", scope: "TBD", evidence: "unconfirmed", status: "pending" },
] as const;

export function isRenderable(id: string): boolean {
  const c = VERIFIED_CLAIMS.find((v) => v.id === id);
  return !!c && c.status === "confirmed";
}

export function getRenderableText(id: string): string | null {
  const c = VERIFIED_CLAIMS.find((v) => v.id === id);
  return c && c.status === "confirmed" ? c.text : null;
}