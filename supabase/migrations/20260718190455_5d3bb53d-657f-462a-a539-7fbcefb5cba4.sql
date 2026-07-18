
-- 1. Admin SELECT on downloads
CREATE POLICY "Admins can view all downloads"
ON public.downloads FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- 2. Admin SELECT on waitlist
CREATE POLICY "Admins can view waitlist"
ON public.waitlist FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- 3. Storage: prevent public listing of app-screenshots; scope SELECT to owner or admin.
-- Direct public URLs on public buckets bypass RLS and continue to work.
DROP POLICY IF EXISTS "Screenshots are publicly accessible" ON storage.objects;

CREATE POLICY "Users can list own screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'app-screenshots'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR public.is_admin(auth.uid())
  )
);

-- 4. Revoke EXECUTE from anon/authenticated on internal SECURITY DEFINER functions
-- (triggers and edge-function-only helpers). Callers as service_role are unaffected.
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.rate_limit_funnel_events() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_profile_privileged_columns() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_spots_taken(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.initialize_user_progress(uuid) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.complete_task(integer, text, text[]) FROM anon, PUBLIC;

-- Also revoke anon access to helper/user-scoped functions (authenticated retains access where needed).
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_stats(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_revenue_stats() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reserve_cohort_spot(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.release_cohort_spot(uuid) FROM anon, PUBLIC;
