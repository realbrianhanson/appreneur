-- 1. Make challenge-resources bucket private
UPDATE storage.buckets SET public = false WHERE id = 'challenge-resources';

-- 2. Drop any existing broad SELECT policies on challenge-resources, then add admin/owner policies.
-- Listing/reading is now done via signed URLs from the edge function (service role).
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND (qual LIKE '%challenge-resources%' OR with_check LIKE '%challenge-resources%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

-- Admins can manage challenge-resources (upload, list, delete)
CREATE POLICY "Admins can manage challenge-resources"
ON storage.objects FOR ALL
USING (bucket_id = 'challenge-resources' AND public.is_admin(auth.uid()))
WITH CHECK (bucket_id = 'challenge-resources' AND public.is_admin(auth.uid()));

-- 3. Funnel events rate limit: max 30 inserts per session_id per minute
CREATE OR REPLACE FUNCTION public.rate_limit_funnel_events()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recent_count integer;
BEGIN
  -- Skip rate limit when called by service role (admin/edge functions)
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  SELECT COUNT(*) INTO v_recent_count
  FROM public.funnel_events
  WHERE session_id = NEW.session_id
    AND created_at > now() - interval '1 minute';

  IF v_recent_count >= 30 THEN
    RAISE EXCEPTION 'Rate limit exceeded for funnel events (max 30 per minute per session)'
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS funnel_events_rate_limit ON public.funnel_events;
CREATE TRIGGER funnel_events_rate_limit
BEFORE INSERT ON public.funnel_events
FOR EACH ROW
EXECUTE FUNCTION public.rate_limit_funnel_events();

-- Index to keep the rate-limit query fast
CREATE INDEX IF NOT EXISTS idx_funnel_events_session_created
ON public.funnel_events (session_id, created_at DESC);