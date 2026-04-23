-- Drop the old version that accepted p_user_id from the caller (security risk)
DROP FUNCTION IF EXISTS public.complete_task(uuid, integer, text, text[]);

-- Recreate without p_user_id; derive the user from auth.uid() instead
CREATE OR REPLACE FUNCTION public.complete_task(
  p_day_number integer,
  p_task_id text,
  p_required_tasks text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_tasks_completed jsonb;
  v_all_complete boolean;
  v_result jsonb;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT tasks_completed INTO v_tasks_completed
  FROM public.user_progress
  WHERE user_id = v_user_id AND day_number = p_day_number;

  v_tasks_completed := COALESCE(v_tasks_completed, '{}'::jsonb) || jsonb_build_object(p_task_id, now());

  v_all_complete := true;
  FOR i IN 1..array_length(p_required_tasks, 1) LOOP
    IF NOT (v_tasks_completed ? p_required_tasks[i]) THEN
      v_all_complete := false;
      EXIT;
    END IF;
  END LOOP;

  UPDATE public.user_progress
  SET
    tasks_completed = v_tasks_completed,
    is_completed = v_all_complete,
    completed_at = CASE WHEN v_all_complete THEN now() ELSE completed_at END,
    updated_at = now()
  WHERE user_id = v_user_id AND day_number = p_day_number;

  IF v_all_complete AND p_day_number < 5 THEN
    UPDATE public.user_progress
    SET is_unlocked = true
    WHERE user_id = v_user_id AND day_number = p_day_number + 1;
  END IF;

  v_result := jsonb_build_object(
    'task_id', p_task_id,
    'day_number', p_day_number,
    'day_completed', v_all_complete,
    'next_day_unlocked', v_all_complete AND p_day_number < 5
  );

  RETURN v_result;
END;
$function$;