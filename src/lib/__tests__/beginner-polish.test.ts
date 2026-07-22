import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");
const read = (rel: string) => readFileSync(resolve(root, rel), "utf8");

describe("beginner polish — SEO metadata", () => {
  const src = read("src/pages/Index.tsx");

  it("uses beginner-first title and description on the homepage", () => {
    expect(src).toMatch(
      /title="Free 5-Day AI Website & App Challenge for Beginners · Appreneur"/,
    );
    expect(src).toMatch(
      /description="Build your first website or app with AI in 5 days—even if technology has always intimidated you\. Free, self-paced, start anytime, with no coding or developer required\."/,
    );
  });

  it("passes the same title to trackPageView", () => {
    expect(src).toMatch(
      /trackPageView\([\s\S]*?"Free 5-Day AI Website & App Challenge for Beginners · Appreneur"/,
    );
  });

  it("does not mention 'non-coders' or the old 'app idea in your head' line", () => {
    expect(src).not.toMatch(/non-coders/i);
    expect(src).not.toMatch(/app idea in your head/i);
  });

  it("keeps the truthful canonical URL", () => {
    expect(src).toMatch(/canonicalUrl="https:\/\/appreneur\.ai\/"/);
  });
});

describe("beginner polish — Hero H1 accessibility contract", () => {
  const src = read("src/components/landing/HeroSection.tsx");

  it("no longer defines a local H1_TEXT string", () => {
    expect(src).not.toMatch(/const\s+H1_TEXT\s*=/);
  });

  it("imports HERO_H1 from shared constants", () => {
    expect(src).toMatch(
      /import[^;]*HERO_H1[^;]*from ["']@\/lib\/constants["']/,
    );
  });

  it("uses HERO_H1 as the aria-label on the H1", () => {
    expect(src).toMatch(/aria-label={HERO_H1}/);
  });
});

describe("beginner polish — FAQ plain-English recovery answer", () => {
  const src = read("src/components/landing/FAQSection.tsx");

  it("no longer uses the phrase 'sandboxed'", () => {
    expect(src).not.toMatch(/sandbox/i);
  });

  it("uses the 'practice version' plain-English framing", () => {
    expect(src).toMatch(/practice version/);
    expect(src).toMatch(
      /Nothing you do affects a real customer or a live business system until you decide to share it\./,
    );
  });

  it("does not introduce a privacy claim or fake human-support promise", () => {
    // The whole file — not just this answer — must not accidentally imply
    // a live coach in the recovery guidance.
    const canBreakAnswer = src.match(
      /id:\s*"break_anything"[\s\S]*?answer:\s*"([^"]+)"/,
    );
    expect(canBreakAnswer).not.toBeNull();
    const answer = canBreakAnswer![1];
    expect(answer).not.toMatch(/support team|live agent|coach|call us|encrypt/i);
  });
});

describe("beginner polish — hero mockup matches the typed request", () => {
  const src = read("src/components/landing/AppBuilderMockup.tsx");

  it("still types the quote-calculator prompt", () => {
    expect(src).toMatch(
      /Build a simple customer quote calculator for my business\./,
    );
  });

  it("renders quote-calculator labels (Service, Quantity, Estimated total)", () => {
    expect(src).toMatch(/"Service"/);
    expect(src).toMatch(/"Quantity"/);
    expect(src).toMatch(/Estimated total/);
    expect(src).toMatch(/Website setup/);
    expect(src).toMatch(/\$1,500/);
  });

  it("has no calendar / calendar-grid / payment / bell remnants", () => {
    expect(src).not.toMatch(/CalendarIcon/);
    expect(src).not.toMatch(/CreditCard/);
    expect(src).not.toMatch(/\bBell\b/);
    expect(src).not.toMatch(/showCalendar/);
    expect(src).not.toMatch(/showCards/);
    expect(src).not.toMatch(/PREVIEW_CALENDAR/);
    expect(src).not.toMatch(/PREVIEW_CARDS/);
    // Day-of-week header row for a calendar grid.
    expect(src).not.toMatch(/\["S", "M", "T", "W", "T", "F", "S"\]/);
  });

  it("keeps reduced-motion behavior and the final live/share banner", () => {
    expect(src).toMatch(/useReducedMotion/);
    expect(src).toMatch(/Live · you can share this link/);
  });

  it("keeps the illustrative honesty label in the Hero", () => {
    const hero = read("src/components/landing/HeroSection.tsx");
    expect(hero).toMatch(/Illustrative build demonstration/);
  });
});