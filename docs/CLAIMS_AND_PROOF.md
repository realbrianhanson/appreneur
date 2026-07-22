# Claims & Proof Registry

Durable registry of every claim we might make publicly about the Appreneur
Challenge, the instructor, or the offer. Nothing renders on the site unless
it is `confirmed` here **and** in `src/content/verifiedProof.ts`.

Status values:

- **confirmed** — owner has provided evidence; safe to render.
- **pending** — proposed wording awaiting owner evidence; do NOT render.
- **rejected** — reviewed and declined; do NOT render or re-propose.

| id | Scope | Proposed wording | Evidence / source | Status | Where it may appear |
| --- | --- | --- | --- | --- | --- |
| instructor.brian.ai_for_business | Instructor authority | "Created by Brian Hanson, founder of AI For Business—one of the world's largest AI training companies." | Owner-confirmed | confirmed | Hero authority strip, About section |
| scale.500_plus | Social proof strip | "500+ students / participants" | — | pending | — |
| scale.9_countries | Social proof strip | "Learners in 9 countries" | — | pending | — |
| rating.4_9 | Social proof strip | "4.9 / 5 average rating (n=?)" | Source + count required | pending | — |
| scale.learners_trained | Instructor authority | "Trained N business owners via AI For Business" | Exact number + method required | pending | — |
| scale.aifb_reach | Instructor authority | AI For Business audience / reach numbers | — | pending | — |
| instructor.brian_credentials | Instructor authority | Additional Brian credentials (Inc 5000, revenue, etc.) | Verified sources required | pending | — |
| portfolio.owned_apps | Instructor authority | Owned-app portfolio examples | Product names + links | pending | — |
| outcomes.participant_results | Testimonial context | Specific participant before/after outcomes | Participant quote + permission | pending | — |
| community.size | Program value | Community size claim | Live head-count + platform | pending | — |
| support.promises | Program value | Support / response-time promise | Defined SLA required | pending | — |
| offer.guarantee | Program value | Money-back or results guarantee | Written terms required | pending | — |
| offer.value_stack | Value stack | Dollar amounts on the value stack | Justifiable comps required | pending | — |
| vip.contents_price_refund | VIP offer | VIP contents, price, refund terms | See docs/VIP_OFFER_BRIEF.md | pending | — |
| urgency.seats_or_scarcity | Urgency | Seat cap / scarcity claim | Genuine capacity basis required | pending | — |

## Rules

1. Update this file and `src/content/verifiedProof.ts` together — one is
   the human record, the other is the render gate.
2. Never move a row to `confirmed` without a concrete evidence entry.
3. Numeric claims (counts, ratings, countries) require the source AND the
   count method.
4. Removed rows are still tracked here as `pending` unless the owner
   explicitly rejects them.
