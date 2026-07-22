
-- Aggregates for admin overview
CREATE OR REPLACE FUNCTION public.admin_overview_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_today_start timestamptz := date_trunc('day', now());
  v_today_end timestamptz := v_today_start + interval '1 day';
  v_seven_days_ago timestamptz := now() - interval '7 days';
  v_registrations_today integer;
  v_total_users integer;
  v_active_last_7 integer;
  v_day5_completions integer;
  v_completion_rate numeric;
  v_email jsonb;
  v_webhook jsonb;
BEGIN
  IF v_caller IS NULL OR NOT public.is_admin(v_caller) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT COUNT(*) INTO v_registrations_today
  FROM public.profiles
  WHERE created_at >= v_today_start AND created_at < v_today_end;

  SELECT COUNT(*) INTO v_total_users FROM public.profiles;

  SELECT COUNT(DISTINCT user_id) INTO v_active_last_7
  FROM public.user_progress
  WHERE updated_at >= v_seven_days_ago;

  SELECT COUNT(*) INTO v_day5_completions
  FROM public.user_progress
  WHERE day_number = 5 AND is_completed = true;

  v_completion_rate := CASE
    WHEN v_total_users > 0 THEN ROUND((v_day5_completions::numeric / v_total_users) * 100, 1)
    ELSE 0
  END;

  SELECT jsonb_build_object(
    'sent', COUNT(*) FILTER (WHERE email_status = 'sent'),
    'failed', COUNT(*) FILTER (WHERE email_status = 'failed'),
    'not_configured', COUNT(*) FILTER (WHERE email_status = 'not_configured'),
    'pending', COUNT(*) FILTER (WHERE email_status = 'pending'),
    'total', COUNT(*)
  ) INTO v_email
  FROM public.registration_deliveries;

  SELECT jsonb_build_object(
    'sent', COUNT(*) FILTER (WHERE webhook_status = 'sent'),
    'failed', COUNT(*) FILTER (WHERE webhook_status = 'failed'),
    'pending', COUNT(*) FILTER (WHERE webhook_status = 'pending'),
    'total', COUNT(*)
  ) INTO v_webhook
  FROM public.registration_deliveries;

  RETURN jsonb_build_object(
    'registrations_today', v_registrations_today,
    'total_users', v_total_users,
    'active_last_7_days', v_active_last_7,
    'day5_completions', v_day5_completions,
    'completion_rate', v_completion_rate,
    'email_delivery', v_email,
    'webhook_delivery', v_webhook
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_overview_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_overview_stats() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_overview_stats() TO authenticated;
-- Note: is_admin() check inside the function is the real gate.

-- Paginated user list with server-side filters
CREATE OR REPLACE FUNCTION public.admin_list_users(
  p_search text DEFAULT NULL,
  p_progress_status text DEFAULT 'all',
  p_date_from timestamptz DEFAULT NULL,
  p_date_to timestamptz DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller uuid := auth.uid();
  v_limit integer := LEAST(GREATEST(COALESCE(p_limit, 50), 1), 100);
  v_offset integer := GREATEST(COALESCE(p_offset, 0), 0);
  v_search text := NULLIF(BTRIM(COALESCE(p_search, '')), '');
  v_search_pattern text;
  v_status text := COALESCE(p_progress_status, 'all');
  v_total integer;
  v_rows jsonb;
BEGIN
  IF v_caller IS NULL OR NOT public.is_admin(v_caller) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  IF v_status NOT IN ('all','not_started','in_progress','completed') THEN
    v_status := 'all';
  END IF;

  v_search_pattern := CASE
    WHEN v_search IS NULL THEN NULL
    ELSE '%' || replace(replace(replace(v_search, '\', '\\'), '%', '\%'), '_', '\_') || '%'
  END;

  WITH agg AS (
    SELECT user_id,
           COUNT(*) FILTER (WHERE is_completed) AS days_completed
    FROM public.user_progress
    GROUP BY user_id
  ),
  filtered AS (
    SELECT p.id, p.first_name, p.email, p.created_at,
           p.utm_source, p.utm_medium, p.utm_campaign,
           p.fb_campaign_id, p.fb_adset_id, p.fb_ad_id,
           COALESCE(a.days_completed, 0) AS days_completed
    FROM public.profiles p
    LEFT JOIN agg a ON a.user_id = p.id
    WHERE
      (v_search_pattern IS NULL
       OR p.first_name ILIKE v_search_pattern ESCAPE '\'
       OR p.email ILIKE v_search_pattern ESCAPE '\')
      AND (p_date_from IS NULL OR p.created_at >= p_date_from)
      AND (p_date_to IS NULL OR p.created_at < p_date_to)
      AND (
        v_status = 'all'
        OR (v_status = 'not_started' AND COALESCE(a.days_completed, 0) = 0)
        OR (v_status = 'in_progress' AND COALESCE(a.days_completed, 0) BETWEEN 1 AND 4)
        OR (v_status = 'completed' AND COALESCE(a.days_completed, 0) >= 5)
      )
  )
  SELECT COUNT(*)::int INTO v_total FROM filtered;

  WITH agg AS (
    SELECT user_id,
           COUNT(*) FILTER (WHERE is_completed) AS days_completed
    FROM public.user_progress
    GROUP BY user_id
  ),
  filtered AS (
    SELECT p.id, p.first_name, p.email, p.created_at,
           p.utm_source, p.utm_medium, p.utm_campaign,
           p.fb_campaign_id, p.fb_adset_id, p.fb_ad_id,
           COALESCE(a.days_completed, 0) AS days_completed
    FROM public.profiles p
    LEFT JOIN agg a ON a.user_id = p.id
    WHERE
      (v_search_pattern IS NULL
       OR p.first_name ILIKE v_search_pattern ESCAPE '\'
       OR p.email ILIKE v_search_pattern ESCAPE '\')
      AND (p_date_from IS NULL OR p.created_at >= p_date_from)
      AND (p_date_to IS NULL OR p.created_at < p_date_to)
      AND (
        v_status = 'all'
        OR (v_status = 'not_started' AND COALESCE(a.days_completed, 0) = 0)
        OR (v_status = 'in_progress' AND COALESCE(a.days_completed, 0) BETWEEN 1 AND 4)
        OR (v_status = 'completed' AND COALESCE(a.days_completed, 0) >= 5)
      )
    ORDER BY p.created_at DESC
    LIMIT v_limit OFFSET v_offset
  )
  SELECT COALESCE(jsonb_agg(row_to_json(filtered)), '[]'::jsonb) INTO v_rows
  FROM filtered;

  RETURN jsonb_build_object(
    'total', v_total,
    'limit', v_limit,
    'offset', v_offset,
    'rows', v_rows
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_users(text, text, timestamptz, timestamptz, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_list_users(text, text, timestamptz, timestamptz, integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_list_users(text, text, timestamptz, timestamptz, integer, integer) TO authenticated;
