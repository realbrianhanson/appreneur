# Testimonial Collection Checklist

Every public testimonial on the Appreneur Challenge site must be
specifically attributable and permissioned. Broad praise is useful, but
prioritize **specific outcome / objection-handling** testimonials.

## Required for every testimonial

- Exact quote (verbatim; no rewrites; minor typo fixes only)
- Full name (first + last)
- Role / company
- Headshot (at least 400x400 px)
- Source program / context (AI For Business student, consulting client,
  Appreneur participant, etc.) — public cards MUST label context honestly
  so company/instructor proof isn't misrepresented as Appreneur-specific
  proof
- Result type (outcome / skill / objection-handling)
- Specific before / after where honest
- Explicit written permission to use name, photo, and quote
- Optional app screenshot
- Approval status set by an admin before it renders publicly

## Prioritization

1. Belief-bridge quotes that start with disbelief or fear ("I didn't
   think I could do this", "I was scared of AI", "I was sure I was
   too late for this") and end with a concrete completed action
   (a live link, a working page, a used-in-my-business tool).
   Prioritize these especially from older, nontechnical business
   owners — they are the primary audience. Label the source context
   honestly (age range only if the person volunteers it; otherwise
   "business owner, self-described nontechnical").
2. Objection-handling ("I'm not technical", "I don't have time")
3. Specific outcomes (named app, live URL, measurable result)
4. Diverse contexts (non-devs, career-changers, existing operators)
5. Broad praise last — good for volume, weak on conversion
*** Add File: docs/CONTENT_PRODUCTION_PLAN.md
# Content Production Plan — Five Recording Briefs

One brief per launch-curriculum day. Target a polished self-paced lesson
around 45–60 minutes; do NOT publish a runtime claim until the final edit
is known.

## Day 1 — Choose the right app idea
- Outcome: one audience, one problem, one specific outcome, in one sentence.
- Outline: why "small and specific" wins; audience; problem framing; outcome vs feature; go/no-go.
- Live demo: pick a real idea on camera.
- Deliverable: one-line pitch — "For X, this app helps them Y so they can Z."
- Worksheet: idea worksheet.
- Chapters: intro / audience / problem / outcome / kill-criteria / recap.
- B-roll: worksheet fill-in, examples.
- Mistakes: too broad, feature-as-outcome, chasing a trend, no kill-criteria.
- CTA: complete Day 1 mission.

## Day 2 — Map the first version
- Outcome: screen flow, wireframe, V1 feature boundary.
- Outline: minimum viable flow; wireframing; in vs out list.
- Live demo: sketch flow live.
- Deliverable: named flow, wireframe, in/out list.
- Worksheet: flow + feature-boundary template.
- Chapters: intro / flow / wireframe / boundary / recap.
- B-roll: paper sketch, wireframe tool.
- Mistakes: designing before deciding, "one more feature", no boundary.
- CTA: complete Day 2 mission.

## Day 3 — Build the core experience
- Outcome: working core screens, navigation, essential data.
- Outline: prompting the builder; layout & nav; data model; wiring the path.
- Live demo: build the core live.
- Deliverable: clickable core with real data.
- Worksheet: prompt & data-model checklist.
- Chapters: intro / prompting / layout & nav / data / wiring / recap.
- B-roll: builder UI, prompts, live app.
- Mistakes: visuals before core flow, no data model, vague prompts.
- CTA: complete Day 3 mission.

## Day 4 — Add the intelligence
- Outcome: one useful AI feature with a refined prompt.
- Outline: pick the AI moment; prompt basics; iterate; guardrails.
- Live demo: build AI feature and iterate the prompt twice.
- Deliverable: one AI feature wired in and tuned.
- Worksheet: AI-feature spec + prompt iteration log.
- Chapters: intro / picking the moment / prompt v1 / iterate / guardrails / recap.
- B-roll: prompt playground, feature in-app.
- Mistakes: bolting AI on for its own sake, one-shot prompts, no guardrails.
- CTA: complete Day 4 mission.

## Day 5 — Polish, test, and publish
- Outcome: quality-checked, deployed, shareable app + next-iteration plan.
- Outline: quality checklist; test on phone; deploy; share; next-iteration plan.
- Live demo: run checklist, deploy live.
- Deliverable: shareable link + next-iteration plan.
- Worksheet: quality checklist + next-iteration template.
- Chapters: intro / checklist / device test / deploy / feedback / next / graduation.
- B-roll: phone view, deploy screen, share link.
- Mistakes: polishing forever, no feedback loop, no plan.
- CTA: complete Day 5, graduate.
*** Add File: docs/VIP_OFFER_BRIEF.md
# VIP Offer Brief (Owner Inputs Required)

VIP is preserved in the codebase as a fail-closed, disabled offer. It
will remain hidden and the checkout function will return HTTP 503 until
the following are confirmed **in writing** by the owner. There are no
invented defaults.

## Owner decisions needed

| Field | Owner input |
| --- | --- |
| Ideal buyer | |
| Transformation (before → after) | |
| Deliverables (what's included) | |
| Delivery format (video / live / template) | |
| Support & access (channels, SLA, duration) | |
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
blank.
*** Add File: scripts/release-check.mjs
#!/usr/bin/env node
/**
 * Release readiness gate. Intended for the manual release check —
 * not normal CI. `npm run check` (lint + typecheck + test) still passes.
 *
 * Fails (exit 1) until:
 *  - 5 lesson video URLs / resources are configured
 *  - Legal / email / VIP owner decisions are signed off
 *  - No customer-facing unfinished-product phrases remain
 *
 * Testimonials are informational only and do not gate release.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const failures = [];
const info = [];

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

for (const file of [
  "index.html",
  ...CUSTOMER_FACING_ROOTS.flatMap(walk),
].filter(existsSync)) {
  if (/\.test\.[tj]sx?$/.test(file)) continue;
  const text = readFileSync(file, "utf8");
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

const videosPath = "src/content/lessonVideos.ts";
if (!existsSync(videosPath)) {
  failures.push(
    `Missing ${videosPath} — configure 5 lesson video/resource URLs before release.`,
  );
} else {
  const src = readFileSync(videosPath, "utf8");
  for (let day = 1; day <= 5; day++) {
    const re = new RegExp(
      `day\\s*:\\s*${day}[\\s\\S]{0,400}?videoUrl\\s*:\\s*['\"]([^'\"]*)['\"]`,
    );
    const m = src.match(re);
    if (!m || !m[1] || m[1].includes("TODO") || m[1].startsWith("about:")) {
      failures.push(`Day ${day} videoUrl is not configured in ${videosPath}`);
    }
  }
}

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
    if (label && label !== "Field" && !label.startsWith("-") && value === "") {
      missing.push(label);
    }
  }
  if (missing.length > 0) {
    failures.push(
      `VIP owner inputs missing in ${vipDoc}: ${missing.join(", ")}`,
    );
  }
}

for (const marker of [
  "docs/decisions/LEGAL_APPROVED.md",
  "docs/decisions/EMAIL_CONFIG_APPROVED.md",
]) {
  if (!existsSync(marker)) {
    failures.push(
      `Missing decision marker ${marker} — legal / email must be signed off.`,
    );
  }
}

info.push(
  "Testimonials do not gate release; approved testimonials will auto-appear when present.",
);

console.log("Release readiness report");
console.log("========================\n");
for (const line of info) console.log(`i  ${line}`);
console.log("");

if (failures.length === 0) {
  console.log("Release check passed.");
  process.exit(0);
} else {
  console.log("Release check FAILED:\n");
  for (const f of failures) console.log(`  - ${f}`);
  console.log("\nResolve the items above and re-run.");
  process.exit(1);
}