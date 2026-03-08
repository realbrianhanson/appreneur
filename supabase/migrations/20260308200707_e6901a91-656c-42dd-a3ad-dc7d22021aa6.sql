-- Delete existing day 6 and 7 progress records
DELETE FROM public.user_progress WHERE day_number > 5;

-- Now add the constraint
ALTER TABLE public.user_progress DROP CONSTRAINT IF EXISTS user_progress_day_number_check;
ALTER TABLE public.user_progress ADD CONSTRAINT user_progress_day_number_check CHECK (day_number >= 1 AND day_number <= 5);

-- Update initialize_user_progress function to create 5 days instead of 7
CREATE OR REPLACE FUNCTION public.initialize_user_progress(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_progress (user_id, day_number, is_unlocked)
  SELECT p_user_id, generate_series(1, 5), false
  ON CONFLICT (user_id, day_number) DO NOTHING;
  
  UPDATE public.user_progress
  SET is_unlocked = true
  WHERE user_id = p_user_id AND day_number = 1;
END;
$$;

-- Update complete_task to cap at day 5
CREATE OR REPLACE FUNCTION public.complete_task(p_user_id uuid, p_day_number integer, p_task_id text, p_required_tasks text[])
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_tasks_completed jsonb;
  v_all_complete boolean;
  v_result jsonb;
BEGIN
  SELECT tasks_completed INTO v_tasks_completed
  FROM public.user_progress
  WHERE user_id = p_user_id AND day_number = p_day_number;
  
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
  WHERE user_id = p_user_id AND day_number = p_day_number;
  
  IF v_all_complete AND p_day_number < 5 THEN
    UPDATE public.user_progress
    SET is_unlocked = true
    WHERE user_id = p_user_id AND day_number = p_day_number + 1;
  END IF;
  
  v_result := jsonb_build_object(
    'task_id', p_task_id,
    'day_number', p_day_number,
    'day_completed', v_all_complete,
    'next_day_unlocked', v_all_complete AND p_day_number < 5
  );
  
  RETURN v_result;
END;
$$;

-- Update get_user_stats
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  v_streak integer := 0;
  v_days_completed integer;
  v_total_time integer;
  v_cohort_id uuid;
  v_cohort_size integer;
  v_rank integer;
  v_percentile numeric;
BEGIN
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
    SELECT COUNT(*) INTO v_cohort_size
    FROM public.profiles WHERE cohort_id = v_cohort_id;
    
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