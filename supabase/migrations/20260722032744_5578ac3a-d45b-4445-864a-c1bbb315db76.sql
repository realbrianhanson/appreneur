
-- 1. Rewrite the trigger to rely on a transaction-local trusted-write marker.
CREATE OR REPLACE FUNCTION public.protect_user_progress_gating_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trusted text;
BEGIN
  -- Service role can always mutate.
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Trusted SECURITY DEFINER writes set this GUC transaction-locally right
  -- before their gating update. current_setting(name, true) returns NULL
  -- when the GUC is unset, avoiding an error.
  v_trusted := current_setting('app.trusted_progress_write', true);
  IF v_trusted = 'on' THEN
    RETURN NEW;
  END IF;

  -- Untrusted callers: revert every gating column.
  NEW.is_unlocked := OLD.is_unlocked;
  NEW.is_completed := OLD.is_completed;
  NEW.completed_at := OLD.completed_at;
  NEW.tasks_completed := OLD.tasks_completed;

  RETURN NEW;
END;
$$;

-- 2. complete_task: mark the write trusted before touching gating columns.
CREATE OR REPLACE FUNCTION public.complete_task(p_day_number integer, p_task_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_required text[];
  v_known text[];
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
    WHEN 1 THEN ARRAY['watch_video','define_idea','create_wireframe']
    WHEN 2 THEN ARRAY['watch_video','setup_project','build_layout']
    WHEN 3 THEN ARRAY['watch_video','add_features','connect_data']
    WHEN 4 THEN ARRAY['watch_video','add_ai_feature','refine_prompts']
    WHEN 5 THEN ARRAY['watch_video','deploy_app','launch_app','share_success']
  END;

  v_known := CASE p_day_number
    WHEN 1 THEN ARRAY['watch_video','define_idea','create_wireframe','share_community']
    WHEN 2 THEN ARRAY['watch_video','setup_project','build_layout','add_navigation']
    WHEN 3 THEN ARRAY['watch_video','add_features','connect_data','test_app']
    WHEN 4 THEN ARRAY['watch_video','add_ai_feature','refine_prompts','integrate_ai']
    WHEN 5 THEN ARRAY['watch_video','deploy_app','launch_app','share_success']
  END;

  IF NOT (p_task_id = ANY(v_known)) THEN
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

  -- Trusted-write window for this transaction. The GUC is transaction-local
  -- so it never leaks into a later request.
  PERFORM set_config('app.trusted_progress_write', 'on', true);

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

-- 3. initialize_user_progress: mark trusted before unlocking day 1.
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

  PERFORM set_config('app.trusted_progress_write', 'on', true);

  UPDATE public.user_progress
  SET is_unlocked = true
  WHERE user_id = v_user_id AND day_number = 1;
END;
$$;

-- 4. Same fix for the service-role helper.
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

  PERFORM set_config('app.trusted_progress_write', 'on', true);

  UPDATE public.user_progress
  SET is_unlocked = true
  WHERE user_id = p_user_id AND day_number = 1;
END;
$$;
