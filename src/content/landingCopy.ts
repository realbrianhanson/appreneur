/**
 * Central store for public landing headline / CTA copy variants so future
 * A/B tests can rotate them without hunting through components. Only the
 * `control` renders publicly today. Client-side variant assignment is NOT
 * turned on — analytics + consent must land first.
 *
 * See docs/CLAIMS_AND_PROOF.md for what is allowed to render.
 */

export interface HeadlineVariant {
  id: "control" | "a" | "b";
  headline: string;
  note: string;
}

export const HEADLINE_VARIANTS: readonly HeadlineVariant[] = [
  {
    id: "control",
    headline:
      "Build Your First Website or App With AI—in 5 Days—even if tech has always intimidated you.",
    note: "Control — currently rendered.",
  },
  {
    id: "a",
    headline: "You don't need a developer. You need five focused days.",
    note: "Future challenger A — documented, not shipped.",
  },
  {
    id: "b",
    headline: "Your first app is closer than you think.",
    note: "Future challenger B — documented, not shipped.",
  },
] as const;

export const CONTROL_HEADLINE = HEADLINE_VARIANTS[0].headline;

/**
 * Persona chooser near the top of the page — the answers map 1:1 to the
 * first quiz question so a selection can prefill it without a competing
 * signup flow.
 */
export interface PersonaChoice {
  id: "for_business" | "to_sell";
  label: string;
  /** Value written into the first quiz answer when this persona is chosen. */
  quizAnswerValue: "for_business" | "to_sell";
}

export const PERSONA_CHOICES: readonly PersonaChoice[] = [
  {
    id: "for_business",
    label: "Build something for my business",
    quizAnswerValue: "for_business",
  },
  {
    id: "to_sell",
    label: "Build websites or apps I can sell",
    quizAnswerValue: "to_sell",
  },
] as const;

export const PERSONA_STORAGE_KEY = "appreneur.persona_prefill";

/**
 * Objection map used by the FAQ. Kept here so tests can assert every
 * objection from the CRO brief is answered without asserting on prose.
 */
export const REQUIRED_OBJECTION_IDS = [
  "not_technical",
  "too_old_or_nontechnical",
  "never_built",
  "write_code",
  "for_existing_business",
  "to_sell",
  "dont_know_what_to_build",
  "what_tools_do_i_need",
  "miss_a_day",
  "how_long",
  "what_at_the_end",
  "really_free",
  "after_signup",
  "get_stuck",
  "ai_makes_mistake",
  "break_anything",
  "watch_more_than_once",
] as const;

export type ObjectionId = (typeof REQUIRED_OBJECTION_IDS)[number];