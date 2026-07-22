# Claims & Proof Registry

Durable registry of every claim we might make publicly about the Appreneur
Challenge, the instructor, or the offer. Nothing renders on the site unless
it is `confirmed` here **and** in `src/content/verifiedProof.ts`.

Status values:

- **confirmed** — owner has provided evidence; safe to render.
- **pending** — proposed wording awaiting owner evidence; do NOT render.
- **rejected** — reviewed and declined; do NOT render or re-propose.

| id | Scope | Proposed wording | Evidence / source | Status | Where it may appear |
| --- | --- | --- | --- | --- | --- |
| instructor.brian.ai_for_business | Instructor authority | "Created by Brian Hanson, founder of AI For Business—one of the world's largest AI training companies." | Owner-confirmed | confirmed | Hero authority strip, About section |
| scale.500_plus | Social proof strip | "500+ students / participants" | — | pending | — |
| scale.9_countries | Social proof strip | "Learners in 9 countries" | — | pending | — |
| rating.4_9 | Social proof strip | "4.9 / 5 average rating (n=?)" | Source + count required | pending | — |
| scale.learners_trained | Instructor authority | "Trained N business owners via AI For Business" | Exact number + method required | pending | — |
| scale.aifb_reach | Instructor authority | AI For Business audience / reach numbers | — | pending | — |
| instructor.brian_credentials | Instructor authority | Additional Brian credentials (Inc 5000, revenue, etc.) | Verified sources required | pending | — |
| portfolio.owned_apps | Instructor authority | Owned-app portfolio examples | Product names + links | pending | — |
| outcomes.participant_results | Testimonial context | Specific participant before/after outcomes | Participant quote + permission | pending | — |
| community.size | Program value | Community size claim | Live head-count + platform | pending | — |
| support.promises | Program value | Support / response-time promise | Defined SLA required | pending | — |
| offer.guarantee | Program value | Money-back or results guarantee | Written terms required | pending | — |
| offer.value_stack | Value stack | Dollar amounts on the value stack | Justifiable comps required | pending | — |
| vip.contents_price_refund | VIP offer | VIP contents, price, refund terms | See docs/VIP_OFFER_BRIEF.md | pending | — |
| urgency.seats_or_scarcity | Urgency | Seat cap / scarcity claim | Genuine capacity basis required | pending | — |

## Rules

1. Update this file and `src/content/verifiedProof.ts` together — one is
   the human record, the other is the render gate.
2. Never move a row to `confirmed` without a concrete evidence entry.
3. Numeric claims (counts, ratings, countries) require the source AND the
   count method.
4. Removed rows are still tracked here as `pending` unless the owner
   explicitly rejects them.
*** Add File: docs/TESTIMONIAL_COLLECTION.md
# Testimonial Collection Checklist

Every public testimonial on the Appreneur Challenge site must be
specifically attributable and permissioned. Broad praise is useful, but
prioritize **specific outcome / objection-handling** testimonials because
those are what convert cold visitors.

## Required for every testimonial

- **Exact quote** — verbatim, no rewrites. Minor typo fixes are fine, but
  never soften or embellish.
- **Full name** — first and last.
- **Role / company** — e.g. "Owner, Northline Coaching" or
  "Freelance designer".
- **Headshot** — at least 400×400 px, cropped square.
- **Source program / context** — was this from AI For Business, a
  consulting engagement, or from the Appreneur Challenge itself? Public
  testimonial cards MUST label context honestly so company/instructor
  proof isn't misrepresented as Appreneur-specific proof.
- **Result type** — outcome (built an app / launched a product), skill
  (learned to prompt / ship faster), or objection-handling (was
  non-technical, was intimidated, was skeptical, etc.).
- **Specific before/after** — the more concrete, the better. "Went from
  0 apps to a shipped V1 in one week" beats "Loved it."
- **Explicit permission** — written confirmation to use name, photo, and
  quote publicly. Store the confirmation with the record.
- **Approval status** — an admin must approve before it goes live.

## Nice to have

- Screenshot or short video of the app they built.
- Link to the live app (if the participant is comfortable sharing).
- Quantified outcome (users, revenue, hours saved) with permission to
  publish the number.

## Prioritization

When choosing which testimonials to feature on the landing page:

1. Objection-handling: "I'm not technical", "I don't have time",
   "I've tried and failed before".
2. Specific outcomes: named app, live URL, measurable result.
3. Diverse contexts: non-developers, career-changers, existing operators.
4. Broad praise last — good for volume, weak on conversion.
*** Add File: docs/CONTENT_PRODUCTION_PLAN.md
# Content Production Plan — Five Recording Briefs

One brief per launch-curriculum day. Target a polished self-paced lesson
around 45–60 minutes; do NOT publish a runtime claim until the final edit
is known.

---

## Day 1 — Choose the right app idea

- **Learner outcome**: one audience, one problem, one specific outcome,
  stated in one sentence.
- **Lesson outline**: why "small and specific" wins; audience selection;
  problem framing; outcome vs feature; go/no-go check.
