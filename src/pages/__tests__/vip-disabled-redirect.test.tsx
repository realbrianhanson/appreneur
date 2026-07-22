import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

describe("disabled VIP/Downsell", () => {
  const vip = readFileSync("src/pages/VIPOffer.tsx", "utf8");
  const down = readFileSync("src/pages/Downsell.tsx", "utf8");

  it("VIPOffer redirects to /dashboard with replace when disabled", () => {
    expect(vip).toMatch(/if\s*\(\s*!VIP_SALES_ENABLED\s*\)\s*\{\s*return\s*<Navigate\s+to="\/dashboard"\s+replace\s*\/>/);
  });

  it("Downsell redirects to /dashboard with replace when disabled", () => {
    expect(down).toMatch(/if\s*\(\s*!VIP_SALES_ENABLED\s*\)\s*\{\s*return\s*<Navigate\s+to="\/dashboard"\s+replace\s*\/>/);
  });

  it("neither VIP page imports or renders PrelaunchSalesPlaceholder", () => {
    expect(vip).not.toMatch(/PrelaunchSalesPlaceholder/);
    expect(down).not.toMatch(/PrelaunchSalesPlaceholder/);
  });

  it("PrelaunchSalesPlaceholder component file is deleted", () => {
    expect(existsSync("src/components/PrelaunchSalesPlaceholder.tsx")).toBe(false);
  });

  it("no source file references PrelaunchSalesPlaceholder anywhere", () => {
    const hits: string[] = [];
    for (const f of walk("src")) {
      if (!/\.(tsx?|jsx?)$/.test(f)) continue;
      if (f.includes("__tests__")) continue;
      if (readFileSync(f, "utf8").includes("PrelaunchSalesPlaceholder")) hits.push(f);
    }
    expect(hits).toEqual([]);
  });

  it("no disabled-state placeholder copy (coming soon / being recorded / first to know / details finalized) is present in VIP or Downsell", () => {
    for (const src of [vip, down]) {
      const lower = src.toLowerCase();
      expect(lower).not.toContain("coming soon");
      expect(lower).not.toContain("being recorded");
      expect(lower).not.toContain("first to know");
      expect(lower).not.toContain("details are being finalized");
    }
  });

  it("eventual VIP copy uses 'Launch QA checklist', not 'Pre-launch QA'", () => {
    expect(vip).toContain("Launch QA checklist");
    expect(vip).not.toMatch(/Pre-launch QA/i);
  });
});

describe("release-check scope", () => {
  const script = readFileSync("scripts/release-check.mjs", "utf8");

  it("excludes internal admin pages from the customer-facing scan", () => {
    expect(script).toMatch(/INTERNAL_EXCLUDE_PREFIXES/);
    expect(script).toContain("src/pages/admin/");
  });

  it("still enforces the core forbidden phrases on real customer-facing content", () => {
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
});