import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

const read = (p: string) => fs.readFileSync(path.resolve(p), "utf8");

const FORBIDDEN_CLAIMS = [
  /500\+ entrepreneurs/i,
  /500\+ members/i,
  /9 countries/i,
  /4\.9/,
  /\$2,?085/,
  /Claim your free spot/i,
  /Reserve My Free Spot/i,
  /Let's Build This Thing/i,
  /50 Profitable/i,
];

const publicSurfaces = [
  "src/pages/Index.tsx",
  "src/components/landing/HeroSection.tsx",
  "src/components/landing/FinalCTASection.tsx",
  "src/components/landing/FAQSection.tsx",
  "src/components/landing/AboutHostSection.tsx",
  "src/components/landing/EarlyAccessSection.tsx",
  "src/components/landing/WhyThisWorks.tsx",
  "src/components/landing/StickyCtaBar.tsx",
  "src/components/quiz/QuizContainer.tsx",
  "src/components/quiz/EmailCaptureForm.tsx",
  "src/pages/Dashboard.tsx",
];

describe("landing / quiz / dashboard: no unverified marketing claims", () => {
  for (const file of publicSurfaces) {
    it(`${file} contains no forbidden claims`, () => {
      const src = read(file);
      for (const pattern of FORBIDDEN_CLAIMS) {
        expect(src, `${file} should not match ${pattern}`).not.toMatch(pattern);
      }
    });
  }
});

describe("SocialProofSection renders only approved DB testimonials", () => {
  it("has no fabricated fallback testimonials", () => {
    const src = read("src/components/landing/SocialProofSection.tsx");
    expect(src).not.toMatch(/fallbackTestimonials/);
    expect(src).not.toMatch(/Sarah M\./);
    expect(src).not.toMatch(/Marcus T\./);
    expect(src).not.toMatch(/Jennifer K\./);
    expect(src).toMatch(/return null/);
  });
});

describe("landing CTA hierarchy", () => {
  it("Hero primary CTA copy is 'Get Free Early Access'", () => {
    const src = read("src/components/landing/HeroSection.tsx");
    expect(src).toMatch(/Get Free Early Access/);
  });
  it("FinalCTASection primary CTA copy is 'Get Free Early Access'", () => {
    const src = read("src/components/landing/FinalCTASection.tsx");
    expect(src).toMatch(/Get Free Early Access/);
  });
  it("StickyCtaBar CTA copy is 'Get Free Early Access'", () => {
    const src = read("src/components/landing/StickyCtaBar.tsx");
    expect(src).toMatch(/Get Free Early Access/);
    expect(src).not.toMatch(/Join Free/);
  });
  it("Quiz heading is 'Get early access in 60 seconds'", () => {
    const src = read("src/pages/Index.tsx");
    expect(src).toMatch(/Get early access in/);
    expect(src).toMatch(/60 seconds/);
  });
});

describe("Quiz question 3 is prelaunch-truthful", () => {
  it("uses 'when lessons open' framing, not 'this week'", () => {
    const src = read("src/components/quiz/QuizContainer.tsx");
    expect(src).toMatch(/When the lessons open/);
    expect(src).not.toMatch(/build a real, working app this week/);
  });
});

describe("Hero accessibility contract", () => {
  it("exposes exactly one accessible H1 with an aria-label", () => {
    const src = read("src/components/landing/HeroSection.tsx");
    const h1Matches = src.match(/<h1[\s\S]*?>/g) ?? [];
    expect(h1Matches.length).toBe(1);
    expect(src).toMatch(/aria-label={H1_TEXT}/);
    // Decorative inner spans hidden from AT
    expect(src).toMatch(/aria-hidden="true"/);
  });
  it("respects prefers-reduced-motion for scroll parallax", () => {
    const src = read("src/components/landing/HeroSection.tsx");
    expect(src).toMatch(/useReducedMotion/);
  });
});

describe("Footer identity", () => {
  it("uses AI For Business identity and no 'AI For Beginners' brand", () => {
    const src = read("src/pages/Index.tsx");
    expect(src).toMatch(/AI For Business/);
    expect(src).not.toMatch(/AI FOR BEGINNERS/);
    expect(src).not.toMatch(/name: "AI For Beginners"/);
  });
});

describe("Landing page structure — no fake urgency / value stack", () => {
  it("Index.tsx does not import ValueStackSection or ShippedMarquee", () => {
    const src = read("src/pages/Index.tsx");
    expect(src).not.toMatch(/ValueStackSection/);
    expect(src).not.toMatch(/ShippedMarquee/);
    expect(src).not.toMatch(/SocialProofSection/);
  });
});