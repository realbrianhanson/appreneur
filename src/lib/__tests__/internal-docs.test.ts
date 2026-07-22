import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const DOCS_DIR = "docs";

function readAllDocs(): Array<[string, string]> {
  const out: Array<[string, string]> = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith(".md")) out.push([p, readFileSync(p, "utf8")]);
    }
  };
  walk(DOCS_DIR);
  return out;
}

describe("internal docs hygiene", () => {
  it("no docs/*.md contains literal patch markers", () => {
    const dirty: string[] = [];
    for (const [file, text] of readAllDocs()) {
      if (
        text.includes("*** Add File:") ||
        text.includes("*** Begin Patch") ||
        text.includes("*** End Patch")
      ) {
        dirty.push(file);
      }
    }
    expect(dirty).toEqual([]);
  });

  it("RELEASE_CHECKLIST.md contains no stale prelaunch customer-facing instructions", () => {
    const text = readFileSync("docs/RELEASE_CHECKLIST.md", "utf8").toLowerCase();
    for (const phrase of [
      "get free early access",
      "lesson video is being recorded",
      "being recorded",
      "prelaunch",
      "pre-launch",
      "early access",
    ]) {
      expect(text).not.toContain(phrase);
    }
    // And it explicitly forbids deploying until every required item is checked.
    expect(text).toContain("do not deploy until every required item is checked");
  });

  it("CONTENT_PRODUCTION_PLAN.md contains all five plain-English missions and beginner lesson requirements", () => {
    const text = readFileSync("docs/CONTENT_PRODUCTION_PLAN.md", "utf8");
    for (const heading of [
      "Day 1 — Choose what to build",
      "Day 2 — Sketch the small first version",
      "Day 3 — Build the pages and make the buttons work",
      "Day 4 — Add one useful AI feature",
      "Day 5 — Test, fix, and put it online",
    ]) {
      expect(text).toContain(heading);
    }
    for (const requirement of [
      "captions",
      "transcript",
      "checkpoint",
      "recovery",
      "pause-and-do",
      "plain recap",
    ]) {
      expect(text.toLowerCase()).toContain(requirement);
    }
    // Jargon must be defined, not assumed.
    expect(text.toLowerCase()).not.toMatch(/\bwireframe\b(?![^\n]*plain)/);
  });
});

describe(".env.example documents server-only flags/secrets", () => {
  const env = readFileSync(".env.example", "utf8");
  it("distinguishes VITE_ browser-safe values from server-only edge secrets", () => {
    expect(env).toMatch(/VITE_SUPABASE_URL/);
    expect(env).toMatch(/VITE_SUPABASE_PUBLISHABLE_KEY/);
    expect(env.toLowerCase()).toContain("browser-safe");
    expect(env.toLowerCase()).toContain("server-only");
  });
  it("documents every required server-only flag/secret with a placeholder", () => {
    for (const key of [
      "FUNNEL_RATE_LIMIT_SECRET",
      "SMS_ENABLED=false",
      "VIP_SALES_ENABLED=false",
      "RESEND_API_KEY",
      "FROM_EMAIL",
      "REPLY_TO_EMAIL",
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "APP_URL",
    ]) {
      expect(env).toContain(key);
    }
  });
  it("does not contain obviously real secret material", () => {
    // Placeholders must clearly be placeholders.
    expect(env).not.toMatch(/sk_live_[A-Za-z0-9]{20,}/);
    expect(env).not.toMatch(/whsec_[A-Za-z0-9]{20,}/);
    expect(env).not.toMatch(/re_[A-Za-z0-9]{20,}/);
  });
});

describe("release-check gate", () => {
  const script = readFileSync("scripts/release-check.mjs", "utf8");
  it("requires testimonial, content, legal, email, and security approval markers", () => {
    for (const marker of [
      "docs/decisions/LEGAL_APPROVED.md",
      "docs/decisions/EMAIL_CONFIG_APPROVED.md",
      "docs/decisions/TESTIMONIALS_APPROVED.md",
      "docs/decisions/CONTENT_APPROVED.md",
      "docs/decisions/SECURITY_CONFIG_APPROVED.md",
    ]) {
      expect(script).toContain(marker);
    }
  });
  it("still forbids prelaunch/early-access/recording language and old plan/roadmap terms", () => {
    for (const phrase of [
      "early access",
      "prelaunch",
      "being recorded",
      "5-day plan",
      "5-day roadmap",
    ]) {
      expect(script).toContain(phrase);
    }
  });
  it("does not require decision markers to exist during unit tests", () => {
    // The markers should NOT already be present in the tree — the gate is
    // meant to fail until the owner intentionally creates them.
    for (const marker of [
      "docs/decisions/TESTIMONIALS_APPROVED.md",
      "docs/decisions/CONTENT_APPROVED.md",
      "docs/decisions/SECURITY_CONFIG_APPROVED.md",
      "docs/decisions/LEGAL_APPROVED.md",
      "docs/decisions/EMAIL_CONFIG_APPROVED.md",
    ]) {
      expect(existsSync(marker)).toBe(false);
    }
  });
});