- **Live demo**: pick a real audience + problem in front of camera and
  narrate the decision.
- **Deliverable**: one-line pitch — "For X, this app helps them Y so they
  can Z." Saved in the Day 1 mission.
- **Worksheet**: 1-page idea worksheet (audience, problem, outcome, why
  now, kill-criteria).
- **Chapters**: intro / picking an audience / framing the problem /
  writing the outcome / kill-criteria / mission recap.
- **B-roll & screen capture**: worksheet fill-in, examples from prior
  builds.
- **Beginner mistakes**: too broad audience, feature-as-outcome, chasing
  a trend, no kill-criteria.
- **Final CTA**: complete the Day 1 mission and move to Day 2.

## Day 2 — Map the first version

- **Learner outcome**: screen flow, wireframe, and V1 feature boundary.
- **Lesson outline**: minimum viable flow; wireframing without design
  tools; deciding what's in V1 vs later.
- **Live demo**: sketch the flow live; convert to a simple wireframe.
- **Deliverable**: named screen flow, wireframe, and a written "in / out"
  list.
- **Worksheet**: flow + feature-boundary template.
- **Chapters**: intro / minimum viable flow / wireframe / feature
  boundary / mission recap.
- **B-roll & screen capture**: whiteboard / paper sketch, wireframe tool.
- **Beginner mistakes**: designing before deciding, adding "one more
  feature", skipping the boundary.
- **Final CTA**: complete Day 2 mission and unlock Day 3.

## Day 3 — Build the core experience

- **Learner outcome**: working core screens, navigation, essential data.
- **Lesson outline**: prompting the builder; layout & nav; data model;
  wiring the primary user path.
- **Live demo**: build the core screens live using the challenge's chosen
  AI builder.
- **Deliverable**: a clickable core of the app that renders real data.
- **Worksheet**: prompt & data-model checklist.
- **Chapters**: intro / prompting the builder / layout & nav / data /
  wiring the path / mission recap.
- **B-roll & screen capture**: builder UI, prompt edits, live app.
- **Beginner mistakes**: perfect visuals before core flow, no data model,
  vague prompts.
- **Final CTA**: complete Day 3 mission and unlock Day 4.

## Day 4 — Add the intelligence

- **Learner outcome**: one useful AI feature with a refined prompt.
- **Lesson outline**: picking the AI moment; prompt-engineering basics;
  refining until it's actually useful; guardrails.
- **Live demo**: build the AI feature live, iterate the prompt twice.
- **Deliverable**: one AI feature wired in and tuned.
- **Worksheet**: AI-feature spec + prompt iteration log.
- **Chapters**: intro / picking the AI moment / prompt v1 / iterate /
  guardrails / mission recap.
- **B-roll & screen capture**: prompt playground, feature working in-app.
- **Beginner mistakes**: bolting AI on for its own sake, one-shot prompts,
  no guardrails.
- **Final CTA**: complete Day 4 mission and unlock Day 5.

## Day 5 — Polish, test, and publish

- **Learner outcome**: quality-checked, deployed, shareable app + a
  next-iteration plan.
- **Lesson outline**: quality checklist; test on a phone; deploy; share
  for feedback; write the next-iteration plan.
- **Live demo**: run the checklist and deploy live.
- **Deliverable**: shareable link + next-iteration plan.
- **Worksheet**: quality checklist + next-iteration template.
- **Chapters**: intro / quality checklist / test on device / deploy /
  share for feedback / next-iteration plan / graduation.
- **B-roll & screen capture**: phone view, deploy screen, share link.
- **Beginner mistakes**: polishing forever, no feedback loop, no plan for
  what's next.
- **Final CTA**: complete Day 5 and graduate the challenge.
*** Add File: docs/VIP_OFFER_BRIEF.md
# VIP Offer Brief (Owner Inputs Required)

VIP is preserved in the codebase as a fail-closed, disabled offer. It
will remain hidden and the checkout function will return HTTP 503 until
the following are confirmed **in writing** by the owner. There are no
invented defaults — each field below is an explicit owner decision.

## Owner decisions needed

