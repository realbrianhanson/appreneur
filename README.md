# Appreneur Challenge

A free, self-paced, 5-day app-building challenge by **AI For Business**.
Currently in **prelaunch** — lessons are being recorded and early-access
signups are open.

Production: <https://appreneur.ai>

## Product state

Feature flags live in [`src/lib/constants.ts`](src/lib/constants.ts):

| Flag                 | Prelaunch value | Meaning                                     |
| -------------------- | --------------- | ------------------------------------------- |
| `PRODUCT_STATUS`     | `"prelaunch"`   | Marketing copy stays truthful about videos. |
| `VIP_SALES_ENABLED`  | `false`         | Stripe checkout fails closed (HTTP 503).    |
| `TOTAL_DAYS`         | `5`             | Length of the challenge — do not change.    |

Flip these only alongside the checks in [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md).

## Architecture at a glance

- **Frontend**: Vite + React 18 + TypeScript + Tailwind + shadcn/ui.
  Framer Motion for animation. React Router for client routing.
- **Backend**: Lovable Cloud (managed Supabase). Postgres + RLS,
  auth, storage, and edge functions.
- **Deployment**: Lovable hosting for the frontend. Edge functions deploy
  automatically. Migrations run on approval via the Lovable migration tool.

### Key backend surfaces

- `handle_new_user` trigger — creates the `profiles` row on signup.
- `initialize_user_progress` / `initialize_user_progress_for` — seed the
  five `user_progress` rows and unlock Day 1.
- `complete_task` — server-authoritative task completion. All gating
  columns are locked behind a `SECURITY DEFINER` trigger that only
  trusts writes made inside a trusted claim window.
- `admin_overview_stats` / `admin_list_users` — admin dashboard RPCs.
- Edge functions: `finalize-registration`, `send-email`, `fire-webhook`,
  `create-checkout-session` (fail-closed), `complete-day` (time-only,
  idempotent).

## Local development

```sh
npm install
npm run dev
```

### CI-grade checks

```sh
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run test         # vitest
npm run check        # runs all three
```

CI (`.github/workflows/ci.yml`) runs the same commands on every push/PR.

## Editing content vs schema

- **Copy / UI**: edit files under `src/`. Frontend changes take effect
  in preview immediately, and go live only after clicking Publish.
- **Schema / RLS / functions**: use the Lovable migration tool. Every
  new `public` table needs `GRANT` statements in the same migration
  before RLS is enabled.
- **Feature flags / release state**: `src/lib/constants.ts`.

## Legal & privacy

See [`src/pages/Privacy.tsx`](src/pages/Privacy.tsx) and
[`src/pages/Terms.tsx`](src/pages/Terms.tsx). Both are owned by
**AI For Business** and last updated **July 22, 2026**.

## Operations

- [`docs/RELEASE_CHECKLIST.md`](docs/RELEASE_CHECKLIST.md) — required
  steps before promoting a build.
- [`docs/RUNBOOK.md`](docs/RUNBOOK.md) — on-call playbook for common
  signals (signup outage, email failure, webhook duplicates, etc.).
