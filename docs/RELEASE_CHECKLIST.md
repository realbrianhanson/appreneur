# Release checklist — launch-ready

Do not deploy until every required item below is checked. This gate exists
because the Appreneur Challenge is a launch-ready product, not a
prelaunch offer, and we must not promote an unfinished experience to
customers.

## Product status flags

- [ ] **[required]** `PRODUCT_STATUS` in `src/lib/constants.ts` is only
      flipped to `"live"` after every gate below passes.
- [ ] **[required]** `VIP_SALES_ENABLED` in `src/lib/constants.ts` and the
      `VIP_SALES_ENABLED` edge-function secret agree. Both stay off until
      Stripe live product/price IDs, webhook signing secret, refund
      policy, and fulfillment are final and a test purchase + test refund
      have been performed on live keys.
- [ ] **[required]** `SMS_ENABLED` edge secret stays `false` unless
      Twilio, consent language, delivery rules, opt-out / STOP handling,
      and admin authorization have been verified. SMS is optional and
      must not block release if intentionally disabled.
- [ ] `TOTAL_DAYS = 5`. No other value is supported.

## Content — VSL, lessons, resources

- [ ] **[required]** Landing VSL is final: recorded, edited, captioned,
      transcript published, and referenced in
      `src/content/lessonVideos.ts`.
- [ ] **[required]** All five lesson videos (Day 1–5) are final: every
      click shown, every new word defined in plain English, checkpoints,
      safe recovery steps, pause-and-do prompts, captions, and
      transcripts. Day 1 includes an early visible on-screen change.
- [ ] **[required]** Every worksheet, template, and resource promised in
      `docs/CONTENT_PRODUCTION_PLAN.md` is uploaded, tested end-to-end,
      and downloadable inside the LMS.
- [ ] **[required]** Owner signs `docs/decisions/CONTENT_APPROVED.md`
      once VSL, 5 lessons, captions/transcripts, worksheets, and lesson
      QA are complete. Video URLs alone are not enough.

## End-to-end smoke tests (desktop and mobile)

- [ ] Signup flow completes: quiz → account creation → welcome email
      received with a working login link.
- [ ] Login and password reset both succeed on desktop and mobile.
- [ ] Day 1 unlocks immediately, Day 2–5 unlock only after prior-day
      completion; the `complete_task` RPC agrees with the UI task lists.
- [ ] Screenshot upload works, storage is private, previews use signed
      URLs, and testimonial approval flow succeeds.
- [ ] Graduation flow renders only after Day 5 is genuinely complete;
      certificate PDF downloads.
- [ ] Admin dashboard: overview stats, users list, and settings load
      without permission errors.

## VIP offer (only if enabling at launch)

- [ ] **[required]** `docs/VIP_OFFER_BRIEF.md` has no missing owner
      inputs. All fields are filled.
- [ ] VIP pages, copy, prices, refund policy, fulfillment, support
      inbox, and bonuses are final.
- [ ] Stripe live product and price IDs configured; `STRIPE_SECRET_KEY`
      and `STRIPE_WEBHOOK_SECRET` are live-mode.
- [ ] Test purchase and test refund both succeed on live keys.
- [ ] `VIP_SALES_ENABLED` flipped on in code and edge secret only after
      the above.

## Proof, testimonials, claims

- [ ] Every rendered testimonial has full name, role/company, headshot,
      exact quote, permission, source context, and admin approval per
      `docs/TESTIMONIAL_COLLECTION.md`.
- [ ] `src/content/verifiedProof.ts` and `docs/CLAIMS_AND_PROOF.md`
      agree; no `pending` claim renders publicly.
- [ ] No placeholders, lorem, or "coming soon" strings remain on public
      pages.
- [ ] **[required]** Owner signs
      `docs/decisions/TESTIMONIALS_APPROVED.md`.

## Legal, email, and identity

- [ ] Legal entity name, address, Terms, Privacy, refund language, and
      contact inboxes are reviewed and correct.
- [ ] **[required]** Owner signs `docs/decisions/LEGAL_APPROVED.md`.
- [ ] Email domain authenticated (SPF, DKIM, DMARC). `RESEND_API_KEY`,
      `FROM_EMAIL`, and `REPLY_TO_EMAIL` set as edge secrets.
- [ ] Welcome email, delivery email, password reset, and any
      transactional email are tested end-to-end.
- [ ] **[required]** Owner signs
      `docs/decisions/EMAIL_CONFIG_APPROVED.md`.

## Security configuration

- [ ] **[required]** `FUNNEL_RATE_LIMIT_SECRET` is configured as an edge
      secret before public traffic reaches production. Without it,
      `track-funnel-event` fails closed and drops analytics. Never write
      the value into any doc, marker, or log.
- [ ] `VIP_SALES_ENABLED` edge secret and frontend flag agree.
- [ ] CORS allowlists include only production origins; `APP_URL`
      matches the custom domain.
- [ ] All storage buckets used for user uploads are private, size- and
      MIME-restricted, and served via signed URLs.
- [ ] Dependency scan and secret scan pass. CI is green.
- [ ] **[required]** Owner signs
      `docs/decisions/SECURITY_CONFIG_APPROVED.md` (marker only — never
      paste secret values into it).

## Infrastructure and SEO

- [ ] Custom domain live over HTTPS; SSL valid; canonical set.
- [ ] `robots.txt`, `sitemap.xml`, and canonical URLs are correct.
- [ ] Social preview metadata and image render on Twitter / LinkedIn /
      Facebook preview tools.
- [ ] Analytics consent respects the owner's chosen approach; no
      tracking loads before consent where required.
- [ ] Backups / recovery documented and tested.

## Honesty guardrails

- [ ] No cohort dates, countdowns, or seat-scarcity language unless the
      scarcity is real and enforced.
- [ ] No "coming soon", "being recorded", "early access", "prelaunch",
      or roadmap language anywhere customer-facing.
- [ ] No unapproved claims from `docs/CLAIMS_AND_PROOF.md` render.

## CI + release gate

- [ ] `npm run check` passes locally (lint + typecheck + vitest).
- [ ] `.github/workflows/ci.yml` green on the branch.
- [ ] `npm run release:check` prints "Release check passed." Any failure
      lists categories only — no secret values.

## Post-deploy smoke

1. Load `/` on desktop and mobile — hero renders, primary CTA works, no
   forbidden phrases.
2. Complete signup and reach the dashboard.
3. Complete Day 1 through Day 5 end-to-end.
4. Confirm graduation certificate downloads.
5. If VIP is enabled: complete a live test purchase and refund.

Do not deploy until every required item is checked.
