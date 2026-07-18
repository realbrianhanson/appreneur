
-- 1. profiles: block non-admin edits to privileged columns
CREATE OR REPLACE FUNCTION public.enforce_profile_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service role and admins may change anything
  IF auth.role() = 'service_role' OR public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  -- Force privileged columns back to their old values for regular users
  NEW.is_vip := OLD.is_vip;
  NEW.stripe_customer_id := OLD.stripe_customer_id;
  NEW.cohort_id := OLD.cohort_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_profile_privileged_columns_trg ON public.profiles;
CREATE TRIGGER enforce_profile_privileged_columns_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_privileged_columns();

-- Also tighten the RLS UPDATE policy with a WITH CHECK
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2. testimonials: non-admins cannot self-approve/feature
DROP POLICY IF EXISTS "Users can submit testimonials" ON public.testimonials;
CREATE POLICY "Users can submit testimonials"
ON public.testimonials
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND (
    public.is_admin(auth.uid())
    OR (is_approved = false AND is_featured = false)
  )
);

-- 3. user_progress: add WITH CHECK to UPDATE policy
DROP POLICY IF EXISTS "Users can update own progress" ON public.user_progress;
CREATE POLICY "Users can update own progress"
ON public.user_progress
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. reserve_cohort_spot: restrict to authenticated; add release function
REVOKE EXECUTE ON FUNCTION public.reserve_cohort_spot(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reserve_cohort_spot(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.release_cohort_spot(p_cohort_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.cohorts
  SET spots_taken = GREATEST(spots_taken - 1, 0),
      updated_at = now()
  WHERE id = p_cohort_id;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.release_cohort_spot(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.release_cohort_spot(uuid) TO authenticated, service_role;

-- 5. get_user_stats: only owner or admin
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streak integer := 0;
  v_days_completed integer;
  v_total_time integer;
  v_cohort_id uuid;
  v_cohort_size integer;
  v_rank integer;
  v_percentile numeric;
  v_caller uuid;
BEGIN
  v_caller := auth.uid();
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF p_user_id <> v_caller AND NOT public.is_admin(v_caller) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT cohort_id INTO v_cohort_id FROM public.profiles WHERE id = p_user_id;

  SELECT COUNT(*) INTO v_days_completed
  FROM public.user_progress
  WHERE user_id = p_user_id AND is_completed = true;

  SELECT COALESCE(SUM(time_spent_seconds), 0) INTO v_total_time
  FROM public.user_progress
  WHERE user_id = p_user_id;

  SELECT COUNT(*) INTO v_streak
  FROM (
    SELECT day_number, is_completed,
           day_number - ROW_NUMBER() OVER (ORDER BY day_number) as grp
    FROM public.user_progress
    WHERE user_id = p_user_id AND is_completed = true
    ORDER BY day_number
  ) sub
  WHERE grp = 0;

  IF v_cohort_id IS NOT NULL THEN
    SELECT COUNT(*) INTO v_cohort_size FROM public.profiles WHERE cohort_id = v_cohort_id;

    SELECT COUNT(*) + 1 INTO v_rank
    FROM public.profiles p
    JOIN (
      SELECT user_id, COUNT(*) as completed
      FROM public.user_progress
      WHERE is_completed = true
      GROUP BY user_id
    ) up ON p.id = up.user_id
    WHERE p.cohort_id = v_cohort_id
      AND up.completed > v_days_completed;

    v_percentile := ROUND(((v_cohort_size - v_rank + 1)::numeric / v_cohort_size) * 100, 1);
  ELSE
    v_percentile := 0;
  END IF;

  RETURN jsonb_build_object(
    'days_completed', v_days_completed,
    'streak', v_streak,
    'total_time_seconds', v_total_time,
    'percentile', v_percentile,
    'cohort_rank', v_rank,
    'cohort_size', v_cohort_size
  );
END;
$$;
REVOKE EXECUTE ON FUNCTION public.get_user_stats(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_user_stats(uuid) TO authenticated, service_role;

-- 6. cohorts: admin write policies
CREATE POLICY "Admins can insert cohorts"
ON public.cohorts FOR INSERT TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update cohorts"
ON public.cohorts FOR UPDATE TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete cohorts"
ON public.cohorts FOR DELETE TO authenticated
USING (public.is_admin(auth.uid()));

-- 8. performance indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_cohort_id ON public.profiles(cohort_id);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON public.purchases(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_approved ON public.testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON public.testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_session_id ON public.funnel_events(session_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_user_id ON public.sms_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_sent_at ON public.sms_logs(sent_at DESC);
