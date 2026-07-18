CREATE OR REPLACE FUNCTION public.get_revenue_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_revenue bigint;
  v_this_month bigint;
  v_last_month bigint;
  v_total_orders integer;
  v_avg bigint;
  v_by_product jsonb;
  v_daily jsonb;
  v_now timestamptz := now();
  v_this_month_start timestamptz := date_trunc('month', v_now);
  v_last_month_start timestamptz := date_trunc('month', v_now - interval '1 month');
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;

  SELECT COALESCE(SUM(amount_cents), 0), COUNT(*)
    INTO v_total_revenue, v_total_orders
  FROM public.purchases
  WHERE status = 'completed';

  SELECT COALESCE(SUM(amount_cents), 0) INTO v_this_month
  FROM public.purchases
  WHERE status = 'completed' AND created_at >= v_this_month_start;

  SELECT COALESCE(SUM(amount_cents), 0) INTO v_last_month
  FROM public.purchases
  WHERE status = 'completed'
    AND created_at >= v_last_month_start
    AND created_at < v_this_month_start;

  v_avg := CASE WHEN v_total_orders > 0 THEN v_total_revenue / v_total_orders ELSE 0 END;

  SELECT COALESCE(jsonb_object_agg(product_type, total), '{}'::jsonb) INTO v_by_product
  FROM (
    SELECT product_type, SUM(amount_cents) AS total
    FROM public.purchases
    WHERE status = 'completed'
    GROUP BY product_type
  ) t;

  SELECT COALESCE(jsonb_agg(row_to_json(d) ORDER BY d.day), '[]'::jsonb) INTO v_daily
  FROM (
    SELECT
      to_char(gs::date, 'YYYY-MM-DD') AS day,
      COALESCE(SUM(p.amount_cents), 0) AS revenue_cents,
      COUNT(p.id) AS orders
    FROM generate_series((v_now - interval '29 days')::date, v_now::date, interval '1 day') gs
    LEFT JOIN public.purchases p
      ON p.status = 'completed'
      AND p.created_at >= gs::date
      AND p.created_at < (gs::date + interval '1 day')
    GROUP BY gs
  ) d;

  RETURN jsonb_build_object(
    'total_revenue', v_total_revenue,
    'this_month', v_this_month,
    'last_month', v_last_month,
    'total_orders', v_total_orders,
    'average_order_value', v_avg,
    'revenue_by_product', v_by_product,
    'daily', v_daily
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_revenue_stats() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_revenue_stats() TO authenticated;