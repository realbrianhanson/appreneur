
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

-- Guard direct writes to gating columns on user_progress.
CREATE OR REPLACE FUNCTION public.protect_user_progress_gating_columns()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_authrole text := auth.role();
BEGIN
  IF v_authrole = 'service_role' THEN
    RETURN NEW;
  END IF;

  NEW.is_unlocked := OLD.is_unlocked;
  NEW.is_completed := OLD.is_completed;
  NEW.completed_at := OLD.completed_at;
  NEW.tasks_completed := OLD.tasks_completed;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_user_progress_gating_columns ON public.user_progress;
CREATE TRIGGER protect_user_progress_gating_columns
BEFORE UPDATE ON public.user_progress
FOR EACH ROW EXECUTE FUNCTION public.protect_user_progress_gating_columns();
