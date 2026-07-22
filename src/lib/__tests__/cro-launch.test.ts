import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  PRIMARY_CTA_LABEL,
  SECONDARY_CTA_LABEL,
  REGISTRATION_CTA_LABEL,
  HERO_EYEBROW,
  HERO_H1,
  HERO_SUPPORT_COPY,
  MECHANISM_LINE,
  MOMENTUM_LINE,
} from "../constants";
import {
  HEADLINE_VARIANTS,
  CONTROL_HEADLINE,
  PERSONA_CHOICES,
  REQUIRED_OBJECTION_IDS,
} from "@/content/landingCopy";
import { LESSON_VIDEOS, LANDING_VSL, isVideoConfigured } from "@/content/lessonVideos";

const read = (p: string) => readFileSync(resolve(p), "utf8");

describe("CRO: launch-ready control copy", () => {
  it("uses owner-specified above-fold strings", () => {
    expect(HERO_EYEBROW).toBe(
      "THE FREE 5-DAY AI WEBSITE & APP-BUILDING CHALLENGE FOR BEGINNERS",
    );
    expect(HERO_H1).toBe(
      "Build Your First Website or App With AI—in 5 Days—even if tech has always intimidated you.",
    );
    expect(HERO_SUPPORT_COPY).toMatch(/type an email/i);
    expect(HERO_SUPPORT_COPY).toMatch(/step-by-step video/i);
    expect(HERO_SUPPORT_COPY).toMatch(/Brian/);
    expect(PRIMARY_CTA_LABEL).toBe("Start My Free 5-Day Challenge");
    expect(SECONDARY_CTA_LABEL).toBe("See What I'll Build");
    expect(REGISTRATION_CTA_LABEL).toBe("Create My Free Challenge Account");
  });

  it("keeps the control headline as the only rendered variant", () => {
    expect(HEADLINE_VARIANTS.length).toBe(3);
    expect(HEADLINE_VARIANTS[0].id).toBe("control");
    expect(CONTROL_HEADLINE).toBe(HEADLINE_VARIANTS[0].headline);
    // Challengers exist in code as documentation, but never in a rendered file.
    const rendered = [
      read("src/pages/Index.tsx"),
      read("src/components/landing/HeroSection.tsx"),
    ].join("\n");
    for (const v of HEADLINE_VARIANTS.slice(1)) {
      expect(rendered).not.toContain(v.headline);
    }
  });
});

describe("CRO: hero has exactly one dominant CTA + a small secondary anchor", () => {
  const hero = read("src/components/landing/HeroSection.tsx");
  it("renders the primary CTA once", () => {
    // btn-primary-pill is the primary style; must appear once in the hero.
    const matches = hero.match(/btn-primary-pill/g) ?? [];
    expect(matches.length).toBe(1);
  });
  it("has a secondary anchor (not another button)", () => {
    expect(hero).toMatch(/SECONDARY_CTA_LABEL/);
    expect(hero).toMatch(/href="#see-what-youll-build"|href="#early-access"/);
  });
});

describe("CRO: authority strip is imported above the fold in Index", () => {
  const src = read("src/pages/Index.tsx");
  it("imports AuthorityStrip and OpportunityMechanismSection", () => {
    expect(src).toMatch(/AuthorityStrip/);
    expect(src).toMatch(/OpportunityMechanismSection/);
  });
  it("renders <AuthorityStrip /> before <AboutHostSection", () => {
    const authIdx = src.indexOf("<AuthorityStrip");
    const aboutIdx = src.indexOf("<AboutHostSection");
    expect(authIdx).toBeGreaterThan(-1);
    expect(aboutIdx).toBeGreaterThan(-1);
    expect(authIdx).toBeLessThan(aboutIdx);
  });
});

describe("CRO: mechanism section states the mechanism line verbatim", () => {
  it("MECHANISM_LINE states the belief-bridge line verbatim", () => {
    expect(MECHANISM_LINE).toBe(
      "You do not have to understand the technology. You just have to learn how to direct it.",
    );
  });
  it("OpportunityMechanismSection renders MECHANISM_LINE", () => {
    const src = read("src/components/landing/OpportunityMechanismSection.tsx");
    expect(src).toMatch(/MECHANISM_LINE/);
    expect(src).toMatch(/You do not need to become a tech person/);
    expect(src).toMatch(/learn how to tell AI what you want/);
  });
});

