import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Regression tests for the prelaunch admin surface and analytics helpers.
 *
 * These are file-scan checks — cheap to run, hard to fool. They protect the
 * "no fake numbers, no PII to analytics" contract even if a future edit
 * tries to re-introduce a removed helper or hard-coded price.
 */

const read = (relPath: string) => readFileSync(resolve(relPath), "utf8");

describe("analytics helpers stay PII-free during prelaunch", () => {
  const analytics = read("src/lib/analytics.ts");

  it("does not export purchase / VIP / downsell conversion helpers", () => {
    expect(analytics).not.toMatch(/trackVIPPurchase/);
    expect(analytics).not.toMatch(/trackVIPOfferView/);
    expect(analytics).not.toMatch(/trackDownsellView/);
  });

  it("has no hard-coded VIP or downsell price", () => {
    // Prices like $27 / 27 / 7 must not be baked into analytics helpers.
    expect(analytics).not.toMatch(/price:\s*27\b/);
    expect(analytics).not.toMatch(/price:\s*7\b/);
  });

  it("registration tracker takes no answer/email payload", () => {
    // The helper must only accept an opaque eventId — not email or auth ids.
    expect(analytics).toMatch(
      /trackRegistrationComplete\s*=\s*\(\s*opts\?\s*:\s*\{\s*eventId\?:\s*string\s*\}\s*\)/,
    );
  });
});

describe("admin sidebar surfaces only prelaunch-appropriate routes", () => {
  const sidebar = read("src/components/admin/AdminSidebar.tsx");

  it("does not link to /admin/cohorts or /admin/revenue", () => {
    expect(sidebar).not.toMatch(/\/admin\/cohorts/);
    expect(sidebar).not.toMatch(/\/admin\/revenue/);
  });
});

describe("app routes drop cohort/revenue admin pages", () => {
  const app = read("src/App.tsx");

  it("does not register /admin/cohorts or /admin/revenue routes", () => {
    expect(app).not.toMatch(/\/admin\/cohorts/);
    expect(app).not.toMatch(/\/admin\/revenue/);
  });

  it("wraps routes in an ErrorBoundary", () => {
    expect(app).toMatch(/ErrorBoundary/);
  });
});

describe("VIP / Downsell placeholders come first during prelaunch", () => {
  const vip = read("src/pages/VIPOffer.tsx");
  const dow = read("src/pages/Downsell.tsx");

  it("VIPOffer skips page-view tracking when sales are disabled", () => {
    expect(vip).toMatch(/if\s*\(!VIP_SALES_ENABLED\)\s*return/);
  });

  it("Downsell skips page-view tracking when sales are disabled", () => {
    expect(dow).toMatch(/if\s*\(!VIP_SALES_ENABLED\)\s*return/);
  });
});

describe("index.html sets a real title, description, and canonical", () => {
  const html = read("index.html");

  it("has an Appreneur-specific title", () => {
    expect(html).toMatch(/<title>Appreneur Challenge/);
    expect(html).not.toMatch(/Lovable App/);
    expect(html).not.toMatch(/Lovable Generated Project/);
  });

  it("declares a canonical link", () => {
    expect(html).toMatch(/<link rel="canonical"/);
  });

  it("does not inline GA4 or Meta Pixel loaders in prelaunch", () => {
    expect(html).not.toMatch(/gtag\/js/);
    expect(html).not.toMatch(/connect\.facebook\.net/);
  });
});

describe("release documentation exists", () => {
  it("ships a release checklist", () => {
    const doc = read("docs/RELEASE_CHECKLIST.md");
    expect(doc).toMatch(/VIP_SALES_ENABLED/);
    expect(doc).toMatch(/PRODUCT_STATUS/);
  });

  it("ships an on-call runbook", () => {
    const doc = read("docs/RUNBOOK.md");
    expect(doc).toMatch(/admin_overview_stats|admin_list_users/);
  });
});