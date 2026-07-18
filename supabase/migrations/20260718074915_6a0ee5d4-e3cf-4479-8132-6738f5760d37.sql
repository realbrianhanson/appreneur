
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_cohort_id uuid;
BEGIN
  -- Parse optional cohort_id
  BEGIN
    v_cohort_id := NULLIF(meta->>'cohort_id','')::uuid;
  EXCEPTION WHEN others THEN
    v_cohort_id := NULL;
  END;

  INSERT INTO public.profiles (
    id, email, first_name, phone, cohort_id, quiz_answers,
    utm_source, utm_medium, utm_campaign, utm_content,
    fb_ad_id, fb_adset_id, fb_campaign_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(meta->>'first_name', 'User'),
    NULLIF(meta->>'phone',''),
    v_cohort_id,
    CASE WHEN meta ? 'quiz_answers' THEN meta->'quiz_answers' ELSE NULL END,
    NULLIF(meta->>'utm_source',''),
    NULLIF(meta->>'utm_medium',''),
    NULLIF(meta->>'utm_campaign',''),
    NULLIF(meta->>'utm_content',''),
    NULLIF(meta->>'fb_ad_id',''),
    NULLIF(meta->>'fb_adset_id',''),
    NULLIF(meta->>'fb_campaign_id','')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;
