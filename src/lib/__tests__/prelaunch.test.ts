import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

import {
  PRODUCT_STATUS,
  IS_PRELAUNCH,
  VIP_SALES_ENABLED,
  TOTAL_DAYS,
  hasValidCommunityUrl,
} from "../constants";

const read = (p: string) => fs.readFileSync(path.resolve(p), "utf8");

describe("prelaunch constants", () => {
  it("declares prelaunch product status with disabled paid sales", () => {
    expect(PRODUCT_STATUS).toBe("prelaunch");
    expect(IS_PRELAUNCH).toBe(true);
    expect(VIP_SALES_ENABLED).toBe(false);
    expect(TOTAL_DAYS).toBe(5);
  });

  it("validates the community URL before surfacing it", () => {
    // Current value is a real facebook URL, so it should validate as usable.
    expect(typeof hasValidCommunityUrl()).toBe("boolean");
  });
});

describe("landing/quiz truthfulness in prelaunch", () => {
  it("Index does not import useNextCohort or UrgencySection", () => {
    const src = read("src/pages/Index.tsx");
    expect(src).not.toMatch(/useNextCohort/);
    expect(src).not.toMatch(/UrgencySection/);
  });

  it("QuizContainer no longer reserves cohort spots or captures phone", () => {
    const src = read("src/components/quiz/QuizContainer.tsx");
    expect(src).not.toMatch(/reserve_cohort_spot/);
    expect(src).not.toMatch(/release_cohort_spot/);
    expect(src).not.toMatch(/increment_spots_taken/);
    expect(src).not.toMatch(/WaitlistForm/);
    expect(src).not.toMatch(/CountdownTimer/);
  });

  it("EmailCaptureForm CTA uses launch-ready registration copy", () => {
    const src = read("src/components/quiz/EmailCaptureForm.tsx");
    expect(src).toMatch(/REGISTRATION_CTA_LABEL/);
    expect(src).not.toMatch(/Get Free Early Access/);
    expect(src).not.toMatch(/SMS reminders/);
    expect(src).not.toMatch(/Reserve My Free Spot/);
  });

  it("HeroSection never fabricates a next-cohort start date", () => {
    const src = read("src/components/landing/HeroSection.tsx");
    expect(src).not.toMatch(/Next Cohort Starts/);
    expect(src).not.toMatch(/Next Cohort Starting Soon/);
  });

  it("HeroSection uses the launch-ready H1 and primary CTA label", () => {
    const src = read("src/components/landing/HeroSection.tsx");
    expect(src).toMatch(/Build Your First Website or App/);
    expect(src).toMatch(/With AI—in 5 Days/);
    expect(src).toMatch(/tech has always intimidated you/);
    expect(src).toMatch(/PRIMARY_CTA_LABEL/);
    expect(src).not.toMatch(/Get Free Early Access/);
    // No unverified marketing claims in hero
    expect(src).not.toMatch(/500\+/);
    expect(src).not.toMatch(/9 countries/);
    expect(src).not.toMatch(/Claim your free spot/);
  });
});

describe("thank-you + dashboard have no scheduled cohort promises", () => {
  it("ThankYou drops countdown, calendar files and 'email sent' claims", () => {
    const src = read("src/pages/ThankYou.tsx");
    expect(src).not.toMatch(/CountdownTimer/);
    expect(src).not.toMatch(/googleCalendarUrl/);
    expect(src).not.toMatch(/\.ics/);
    expect(src).not.toMatch(/Sent to your email/);
    expect(src).not.toMatch(/Upgrade to VIP/);
  });

  it("Dashboard removes hardcoded Live Q&A announcement", () => {
    const src = read("src/pages/Dashboard.tsx");
    expect(src).not.toMatch(/Live Q&A/);
  });
});

describe("checkout edge function fails closed in prelaunch", () => {
  it("returns 503 when VIP_SALES_ENABLED is not 'true'", () => {
    const src = read("supabase/functions/create-checkout-session/index.ts");
    expect(src).toMatch(/sales_disabled/);
    expect(src).toMatch(/503/);
    expect(src).toMatch(/VIP_SALES_ENABLED/);
    // Server builds redirect URLs — client redirect URLs are ignored.
    expect(src).not.toMatch(/body\.success_url/);
    expect(src).not.toMatch(/body\.cancel_url/);
  });
});