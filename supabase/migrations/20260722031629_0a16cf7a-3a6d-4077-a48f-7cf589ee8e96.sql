
-- 1. STORAGE POLICIES (bucket already switched to private via storage_update_bucket)
DROP POLICY IF EXISTS "Users can upload screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can list own screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Public can view app screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view app screenshots" ON storage.objects;
DROP POLICY IF EXISTS "app_screenshots_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "app_screenshots_owner_select" ON storage.objects;
DROP POLICY IF EXISTS "app_screenshots_owner_delete" ON storage.objects;

CREATE POLICY "app_screenshots_owner_insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'app-screenshots'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);

CREATE POLICY "app_screenshots_owner_select"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'app-screenshots'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR public.is_admin(auth.uid())
  )
);

CREATE POLICY "app_screenshots_owner_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'app-screenshots'
  AND (
    (storage.foldername(name))[1] = (auth.uid())::text
    OR public.is_admin(auth.uid())
  )
);

-- Size + MIME enforcement via BEFORE INSERT trigger on storage.objects
CREATE OR REPLACE FUNCTION public.enforce_app_screenshots_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_size bigint;
  v_mime text;
BEGIN
  IF NEW.bucket_id <> 'app-screenshots' THEN
    RETURN NEW;
  END IF;

  v_size := (NEW.metadata->>'size')::bigint;
  v_mime := NEW.metadata->>'mimetype';

  IF v_size IS NOT NULL AND v_size > 5242880 THEN
    RAISE EXCEPTION 'File exceeds 5 MB limit' USING ERRCODE = 'check_violation';
  END IF;

  IF v_mime IS NOT NULL AND v_mime NOT IN ('image/jpeg','image/png','image/webp') THEN
    RAISE EXCEPTION 'Unsupported mime type: %', v_mime USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_app_screenshots_limits ON storage.objects;
CREATE TRIGGER enforce_app_screenshots_limits
BEFORE INSERT OR UPDATE ON storage.objects
FOR EACH ROW EXECUTE FUNCTION public.enforce_app_screenshots_limits();

-- 2. TESTIMONIALS: dedicated path column
ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS app_screenshot_path text;

-- 3. COHORT SPOT COUNTERS: strip execute from client roles
REVOKE EXECUTE ON FUNCTION public.reserve_cohort_spot(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.release_cohort_spot(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_spots_taken(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_cohort_spot(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.release_cohort_spot(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_spots_taken(uuid) TO service_role;

-- 4. initialize_user_progress: uses auth.uid()
DROP FUNCTION IF EXISTS public.initialize_user_progress(uuid);

CREATE OR REPLACE FUNCTION public.initialize_user_progress()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.user_progress (user_id, day_number, is_unlocked)
  SELECT v_user_id, generate_series(1, 5), false
  ON CONFLICT (user_id, day_number) DO NOTHING;

  UPDATE public.user_progress
  SET is_unlocked = true
  WHERE user_id = v_user_id AND day_number = 1;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.initialize_user_progress() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.initialize_user_progress() TO authenticated, service_role;

-- Service-role-only variant for admin/edge init-for-user flows
CREATE OR REPLACE FUNCTION public.initialize_user_progress_for(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  INSERT INTO public.user_progress (user_id, day_number, is_unlocked)
  SELECT p_user_id, generate_series(1, 5), false
  ON CONFLICT (user_id, day_number) DO NOTHING;

  UPDATE public.user_progress
  SET is_unlocked = true
  WHERE user_id = p_user_id AND day_number = 1;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.initialize_user_progress_for(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_user_progress_for(uuid) TO service_role;

-- 5. complete_task: server-authoritative task lists
DROP FUNCTION IF EXISTS public.complete_task(integer, text, text[]);

CREATE OR REPLACE FUNCTION public.complete_task(p_day_number integer, p_task_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_required text[];
  v_tasks_completed jsonb;
  v_all_complete boolean := true;
  v_was_completed boolean;
  v_unlocked boolean;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF p_day_number < 1 OR p_day_number > 5 THEN
    RAISE EXCEPTION 'Invalid day_number';
  END IF;

  v_required := CASE p_day_number
    WHEN 1 THEN ARRAY['watch_video','define_idea','create_wireframe','share_community']
    WHEN 2 THEN ARRAY['watch_video','setup_project','build_layout','add_navigation']
    WHEN 3 THEN ARRAY['watch_video','add_features','connect_data','test_app']
    WHEN 4 THEN ARRAY['watch_video','add_ai_feature','refine_prompts','integrate_ai']
    WHEN 5 THEN ARRAY['watch_video','deploy_app','launch_app','share_success']
  END;

  IF NOT (p_task_id = ANY(v_required)) THEN
    RAISE EXCEPTION 'Unknown task_id % for day %', p_task_id, p_day_number;
  END IF;

  SELECT is_unlocked, is_completed, tasks_completed
    INTO v_unlocked, v_was_completed, v_tasks_completed
  FROM public.user_progress
  WHERE user_id = v_user_id AND day_number = p_day_number
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Day progress not initialized';
  END IF;

  IF NOT v_unlocked THEN
    RAISE EXCEPTION 'Day not unlocked';
  END IF;

  IF NOT (v_tasks_completed ? p_task_id) THEN
    v_tasks_completed := COALESCE(v_tasks_completed, '{}'::jsonb)
                       || jsonb_build_object(p_task_id, now());
  END IF;

  FOR i IN 1..array_length(v_required, 1) LOOP
    IF NOT (v_tasks_completed ? v_required[i]) THEN
      v_all_complete := false;
      EXIT;
    END IF;
  END LOOP;

  UPDATE public.user_progress
  SET tasks_completed = v_tasks_completed,
      is_completed = v_all_complete OR v_was_completed,
      completed_at = CASE
        WHEN v_all_complete AND NOT v_was_completed THEN now()
        ELSE completed_at
      END,
      updated_at = now()
  WHERE user_id = v_user_id AND day_number = p_day_number;

  IF v_all_complete AND p_day_number < 5 THEN
    UPDATE public.user_progress
    SET is_unlocked = true, updated_at = now()
    WHERE user_id = v_user_id AND day_number = p_day_number + 1
      AND is_unlocked = false;
  END IF;

  RETURN jsonb_build_object(
    'task_id', p_task_id,
    'day_number', p_day_number,
    'day_completed', v_all_complete,
    'next_day_unlocked', v_all_complete AND p_day_number < 5,
    'required_task_count', array_length(v_required, 1)
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.complete_task(integer, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_task(integer, text) TO authenticated, service_role;
