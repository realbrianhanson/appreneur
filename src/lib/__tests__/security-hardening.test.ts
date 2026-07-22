import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "../../..");
function read(rel: string): string {
  return readFileSync(resolve(root, rel), "utf8");
}

describe("security hardening — feature flags fail closed", () => {
  it("send-sms requires SMS_ENABLED === 'true'", () => {
    const src = read("supabase/functions/send-sms/index.ts");
    expect(src).toMatch(/SMS_ENABLED.*!==.*'true'/);
    expect(src).toMatch(/status:\s*503/);
  });

  it("sms-scheduler requires SMS_ENABLED === 'true'", () => {
    const src = read("supabase/functions/sms-scheduler/index.ts");
    expect(src).toMatch(/SMS_ENABLED.*!==.*'true'/);
    expect(src).toMatch(/status:\s*503/);
  });

  it("stripe-webhook requires VIP_SALES_ENABLED === 'true' before processing", () => {
    const src = read("supabase/functions/stripe-webhook/index.ts");
    // Flag check must appear BEFORE signature verification.
    const flagIdx = src.indexOf('VIP_SALES_ENABLED');
    const sigIdx = src.indexOf('constructEventAsync');
    expect(flagIdx).toBeGreaterThan(0);
    expect(sigIdx).toBeGreaterThan(flagIdx);
  });
});

describe("security hardening — track-funnel-event", () => {
  const src = read("supabase/functions/track-funnel-event/index.ts");

  it("allowlists only pre-registration event types", () => {
    expect(src).toMatch(/quiz_started/);
    expect(src).toMatch(/quiz_completed/);
    expect(src).toMatch(/lead_captured/);
    // No server-only or authenticated events accepted from browser.
    expect(src).not.toMatch(/registration_complete/);
    expect(src).not.toMatch(/vip_offer_viewed/);
    expect(src).not.toMatch(/downsell_viewed/);
  });

  it("restricts CORS to production + preview origins", () => {
    expect(src).toMatch(/appreneur\.ai/);
    expect(src).toMatch(/appreneur\.lovable\.app/);
    expect(src).toMatch(/id-preview--/);
  });

  it("fails closed when FUNNEL_RATE_LIMIT_SECRET is missing", () => {
    expect(src).toMatch(/FUNNEL_RATE_LIMIT_SECRET/);
    expect(src).toMatch(/status:\s*503/);
  });

  it("uses HMAC of IP with server secret — never stores IP", () => {
    expect(src).toMatch(/hmacKey/);
    expect(src).toMatch(/HMAC/);
  });

  it("bounds body size and event_data size", () => {
    expect(src).toMatch(/MAX_BODY_BYTES/);
    expect(src).toMatch(/MAX_EVENT_DATA_BYTES/);
  });
});

describe("security hardening — get-testimonials", () => {
  const src = read("supabase/functions/get-testimonials/index.ts");

  it("does not return arbitrary legacy external screenshot URLs", () => {
    // The block that returned `legacy` full https URLs must be gone.
    expect(src).not.toMatch(/legacy\s*&&\s*\/\^https\?/);
  });

  it("does not include completedCount aggregate any more", () => {
    expect(src).not.toMatch(/completedCount/);
  });

  it("returns generic error text — no raw error.message", () => {
    expect(src).not.toMatch(/error instanceof Error \?\s*error\.message/);
    expect(src).toMatch(/internal_error/);
  });
});

describe("security hardening — get-progress CORS allowlist", () => {
  const src = read("supabase/functions/get-progress/index.ts");
  it("does not use a wildcard origin", () => {
    expect(src).not.toMatch(/Access-Control-Allow-Origin[^\n]*\*/);
    expect(src).toMatch(/appreneur\.ai/);
  });
});

describe("security hardening — frontend no longer writes funnel_events directly", () => {
  it("QuizContainer routes through trackFunnelEvent()", () => {
    const src = read("src/components/quiz/QuizContainer.tsx");
    expect(src).not.toMatch(/from\("funnel_events"\)\.insert/);
    expect(src).not.toMatch(/from\("quiz_leads"\)\.insert/);
    expect(src).toMatch(/trackFunnelEvent\(/);
  });

  it("VIPOffer and Downsell no longer write to funnel_events from browser", () => {
    expect(read("src/pages/VIPOffer.tsx")).not.toMatch(/from\("funnel_events"\)\.insert/);
    expect(read("src/pages/Downsell.tsx")).not.toMatch(/from\("funnel_events"\)\.insert/);
  });
});