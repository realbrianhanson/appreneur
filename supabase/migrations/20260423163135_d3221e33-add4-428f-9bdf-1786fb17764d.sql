-- 1. Add notification_preferences column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS notification_preferences jsonb NOT NULL DEFAULT '{"email": true, "sms": true}'::jsonb;

-- 2. Deduplicate quiz_leads by email (keep the most recent)
DELETE FROM public.quiz_leads a
USING public.quiz_leads b
WHERE a.email = b.email
  AND a.created_at < b.created_at;

-- 3. Add UNIQUE constraint on quiz_leads.email
ALTER TABLE public.quiz_leads
ADD CONSTRAINT quiz_leads_email_unique UNIQUE (email);

-- 4. Deduplicate waitlist by email (keep the most recent)
DELETE FROM public.waitlist a
USING public.waitlist b
WHERE a.email = b.email
  AND a.created_at < b.created_at;

-- 5. Add UNIQUE constraint on waitlist.email
ALTER TABLE public.waitlist
ADD CONSTRAINT waitlist_email_unique UNIQUE (email);