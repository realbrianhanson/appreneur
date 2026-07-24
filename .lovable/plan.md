## Goal
Stop being kicked out of preview and stop needing magic links to get back in.

Sessions already persist (`persistSession: true`, `autoRefreshToken: true` in the Supabase client), so once you sign in with a password the preview keeps you logged in across reloads until you explicitly log out. The real friction is the login page defaulting to "Magic Link".

## Changes (login UX only, no auth/business logic changes)

1. **`src/pages/Login.tsx`** — flip the default mode from `"magic"` to `"password"` so email + password is the first thing shown. Magic Link stays available via the toggle. No other logic changes.

2. **Preview-only auto-login helper (optional, opt-in)** — add a tiny dev helper that, only when `import.meta.env.DEV` is true AND you've set `VITE_DEV_LOGIN_EMAIL` + `VITE_DEV_LOGIN_PASSWORD` in `.env.local`, calls `supabase.auth.signInWithPassword` on app boot if no session exists. Gated behind both the DEV flag and the presence of the env vars so it can never ship to production. If you don't want this, say so and I'll skip it.

3. **`.env.example`** — document the two optional `VITE_DEV_LOGIN_*` vars with a "preview only, never set in production" note.

## Notes
- No change to `AuthContext`, session storage, RLS, or any protected route logic.
- If sessions are actually being lost between preview reloads (not just the magic-link UX), tell me and I'll investigate the persistence path instead.

Want me to include the auto-login helper (#2), or just flip the default to password (#1 only)?