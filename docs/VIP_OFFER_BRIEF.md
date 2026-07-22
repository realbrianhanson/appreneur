# VIP Offer Brief (Owner Inputs Required)

VIP is preserved in the codebase as a fail-closed, disabled offer. It
will remain hidden and the checkout function will return HTTP 503 until
the following are confirmed in writing by the owner. There are no
invented defaults.

## Owner decisions needed

| Field | Owner input |
| --- | --- |
| Ideal buyer | |
| Transformation (before to after) | |
| Deliverables (what's included) | |
| Delivery format (video / live / template) | |
| Support and access (channels, SLA, duration) | |
| Bonuses (name, contents, standalone value) | |
| Price (USD) | |
| Order bump (what, price) | |
| Downsell (what, price) | |
| Refund / guarantee terms | |
| Capacity / scarcity basis (real cap or none) | |
| Fulfillment (how buyers get access, timing) | |
| Legal / tax (entity of record, VAT/GST handling) | |
| Post-purchase path (day-of email, day-1 experience, follow-up) | |

## Do-not-do until confirmed

- Do not enable `VIP_SALES_ENABLED` in `src/lib/constants.ts`.
- Do not remove the fail-closed guard in
  `supabase/functions/create-checkout-session/index.ts`.
- Do not render prices, order-bump/downsell copy, or scarcity claims on
  any public page.
- Do not restore or invent VIP marketing copy from earlier drafts.

## Release-gate implication

`npm run release:check` MUST fail while any of the above fields are
blank.