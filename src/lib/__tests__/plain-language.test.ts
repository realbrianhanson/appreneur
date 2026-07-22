import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PERSONA_CHOICES } from "@/content/landingCopy";
import { HERO_H1, HERO_SUPPORT_COPY, CTA_MICROCOPY } from "../constants";

const read = (p: string) => readFileSync(resolve(p), "utf8");

/**
 * The primary audience is business owners age 50+ and beginner entrepreneurs
 * who don't consider themselves technical. Public copy must not lean on
 * product/dev jargon without a plain-English translation.
 */
const CUSTOMER_SURFACES = [
  "src/components/landing/HeroSection.tsx",
  "src/components/landing/JourneyTimeline.tsx",
  "src/components/landing/EarlyAccessSection.tsx",
  "src/components/landing/FAQSection.tsx",
  "src/components/landing/OpportunityMechanismSection.tsx",
  "src/components/landing/PersonaChooser.tsx",
  "src/components/quiz/QuizContainer.tsx",
];

const BANNED_JARGON: RegExp[] = [
  /\bwireframe\b/i,
  /\buser flow\b/i,
  /\bfeature boundary\b/i,
  /\bMVP\b/,
  /\bno-?code\b/i,
  /\bdeploy(ed|ing|s)?\b/i,
];

describe("audience: no unexplained tech jargon in customer surfaces", () => {
  for (const file of CUSTOMER_SURFACES) {
    it(`${file} avoids unexplained jargon`, () => {
      const src = read(file);
      for (const pattern of BANNED_JARGON) {
        expect(src, `${file} matched ${pattern}`).not.toMatch(pattern);
      }
    });
  }
});

describe("audience: hero copy is written for beginners age 50+", () => {
  it("H1 signals the audience explicitly", () => {
    expect(HERO_H1).toMatch(/tech has always intimidated you/i);
    expect(HERO_H1).toMatch(/Website or App/);
  });
  it("supporting copy establishes belief in plain language", () => {
    // Belief-bridge: reachable analogy + named instructor + honest coaching
    // for when AI misfires. No 'no-code' framing.
    expect(HERO_SUPPORT_COPY).toMatch(/type an email/i);
    expect(HERO_SUPPORT_COPY).toMatch(/step-by-step video/i);
    expect(HERO_SUPPORT_COPY).toMatch(/Brian/);
    expect(HERO_SUPPORT_COPY).not.toMatch(/no-?code/i);
  });
  it("microcopy uses 'Start anytime' instead of a payment/credit-card claim", () => {
    expect(CTA_MICROCOPY).toMatch(/Start anytime/i);
    expect(CTA_MICROCOPY).toMatch(/Beginner-friendly/i);
  });
});

describe("audience: two-path persona choices match the owner's use cases", () => {
  it("offers exactly the two owner-approved paths", () => {
    expect(PERSONA_CHOICES.length).toBe(2);
    const ids = PERSONA_CHOICES.map((c) => c.id).sort();
    expect(ids).toEqual(["for_business", "to_sell"]);
    const labels = PERSONA_CHOICES.map((c) => c.label);
    expect(labels).toContain("Build something for my business");
    expect(labels).toContain("Build websites or apps I can sell");
  });
});

describe("audience: no profit / income guarantee in customer surfaces", () => {
  const surfaces = [
    ...CUSTOMER_SURFACES,
    "src/pages/Index.tsx",
    "src/components/landing/FinalCTASection.tsx",
    "src/components/landing/StickyCtaBar.tsx",
  ];
  const forbidden = [
    /guaranteed?\s+(income|profit|revenue|business|clients?|customers?)/i,
    /make\s+\$\d+/i,
    /replace your job/i,
    /six-?figure/i,
  ];
  for (const file of surfaces) {
    it(`${file} makes no profit guarantee`, () => {
      const src = read(file);
      for (const p of forbidden) {
        expect(src, `${file} matched ${p}`).not.toMatch(p);
      }
    });
  }
});

describe("audience: plain-English day outcomes", () => {
  const journey = read("src/components/landing/JourneyTimeline.tsx");
  it("day headlines describe outcomes in ordinary language", () => {
    expect(journey).toMatch(/Choose what to build/);
    expect(journey).toMatch(/Sketch the small first version/);
    expect(journey).toMatch(/Build the pages and make the buttons work/);
    expect(journey).toMatch(/Add one useful AI-powered feature/);
    expect(journey).toMatch(/Test it, fix the rough edges, and put it online/);
  });
  it("each day still declares an explicit deliverable", () => {
    const count = (journey.match(/deliverable:/g) ?? []).length;
    expect(count).toBeGreaterThanOrEqual(5);
  });
});

describe("audience: essential landing copy is not rendered at tiny sizes", () => {
  const hero = read("src/components/landing/HeroSection.tsx");
  it("hero paragraph uses text-lg/xl, not text-xs", () => {
    // Support paragraph is the primary explanation and must be readable.
    expect(hero).toMatch(/text-lg md:text-xl/);
  });
  it("hero H1 uses a large clamp() font-size", () => {
    expect(hero).toMatch(/clamp\(2\.25rem/);
  });
});
