

## End-to-End Testing Plan

I'll systematically test every page, flow, and component in the app using the browser, capturing screenshots and verifying both UI and functional outcomes. After each section I'll log findings, and at the end I'll fix any bugs discovered.

### Scope

**Public funnel**
1. Landing page (`/`) — hero, opening copy, journey timeline, value stack, social proof, urgency, FAQ, about host, final CTA, sticky CTA bar, floating particles
2. Quiz flow — 3 questions, email capture, cohort assignment, waitlist fallback
3. Thank-you page (`/thank-you`)
4. VIP offer page (`/vip-offer`) — countdown, CTA
5. Downsell page (`/downsell`)
6. Privacy (`/privacy`) and Terms (`/terms`)

**Auth**
7. Login page (`/login`) — magic link tab, password tab, validation
8. Auth callback (`/auth/callback`)

**Dashboard (logged-in user)**
9. Dashboard home (`/dashboard`) — sidebar, top bar, mobile bottom nav, day cards, locked/unlocked states, onboarding wizard, notifications
10. Day mission pages (`/dashboard/day/1` through `/dashboard/day/5`) — task checklist, completion, time tracking, day-complete celebration
11. Graduation (`/dashboard/graduation`) — testimonial modal
12. Profile (`/dashboard/profile`)
13. Settings (`/dashboard/settings`) — change password section

**Admin (super_admin: brian@realagency.com)**
14. Overview (`/admin`) — stats cards, charts, recent activity
15. Users (`/admin/users`) — list, filters, detail sheet, actions
16. Cohorts (`/admin/cohorts`) — list, create, detail
17. Revenue (`/admin/revenue`)
18. Analytics (`/admin/analytics`) — date range, daily metrics, funnel, FB ads, cohort analysis
19. Testimonials (`/admin/testimonials`) — approval workflow
20. Webhooks (`/admin/webhooks`) — endpoints, deliveries
21. Settings (`/admin/settings`)

**Responsive**
22. Mobile viewport (390×844) sweep of landing, dashboard, day mission, admin

**Backend sanity**
23. Edge function smoke tests: `get-progress`, `complete-task`, `complete-day`, `get-testimonials`, `send-email` (dry), `fire-webhook`
24. DB checks: cohorts have spots available, RLS allows expected reads, no orphaned rows
25. Console + network error scan on every page

### Method

For each page/flow:
- Navigate, screenshot, observe
- Click through critical interactions (one `act` at a time)
- Verify outcome by checking DB row, edge function log, or follow-up UI state — not just that the button responded
- Capture console errors and failed network requests
- Note any layout, contrast, overflow, or z-index issues

### Bug handling

If I find a bug:
- Stop the sweep, fix the file directly, re-test that flow
- Group small visual fixes into one batch at the end
- Log every fix in the final report

### Deliverable

A single end-of-run report with:
- ✅/❌ status per page and per flow
- Screenshots of any broken states (before fix) and fixed states (after)
- List of bugs found and fixes applied
- List of recommended improvements that weren't bugs (so you can decide)
- Any flows that couldn't be tested (e.g. real Stripe checkout, real SMS send) and why

### Not in scope (will note, not test)

- Live Stripe payments (placeholder integration per memory)
- Real Twilio SMS sends (would cost money / spam users) — I'll verify the function deploys and the queue logic, not actual delivery
- Production email sends to real addresses — verify Resend function returns 200, don't spam

### Technical notes

- Browser tool shares the preview's Supabase session. Dev bypass in `ProtectedRoute` already lets me into `/dashboard` and `/admin` without logging in, so I can test protected routes directly.
- For destructive admin actions (delete user, delete cohort) I'll only operate on test rows or skip and report.
- I'll use `supabase--read_query` to verify writes landed correctly after UI actions.

