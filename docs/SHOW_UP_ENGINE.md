# Show-Up Engine (self-paced lifecycle plan)

> Plan only. Do NOT activate automations until email + VIP details are
> owner-approved. All send triggers here are `templateName` proposals for
> the existing `send-transactional-email` function — they run per-recipient,
> triggered by a specific event for that recipient (transactional, not
> marketing).

## Goals
- Immediate reassurance and one obvious next action after signup.
- Bring stalled participants back to Day 1 without pressure.
- Celebrate each daily completion so momentum compounds.
- Recognize graduation clearly at Day 5.

## Lifecycle events

| Event                     | Trigger                                                | Timing (hypothesis) | Purpose                          |
| ------------------------- | ------------------------------------------------------ | ------------------- | -------------------------------- |
| welcome                   | `registration_complete` for this user                  | ≤ 1 minute          | Confirm account + Start Day 1    |
| not_started_nudge         | Day 1 not marked complete                              | +24h, +72h          | Bring them back to Day 1         |
| day_completed             | `complete_task` closes any Day N (1..4)                | ≤ 5 minutes         | Celebrate + tee up Day N+1       |
| stalled_progress          | Day N unlocked but no tasks in 5 days                  | +5d, +12d           | Resume email with next mission   |
| graduation                | Day 5 marked complete                                  | ≤ 5 minutes         | Congratulate + next-iteration    |

## Suppression rules
- Never send `not_started_nudge` after Day 1 is complete.
- Cap resume emails at 2 sends per user per calendar month.
- Honor `suppressed_emails` unconditionally (bounces / complaints / unsubs).
- Respect the shared idempotency key on every send.

## Consent / category
- Transactional under our current terms — each send is tied to a specific
  event for a specific recipient who created a free account.
- No promotional content, no third-party offers, no cross-sell in these
  templates.

## Metrics to watch (post-launch)
- Signup → Day 1 start rate within 24h.
- Day N → Day N+1 completion rate.
- Graduation rate.
- Bounce and complaint rate stays under 0.1% and 0.02% respectively.

## Not scoped here
- VIP post-purchase drip — belongs in `docs/VIP_OFFER_BRIEF.md`.
- Community / office-hours emails — waiting on owner-defined support model.