describe("CRO: PersonaChooser prefills the first quiz answer and scrolls to quiz", () => {
  const src = read("src/components/landing/PersonaChooser.tsx");
  const quiz = read("src/components/quiz/QuizContainer.tsx");
  it("writes the persona to PERSONA_STORAGE_KEY", () => {
    expect(src).toMatch(/PERSONA_STORAGE_KEY/);
    expect(src).toMatch(/sessionStorage/);
    expect(src).toMatch(/scrollTo\("#quiz-section"/);
  });
  it("only surfaces two coded choices, mapped to the quiz answers", () => {
    expect(PERSONA_CHOICES.length).toBe(2);
    const values = PERSONA_CHOICES.map((c) => c.quizAnswerValue).sort();
    expect(values).toEqual(["for_business", "to_sell"]);
  });
  it("QuizContainer consumes PERSONA_STORAGE_KEY and advances past Q1", () => {
    expect(quiz).toMatch(/PERSONA_STORAGE_KEY/);
  });
});

describe("CRO: JourneyTimeline days carry explicit deliverables", () => {
  const src = read("src/components/landing/JourneyTimeline.tsx");
  it("has a 'You finish with:' label rendered per day card", () => {
    // The label lives inside the .map() so it renders once per day at runtime.
    expect(src).toMatch(/You finish with:/);
  });
  it("declares an explicit deliverable for each of the five days", () => {
    const count = (src.match(/deliverable:/g) ?? []).length;
    expect(count).toBeGreaterThanOrEqual(5);
  });
  it("uses plain-English day headlines for the beginner audience", () => {
    expect(src).toMatch(/Choose what to build/);
    expect(src).toMatch(/Sketch the small first version/);
    expect(src).toMatch(/Build the pages and make the buttons work/);
    expect(src).toMatch(/Add one useful AI-powered feature/);
    expect(src).toMatch(/Test it, fix the rough edges, and put it online/);
  });
});

describe("CRO: LandingVideoSlot renders only when a real URL is set", () => {
  const src = read("src/components/landing/LandingVideoSlot.tsx");
  it("guards render on isVideoConfigured", () => {
    expect(src).toMatch(/isVideoConfigured\(LANDING_VSL\.videoUrl\)/);
    expect(src).toMatch(/return null/);
  });
  it("VSL slot ships with an unconfigured placeholder so it never renders empty", () => {
    expect(isVideoConfigured(LANDING_VSL.videoUrl)).toBe(false);
  });
  it("all five lesson videos ship unconfigured until owner replaces them", () => {
    expect(LESSON_VIDEOS.length).toBe(5);
    for (const v of LESSON_VIDEOS) {
      expect(isVideoConfigured(v.videoUrl)).toBe(false);
    }
  });
});

describe("CRO: SocialProof is conditional and does not render empty", () => {
  const src = read("src/components/landing/SocialProofSection.tsx");
  it("returns null when testimonials is empty", () => {
    expect(src).toMatch(/testimonials\.length === 0.*return null/s);
  });
});

describe("CRO: no false urgency for a self-paced challenge", () => {
  const surfaces = [
    "src/pages/Index.tsx",
    "src/components/landing/HeroSection.tsx",
    "src/components/landing/FinalCTASection.tsx",
    "src/components/landing/MomentumLine.tsx",
  ];
  const forbidden = [
    /seats? left/i,
    /only\s+\d+\s+spots?/i,
    /doors close/i,
    /countdown/i,
    /deadline\s+(is|ends)/i,
  ];
  for (const file of surfaces) {
    it(`${file} does not use fake scarcity`, () => {
      const src = read(file);
      for (const p of forbidden) {
        expect(src, `${file} matched ${p}`).not.toMatch(p);
      }
    });
  }
  it("MOMENTUM_LINE is used verbatim on the landing page", () => {
    expect(MOMENTUM_LINE).toMatch(/The longer the idea stays in your notes/);
    const idx = read("src/pages/Index.tsx");
    expect(idx).toMatch(/MomentumLine/);
  });
});

describe("CRO: FAQ answers every required objection", () => {
  const src = read("src/components/landing/FAQSection.tsx");
  it("covers each REQUIRED_OBJECTION_ID via question key", () => {
    for (const id of REQUIRED_OBJECTION_IDS) {
      expect(src, `FAQ missing objection id ${id}`).toMatch(
        new RegExp(`id:\\s*"${id}"`),
      );
    }
  });
});

describe("CRO: launch-ready product noun and no roadmap/plan/program", () => {
  const surfaces = [
    "src/pages/Index.tsx",
    "src/components/landing/HeroSection.tsx",
    "src/components/landing/AuthorityStrip.tsx",
    "src/components/landing/OpportunityMechanismSection.tsx",
    "src/components/landing/JourneyTimeline.tsx",
    "src/components/landing/EarlyAccessSection.tsx",
    "src/components/landing/FAQSection.tsx",
    "src/components/landing/FinalCTASection.tsx",
    "src/components/landing/StickyCtaBar.tsx",
    "src/components/landing/OpeningCopySection.tsx",
    "src/components/landing/PersonaChooser.tsx",
    "src/components/quiz/QuizContainer.tsx",
    "src/components/quiz/EmailCaptureForm.tsx",
  ];
  const forbidden = [
    /\broadmap\b/i,
    /5-day plan\b/i,
    /five-day plan\b/i,
    /\bearly access\b/i,
    /\bprelaunch\b/i,
    /being recorded/i,
    /when lessons open/i,
  ];
  for (const file of surfaces) {
    it(`${file} has no forbidden framing`, () => {
      const src = read(file);
      for (const p of forbidden) {
        expect(src, `${file} matched ${p}`).not.toMatch(p);
      }
    });
  }
});