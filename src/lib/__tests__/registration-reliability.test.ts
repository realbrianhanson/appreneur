import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

describe("registration reliability — analytics has no PII", () => {
  beforeEach(() => {
    vi.resetModules();
    (globalThis as any).window = globalThis;
    (globalThis as any).gtag = vi.fn();
    (globalThis as any).fbq = vi.fn();
  });

  it("does not include user_email in GA4 or FB pixel payloads", async () => {
    const { trackRegistrationComplete } = await import("../analytics");
    trackRegistrationComplete({ eventId: "user-abc" });
    const gtag = (globalThis as any).gtag as ReturnType<typeof vi.fn>;
    const fbq = (globalThis as any).fbq as ReturnType<typeof vi.fn>;
    const flatGtag = JSON.stringify(gtag.mock.calls);
    const flatFbq = JSON.stringify(fbq.mock.calls);
    expect(flatGtag.toLowerCase()).not.toContain("email");
    expect(flatFbq.toLowerCase()).not.toContain("email");
    expect(flatGtag).toContain("user-abc");
  });
});

describe("registration reliability — no direct browser email/webhook calls", () => {
  it("QuizContainer does not import sendWelcomeEmail or fireWebhook", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/quiz/QuizContainer.tsx"),
      "utf8",
    );
    expect(src).not.toMatch(/from ["']@\/lib\/email["']/);
    expect(src).not.toMatch(/from ["']@\/lib\/webhooks["']/);
    expect(src).not.toMatch(/\bsendWelcomeEmail\s*\(/);
    expect(src).not.toMatch(/\bfireWebhook\s*\(/);
  });

  it("QuizContainer routes through finalize-registration helper", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/quiz/QuizContainer.tsx"),
      "utf8",
    );
    expect(src).toMatch(/finalizeRegistration/);
  });

  it("QuizContainer does not put email into funnel event_data", () => {
    const src = readFileSync(
      join(process.cwd(), "src/components/quiz/QuizContainer.tsx"),
      "utf8",
    );
    // No `email: data.email` inside event_data payload.
    expect(src).not.toMatch(/event_data:\s*\{[^}]*email:\s*data\.email/);
  });
});

describe("registration reliability — finalize-registration edge function", () => {
  const src = readFileSync(
    join(process.cwd(), "supabase/functions/finalize-registration/index.ts"),
    "utf8",
  );

  it("rejects requests without an authenticated JWT", () => {
    // Bearer must exist and differ from the anon key; getUser must succeed.
    expect(src).toMatch(/bearer === supabaseAnonKey/);
    expect(src).toMatch(/auth\.getUser\(\)/);
    expect(src).toMatch(/status:\s*401/);
  });

  it("uses claim RPC before sending email and webhook", () => {
    const claimCalls = src.match(/claim_registration_delivery/g) ?? [];
    expect(claimCalls.length).toBeGreaterThanOrEqual(2);
  });

  it("returns not_configured instead of blocking when email env is missing", () => {
    expect(src).toMatch(/not_configured/);
    expect(src).toMatch(/!resendKey \|\| !fromEmail \|\| !replyTo/);
  });

  it("template contains AI For Business footer and no cohort/VIP promises", () => {
    expect(src).toMatch(/AI For Business/);
    expect(src).not.toMatch(/cohort/i);
    expect(src).not.toMatch(/countdown/i);
    expect(src.toLowerCase()).not.toContain("vip");
  });

  it("HTML-escapes interpolated values", () => {
    expect(src).toMatch(/function escapeHtml/);
    expect(src).toMatch(/escapeHtml\(data\.firstName/);
  });

  it("includes a plain-text body alongside HTML", () => {
    expect(src).toMatch(/text:\s*built\.text/);
  });
});

describe("registration reliability — send-email hardening", () => {
  const src = readFileSync(
    join(process.cwd(), "supabase/functions/send-email/index.ts"),
    "utf8",
  );

  it("returns not_configured when FROM_EMAIL or REPLY_TO_EMAIL missing", () => {
    expect(src).toMatch(/not_configured/);
    expect(src).toMatch(/RESEND_API_KEY.*FROM_EMAIL.*REPLY_TO_EMAIL|has_from/s);
  });

  it("HTML-escapes template data and adds a plain-text body", () => {
    expect(src).toMatch(/escapeTemplateData/);
    expect(src).toMatch(/htmlToText/);
  });

  it("does not return provider error text to clients", () => {
    expect(src).toMatch(/email_send_failed/);
    expect(src).not.toMatch(/error:\s*error\.message/);
  });

  it("appends the AI For Business transactional footer", () => {
    expect(src).toMatch(/AI For Business/);
  });
});

describe("registration reliability — corrective legacy cohort migration", () => {
  it("has a migration that sets legacy cohorts is_active=false explicitly", () => {
    const dir = join(process.cwd(), "supabase/migrations");
    const files = readdirSync(dir);
    const combined = files
      .map((f) => readFileSync(join(dir, f), "utf8"))
      .join("\n---\n");
    expect(combined).toMatch(/UPDATE\s+public\.cohorts[\s\S]*is_active\s*=\s*false/i);
  });
});