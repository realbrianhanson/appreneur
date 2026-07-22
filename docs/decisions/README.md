# Decision markers

This folder holds owner sign-off markers used by
`scripts/release-check.mjs`. Each marker is a small Markdown file
recording that the owner has personally reviewed and approved a category
before production deploy. Markers should be created only when the
underlying work is genuinely complete — they exist to make the release
gate refuse to promote an unfinished product.

Required markers before production:

- `LEGAL_APPROVED.md` — legal entity, name, address, Terms, Privacy,
  refund language, and contact inboxes reviewed and correct.
- `EMAIL_CONFIG_APPROVED.md` — email domain authenticated, Resend keys
  set, welcome / delivery / password / reset emails tested.
- `TESTIMONIALS_APPROVED.md` — every rendered testimonial has full
  attribution, source context, permission, and admin approval.
- `CONTENT_APPROVED.md` — landing VSL and all 5 lesson videos have
  captions, transcripts, worksheets, and lesson QA complete.
- `SECURITY_CONFIG_APPROVED.md` — production edge secrets configured,
  including `FUNNEL_RATE_LIMIT_SECRET`. Secret values must never be
  written into this file — this marker is a checklist attestation only.

Each marker file should contain the reviewer, date, and a one-line
summary of what was verified. Do not paste secrets into any marker.