| Field | Owner input |
| --- | --- |
| Ideal buyer | |
| Transformation (before → after) | |
| Deliverables (what's included) | |
| Delivery format (video / live / template / etc.) | |
| Support & access (channels, response window, duration) | |
| Bonuses (name, contents, standalone value) | |
| Price (USD) | |
| Order bump (what, price) | |
| Downsell (what, price) | |
| Refund / guarantee terms | |
| Capacity / scarcity basis (real cap or none) | |
| Fulfillment (how buyers get access, timing) | |
| Legal / tax (entity of record, VAT/GST handling) | |
| Post-purchase path (day-of email, day-1 experience, follow-up) | |

## Do-not-do until confirmed

- Do not enable `VIP_SALES_ENABLED` in `src/lib/constants.ts`.
- Do not remove the fail-closed guard in
  `supabase/functions/create-checkout-session/index.ts`.
- Do not render prices, order-bump/downsell copy, or scarcity claims on
  any public page.
- Do not restore or invent VIP marketing copy from earlier drafts.

## Release-gate implication

`npm run release:check` MUST fail while any of the above fields are
blank. The release script surfaces which fields are missing.
*** Add File: scripts/release-check.mjs
#!/usr/bin/env node
/**
 * Release readiness gate.
 *
 * Fails (exit code 1) until:
 *  - All 5 lesson videos + resource URLs are configured
 *  - Required legal / email / VIP owner decisions are marked complete
 *  - No customer-facing unfinished-product phrases exist in src/ or index.html
 *
 * Testimonials are surfaced as a count but do NOT gate the release.
 *
 * This is intended for the manual release check, NOT normal CI.
 * Normal `npm run check` (lint + typecheck + test) still passes.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const failures = [];
const info = [];

// --- 1. Forbidden customer-facing phrases -----------------------------------

const FORBIDDEN = [
  "early access",
  "prelaunch",
  "pre-launch",
  "being recorded",
  "when lessons open",
  "when the lessons open",
  "we'll email you when",
  "we will email you when",
  "lesson preview while videos are recorded",
];

// Files where the phrase would be *customer-facing*. Internal code comments
// and internal constants may still reference the words; we scope the scan to
// user-visible surfaces.
const CUSTOMER_FACING_ROOTS = [
  "src/components/landing",
  "src/pages",
  "src/components/quiz",
  "supabase/functions/finalize-registration",
  "supabase/functions/send-email",
];

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function scanForbidden() {
  const files = [
    "index.html",
    ...CUSTOMER_FACING_ROOTS.flatMap(walk),
  ].filter((f) => existsSync(f));

  for (const file of files) {
    if (/\.test\.[tj]sx?$/.test(file)) continue;
    const text = readFileSync(file, "utf8");
    // Strip line + block comments to reduce false positives.
    const stripped = text
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:])\/\/.*$/gm, "$1");
    const lower = stripped.toLowerCase();
    for (const phrase of FORBIDDEN) {
      if (lower.includes(phrase)) {
        failures.push(`Forbidden phrase "${phrase}" in ${file}`);
      }
    }
  }
}

scanForbidden();

// --- 2. Video / resource URLs -----------------------------------------------

const videosPath = "src/content/lessonVideos.ts";
if (!existsSync(videosPath)) {
  failures.push(
    `Missing ${videosPath} — configure 5 lesson video/resource URLs before release.`,
  );
} else {
  const src = readFileSync(videosPath, "utf8");
  for (let day = 1; day <= 5; day++) {
    const re = new RegExp(`day\\s*:\\s*${day}[\\s\\S]{0,400}?videoUrl\\s*:\\s*['"]([^'"]*)['"]`);
    const m = src.match(re);
    if (!m || !m[1] || m[1].includes("TODO") || m[1].startsWith("about:")) {
      failures.push(`Day ${day} videoUrl is not configured in ${videosPath}`);
    }
  }
}

// --- 3. VIP owner decisions --------------------------------------------------

const vipDoc = "docs/VIP_OFFER_BRIEF.md";
if (!existsSync(vipDoc)) {
  failures.push(`Missing ${vipDoc}`);
} else {
  const md = readFileSync(vipDoc, "utf8");
  const rowRe = /\|\s*([^|]+?)\s*\|\s*([^|]*?)\s*\|\s*$/gm;
  let m;
  const missing = [];
  while ((m = rowRe.exec(md))) {
    const label = m[1].trim();
    const value = m[2].trim();
    if (
      label &&
      label !== "Field" &&
      !label.startsWith("-") &&
      value === ""
    ) {
      missing.push(label);
    }
  }
  if (missing.length > 0) {
    failures.push(
      `VIP owner inputs missing in ${vipDoc}: ${missing.join(", ")}`,
    );
  }
}

// --- 4. Legal / email decisions (marker files) ------------------------------

const decisionMarkers = [
  "docs/decisions/LEGAL_APPROVED.md",
  "docs/decisions/EMAIL_CONFIG_APPROVED.md",
];
for (const marker of decisionMarkers) {
  if (!existsSync(marker)) {
    failures.push(
      `Missing decision marker ${marker} — legal / email must be signed off before release.`,
    );
  }
}

// --- 5. Testimonials surface (non-gating) -----------------------------------

info.push(
  "Testimonials do not gate release. Count is informational only; approved testimonials will auto-appear when present.",
);

// --- Report -----------------------------------------------------------------

console.log("Release readiness report");
console.log("========================\n");

for (const line of info) console.log(`ℹ  ${line}`);
console.log("");

if (failures.length === 0) {
  console.log("✅ Release check passed.");
  process.exit(0);
} else {
  console.log("❌ Release check FAILED:\n");
  for (const f of failures) console.log(`  - ${f}`);
  console.log(
    "\nFix the items above (or add the owner-signed decision markers) and re-run.",
  );
  process.exit(1);
}