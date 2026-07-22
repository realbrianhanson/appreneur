
-- 1. Mark all cohorts as closed to registrations and inactive-looking.
UPDATE public.cohorts
SET is_accepting_registrations = false,
    updated_at = now();

-- 2. Unschedule the three SMS/cohort cron jobs if they exist.
DO $$
DECLARE
  j text;
BEGIN
  FOREACH j IN ARRAY ARRAY['sms-cohort-reminder','sms-daily-unlock','sms-missed-day']
  LOOP
    BEGIN
      PERFORM cron.unschedule(j);
    EXCEPTION WHEN OTHERS THEN
      -- Job may not exist; ignore.
      NULL;
    END;
  END LOOP;
END $$;

-- 3. Flip the default for future profiles to SMS-off. Existing rows keep their
-- explicit preference (no UPDATE against public.profiles here).
ALTER TABLE public.profiles
  ALTER COLUMN notification_preferences
  SET DEFAULT '{"email": true, "sms": false}'::jsonb;
