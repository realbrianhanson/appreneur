import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  MECHANISM_LINE,
  BELIEF_ANALOGY,
  HERO_SUPPORT_COPY,
} from "../constants";
import { REQUIRED_OBJECTION_IDS } from "@/content/landingCopy";

const read = (p: string) => readFileSync(resolve(p), "utf8");

describe("belief-bridge: mechanism line + analogy", () => {
  it("mechanism line is the exact belief-bridge sentence", () => {
    expect(MECHANISM_LINE).toBe(
      "You do not have to understand the technology. You just have to learn how to direct it.",
    );
  });
  it("supporting analogy positions AI as the assistant", () => {
    expect(BELIEF_ANALOGY).toBe(
      "Think of AI as the assistant. You're still the business owner.",
    );
  });
  it("OpportunityMechanismSection renders both lines", () => {
    const src = read("src/components/landing/OpportunityMechanismSection.tsx");
    expect(src).toMatch(/MECHANISM_LINE/);
    expect(src).toMatch(/BELIEF_ANALOGY/);
  });
});

describe("belief-bridge: hero support copy", () => {
  it("frames the ability bar around typing an email and following video", () => {
    expect(HERO_SUPPORT_COPY).toMatch(/type an email/i);
    expect(HERO_SUPPORT_COPY).toMatch(/step-by-step video/i);
  });
  it("names Brian and mentions what to do when AI is wrong", () => {
    expect(HERO_SUPPORT_COPY).toMatch(/Brian/);
    expect(HERO_SUPPORT_COPY).toMatch(/get it right the first time/);
  });
});

describe("belief-bridge: 'Made for you if...' section", () => {
  const src = read("src/components/landing/BeliefBridgeSection.tsx");
  const index = read("src/pages/Index.tsx");
  it("renders the exact respectful audience bullets", () => {
    expect(src).toMatch(/AI feels overwhelming and you don't know where to begin\./);
    expect(src).toMatch(/You rely on someone else for every website or technology change\./);
    expect(src).toMatch(/You have useful ideas but can't picture yourself building them\./);
    expect(src).toMatch(/You want to use AI in your business instead of watching others move ahead\./);
  });
  it("uses respectful language (no shaming or age stereotypes)", () => {
    const forbidden = [
      /old(er)? people/i,
      /boomers?/i,
      /grandma|grandpa/i,
      /left behind/i,
      /dinosaur/i,
      /too late for you/i,
    ];
    for (const p of forbidden) {
      expect(src, `BeliefBridgeSection matched ${p}`).not.toMatch(p);
    }
  });
  it("is mounted on the landing page before the persona chooser", () => {
    const beliefIdx = index.indexOf("<BeliefBridgeSection");
    const personaIdx = index.indexOf("<PersonaChooser");
    expect(beliefIdx).toBeGreaterThan(-1);
    expect(personaIdx).toBeGreaterThan(-1);
    expect(beliefIdx).toBeLessThan(personaIdx);
  });
});

describe("belief-bridge: mockup demonstrates the mechanism plainly", () => {
  const src = read("src/components/landing/AppBuilderMockup.tsx");
  it("prompt is an everyday-English business request", () => {
    expect(src).toMatch(
      /Build a simple customer quote calculator for my business\./,
    );
  });
  it("checklist uses plain English (no jargon like deploy/database/UI)", () => {
    expect(src).toMatch(/Reading what you asked for/);
    expect(src).toMatch(/Getting a link you can share/);
    expect(src).not.toMatch(/\bdatabase\b/i);
    expect(src).not.toMatch(/\bUI\b/);
    expect(src).not.toMatch(/Deploying to production/);
  });
  it("finish state says 'Live · you can share this link'", () => {
    expect(src).toMatch(/Live · you can share this link/);
  });
});

describe("belief-bridge: hero labels the mockup as illustrative, not a customer result", () => {
  const hero = read("src/components/landing/HeroSection.tsx");
  it("renders an honest illustrative caption", () => {
    expect(hero).toMatch(
      /Illustrative build demonstration — not a customer result\./,
    );
  });
});

describe("belief-bridge: FAQ answers the three beginner objections", () => {
  const src = read("src/components/landing/FAQSection.tsx");
  it("registers all three new objection ids", () => {
    for (const id of ["ai_makes_mistake", "break_anything", "watch_more_than_once"]) {
      expect(REQUIRED_OBJECTION_IDS).toContain(id as (typeof REQUIRED_OBJECTION_IDS)[number]);
      expect(src, `FAQ missing objection id ${id}`).toMatch(
        new RegExp(`id:\\s*"${id}"`),
      );
    }
  });
  it("mistake answer explains it's normal and shows how to guide AI", () => {
    expect(src).toMatch(/normal part of using AI/);
  });
  it("break-anything answer reassures with plain-English practice framing", () => {
    // "Sandboxed" was jargon for the 50+ beginner audience — the belief
    // bridge must land in everyday language.
    expect(src).toMatch(/practice version/);
    expect(src).toMatch(
      /Nothing you do affects a real customer or a live business system/,
    );
    expect(src).not.toMatch(/sandbox/i);
  });
  it("replay answer references pause, rewind, captions/transcript", () => {
    expect(src).toMatch(/pause, rewind/);
    expect(src).toMatch(/transcript/i);
  });
});

describe("belief-bridge: LandingVideoSlot describes the three-belief answers when a real video ships", () => {
  const src = read("src/components/landing/LandingVideoSlot.tsx");
  it("stays conditional on a configured video URL", () => {
    expect(src).toMatch(/isVideoConfigured\(LANDING_VSL\.videoUrl\)/);
    expect(src).toMatch(/return null/);
  });
  it("explains the three questions the walkthrough answers", () => {
    expect(src).toMatch(/Is this really\s*\n?\s*possible\?/);
    expect(src).toMatch(/isn't technical/);
    expect(src).toMatch(/what will I have at the end/i);
  });
});