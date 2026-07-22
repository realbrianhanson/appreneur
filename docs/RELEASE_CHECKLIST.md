# Release checklist

Follow this before promoting a change from preview to production. Do NOT skip
items marked **[required]** — they are the guardrails that keep the prelaunch
product honest.

## Feature flags — must match reality

- [ ] **[required]** `PRODUCT_STATUS` in `src/lib/constants.ts` reflects the
      current stage. Flip from `"prelaunch"` to `"live"` only when lesson
      videos, resources, and support flows are actually shipping.
- [ ] **[required]** `VIP_SALES_ENABLED` in `src/lib/constants.ts` is only
      `true` when Stripe is fully configured (product IDs, webhook signing
      secret, real prices) and refund policy is public.
- [ ] `TOTAL_DAYS = 5`. No other value is supported by the LMS.

## Copy audit — no scheduled-cohort promises

- [ ] Landing hero, quiz, dashboard, and thank-you copy never mention a
      cohort date, seat count, countdown, "starts Tuesday", or "email sent"
      guarantee.
- [ ] No fabricated statistics: no "500+ entrepreneurs", "9 countries",
      "4.9 rating" or similar unless the numbers are truthful **and**
      cited from the database.
- [ ] `SocialProofSection` renders only approved database testimonials; empty
      state renders nothing.

## Analytics — no PII to third parties

- [ ] No GA4 or Meta Pixel loader in `index.html` while
      `PRODUCT_STATUS === "prelaunch"`.
- [ ] `src/lib/analytics.ts` still contains no purchase / VIP / downsell
      conversion helpers (add them back only when VIP sales are enabled).
- [ ] Registration analytics dedupe uses `sessionStorage.session_id`, never
      `auth.uid()` or the user's email.

## Database & delivery

- [ ] `admin_overview_stats` and `admin_list_users` RPCs execute against a
      staging project without a permission error.
- [ ] `finalize-registration` returns `email_status: "not_configured"`
      gracefully when `RESEND_API_KEY` / `FROM_EMAIL` / `REPLY_TO_EMAIL` are
      not set — access must not be blocked.
- [ ] `fire-webhook` rejects private/loopback URLs both on save and delivery.

## Checks (CI)

- [ ] `npm run check` passes locally (lint + typecheck + vitest).
- [ ] `.github/workflows/ci.yml` is green on the branch.

## Post-deploy smoke test

1. Load `/` → hero, "Get Free Early Access" primary CTA visible, no cohort
   date promised.
2. Complete the quiz → land on `/thank-you` → no scheduled-cohort promises.
3. Open `/dashboard` → Day 1 unlocked, "Lesson video is being recorded"
   preview state visible.
4. Visit `/vip-offer` and `/downsell` while `VIP_SALES_ENABLED=false` →
   both render the honest placeholder with a working dashboard link.
5. Visit `/admin` as an admin → Overview loads, Users lists paginated rows,
   Settings shows the current feature-flag values.