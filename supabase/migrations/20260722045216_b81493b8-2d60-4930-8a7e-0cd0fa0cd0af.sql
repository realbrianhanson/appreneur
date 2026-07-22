
-- 1) Drop direct public/anonymous INSERT policies. Historical data preserved.
DROP POLICY IF EXISTS "Anyone can insert funnel events" ON public.funnel_events;
DROP POLICY IF EXISTS "Anyone can submit quiz leads"    ON public.quiz_leads;
DROP POLICY IF EXISTS "Anyone can join waitlist"        ON public.waitlist;
DROP POLICY IF EXISTS "Users can insert own progress"   ON public.user_progress;

-- 2) Revoke direct table INSERT privileges from anon/authenticated so
--    the Data API cannot even attempt these writes.
REVOKE INSERT ON public.funnel_events FROM anon, authenticated;
REVOKE INSERT ON public.quiz_leads    FROM anon, authenticated;
REVOKE INSERT ON public.waitlist      FROM anon, authenticated;
REVOKE INSERT ON public.user_progress FROM anon, authenticated;

-- Service role retains full access for edge-function writes.
GRANT INSERT ON public.funnel_events TO service_role;
GRANT INSERT ON public.quiz_leads    TO service_role;
GRANT INSERT ON public.waitlist      TO service_role;
GRANT INSERT ON public.user_progress TO service_role;

-- 3) Revoke EXECUTE on trigger-only SECURITY DEFINER helpers from
--    non-privileged roles. These functions are called by triggers, never
--    directly by application code. `initialize_user_progress`,
--    `initialize_user_progress_for`, `complete_task`, `is_admin`,
--    `has_role`, `get_user_stats`, `get_revenue_stats`, `admin_*`,
--    `claim_registration_delivery`, and cohort helpers keep their normal
--    EXECUTE grants because they are called by app / edge-function code.
REVOKE EXECUTE ON FUNCTION public.protect_user_progress_gating_columns() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_app_screenshots_limits()       FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_profile_privileged_columns()   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rate_limit_funnel_events()             FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column()             FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                      FROM PUBLIC, anon, authenticated;
