
-- 1) Revoke EXECUTE on SECURITY DEFINER functions that should not be callable by signed-in users.
-- Trigger functions and service-only helpers: revoke from public and authenticated.
REVOKE EXECUTE ON FUNCTION public.rate_limit_funnel_events() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_profile_privileged_columns() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_user_progress_gating_columns() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_app_screenshots_limits() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.initialize_user_progress_for(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.claim_registration_delivery(uuid, text, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_spots_taken(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.reserve_cohort_spot(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.release_cohort_spot(uuid) FROM PUBLIC, anon, authenticated;

-- 2) Waitlist: add explicit restrictive policy blocking non-admin reads on any code path.
DROP POLICY IF EXISTS "Block non-admin waitlist reads" ON public.waitlist;
CREATE POLICY "Block non-admin waitlist reads"
ON public.waitlist
AS RESTRICTIVE
FOR SELECT
TO public
USING (public.is_admin(auth.uid()));

-- 3) challenge-resources bucket: SELECT policy tying object access to user's unlocked/completed day
-- Storage object names are expected to be prefixed with "day-<n>/..." e.g. "day-1/workbook.pdf".
DROP POLICY IF EXISTS "Users can read challenge resources they've unlocked" ON storage.objects;
CREATE POLICY "Users can read challenge resources they've unlocked"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'challenge-resources'
  AND EXISTS (
    SELECT 1
    FROM public.user_progress up
    WHERE up.user_id = auth.uid()
      AND up.is_unlocked = true
      AND (
        split_part(storage.objects.name, '/', 1) = 'day-' || up.day_number::text
        OR split_part(storage.objects.name, '/', 1) = 'shared'
      )
  )
);
