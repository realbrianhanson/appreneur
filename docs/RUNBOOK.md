# Runbook

Operational playbook for on-call. Every scenario lists the observable signal,
where to look, and how to remediate without touching production data blindly.

## 1. Learners can't sign up

- Signal: registrations flatline in `Admin → Overview`, `funnel_events` shows
  `signup_attempt` but no matching `profiles.created_at` rows.
- Check:
  - `finalize-registration` edge function logs for auth errors.
  - `auth.users` isn't at its provider limit.
- Fix:
  - If email-confirmation flow is stuck, verify `RESEND_API_KEY`,
    `FROM_EMAIL`, `REPLY_TO_EMAIL` are set. Missing values render
    `email_status: "not_configured"` — access is preserved but no email
    goes out; ping ops to configure Resend.

## 2. Welcome email not arriving

- Signal: `Admin → Overview → Welcome email delivery` shows `failed` climbing
  or `not_configured` non-zero.
- Check: `finalize-registration` logs. Row-level detail is in
  `registration_deliveries.email_last_error`.
- Fix: rotate the Resend API key if `401`. Deliveries are idempotent —
  the next call retries within the attempt cap.

## 3. Webhook subscriber getting duplicates

- Signal: webhook subscriber reports the same `user.registered` twice.
- Check: `registration_deliveries.webhook_attempts` and
  `webhook_deliveries` history. The client MUST dedupe on the event id;
  our retry policy is at-least-once.
- Fix: nothing on our side — confirm the client is deduping. If a specific
  endpoint is broken, disable it in `Admin → Webhooks`.

## 4. Admin dashboard 403 / permission errors

- Signal: `Failed to load stats` toast, network tab shows `permission denied`
  from `admin_overview_stats` or `admin_list_users`.
- Check: the calling account has a row in `user_roles` with
  `role IN ('admin','super_admin')`.
- Fix: grant the role via a trusted admin script or migration. Never edit
  `user_roles` from client code.

## 5. Stripe checkout returning 503

- Signal: `/vip-offer` "Redirecting…" then error toast. Edge function logs
  show HTTP 503.
- Check: `VIP_SALES_ENABLED` in `src/lib/constants.ts`. During prelaunch
  the flag is `false` and checkout intentionally fails closed.
- Fix: to enable sales, follow `docs/RELEASE_CHECKLIST.md` VIP-sales
  section. Do not bypass the flag.

## 6. Landing page shows a fabricated stat

- Signal: someone spotted "500+ entrepreneurs" or "starts Tuesday" copy
  on the marketing site.
- Fix: this is a regression. Open the offending file, remove the claim,
  re-run `npm run test` (the regression suite fails on forbidden claims),
  redeploy.

## 7. Rolling back

- Frontend: click "Publish → Update" on the previous good deploy in Lovable.
- Backend (edge functions / migrations): the last deployed migration is
  authoritative. To revert schema, write a new migration that undoes the
  change — do not manually edit history.