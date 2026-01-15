-- Create enum for app roles (admin system)
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'support');

-- Create enum for product types
CREATE TYPE public.product_type AS ENUM ('vip_bundle', 'prompt_vault', 'ship_it_kit', 'pro_monthly', 'pro_annual');

-- Create enum for SMS message types
CREATE TYPE public.sms_message_type AS ENUM ('cohort_reminder', 'day_unlock', 'missed_day', 'completion', 'custom');

-- Create enum for SMS status
CREATE TYPE public.sms_status AS ENUM ('queued', 'sent', 'delivered', 'failed');

-- PROFILES TABLE (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  is_vip BOOLEAN NOT NULL DEFAULT false,
  stripe_customer_id TEXT,
  cohort_id UUID REFERENCES public.cohorts(id),
  quiz_answers JSONB,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  fb_ad_id TEXT,
  fb_adset_id TEXT,
  fb_campaign_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- UPDATE COHORTS TABLE (add missing columns)
ALTER TABLE public.cohorts
  ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS is_accepting_registrations BOOLEAN NOT NULL DEFAULT true;

-- UPDATE WAITLIST TABLE (add missing columns)
ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS converted_user_id UUID;

-- Rename cohort_id to target_cohort_id in waitlist
ALTER TABLE public.waitlist RENAME COLUMN cohort_id TO target_cohort_id;

-- USER ROLES TABLE (for admin access - security best practice)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- USER PROGRESS TABLE
CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
  is_unlocked BOOLEAN NOT NULL DEFAULT false,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  tasks_completed JSONB NOT NULL DEFAULT '{}',
  time_spent_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, day_number)
);

-- PURCHASES TABLE
CREATE TABLE public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_type product_type NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- DOWNLOADS TABLE
CREATE TABLE public.downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resource_key TEXT NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- SMS LOGS TABLE
CREATE TABLE public.sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  message_type sms_message_type NOT NULL,
  message_body TEXT NOT NULL,
  status sms_status NOT NULL DEFAULT 'queued',
  provider_message_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- WEBHOOK ENDPOINTS TABLE
CREATE TABLE public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- WEBHOOK EVENTS TABLE
CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- WEBHOOK DELIVERIES TABLE
CREATE TABLE public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_event_id UUID NOT NULL REFERENCES public.webhook_events(id) ON DELETE CASCADE,
  webhook_endpoint_id UUID NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  response_status INTEGER,
  response_body TEXT,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- TESTIMONIALS TABLE
CREATE TABLE public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  cohort_id UUID REFERENCES public.cohorts(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FUNNEL EVENTS TABLE (analytics)
CREATE TABLE public.funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  page_url TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  fb_ad_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- FB AD SPEND TABLE
CREATE TABLE public.fb_ad_spend (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  campaign_id TEXT NOT NULL,
  campaign_name TEXT,
  adset_id TEXT,
  adset_name TEXT,
  ad_id TEXT,
  ad_name TEXT,
  spend_cents INTEGER NOT NULL DEFAULT 0,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (date, campaign_id, adset_id, ad_id)
);

-- SECURITY DEFINER FUNCTION TO CHECK ROLES (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- HELPER FUNCTION TO CHECK IF USER IS ANY ADMIN
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'admin')
  )
$$;

-- ENABLE RLS ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fb_ad_spend ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- USER ROLES POLICIES
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- USER PROGRESS POLICIES
CREATE POLICY "Users can view own progress" ON public.user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_progress
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress" ON public.user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all progress" ON public.user_progress
  FOR SELECT USING (public.is_admin(auth.uid()));

-- PURCHASES POLICIES
CREATE POLICY "Users can view own purchases" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" ON public.purchases
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage purchases" ON public.purchases
  FOR ALL USING (public.is_admin(auth.uid()));

-- DOWNLOADS POLICIES
CREATE POLICY "Users can view own downloads" ON public.downloads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own downloads" ON public.downloads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- SMS LOGS POLICIES (admin only)
CREATE POLICY "Admins can manage sms_logs" ON public.sms_logs
  FOR ALL USING (public.is_admin(auth.uid()));

-- WEBHOOK ENDPOINTS POLICIES (admin only)
CREATE POLICY "Admins can manage webhook_endpoints" ON public.webhook_endpoints
  FOR ALL USING (public.is_admin(auth.uid()));

-- WEBHOOK EVENTS POLICIES (admin only)
CREATE POLICY "Admins can manage webhook_events" ON public.webhook_events
  FOR ALL USING (public.is_admin(auth.uid()));

-- WEBHOOK DELIVERIES POLICIES (admin only)
CREATE POLICY "Admins can manage webhook_deliveries" ON public.webhook_deliveries
  FOR ALL USING (public.is_admin(auth.uid()));

-- TESTIMONIALS POLICIES
CREATE POLICY "Anyone can view approved testimonials" ON public.testimonials
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Users can submit testimonials" ON public.testimonials
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage testimonials" ON public.testimonials
  FOR ALL USING (public.is_admin(auth.uid()));

-- FUNNEL EVENTS POLICIES
CREATE POLICY "Anyone can insert funnel events" ON public.funnel_events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view funnel events" ON public.funnel_events
  FOR SELECT USING (public.is_admin(auth.uid()));

-- FB AD SPEND POLICIES (admin only)
CREATE POLICY "Admins can manage fb_ad_spend" ON public.fb_ad_spend
  FOR ALL USING (public.is_admin(auth.uid()));

-- TRIGGER FOR UPDATED_AT ON NEW TABLES
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhook_endpoints_updated_at
  BEFORE UPDATE ON public.webhook_endpoints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FUNCTION TO CREATE PROFILE ON USER SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User')
  );
  RETURN NEW;
END;
$$;

-- TRIGGER TO AUTO-CREATE PROFILE
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- FUNCTION TO INITIALIZE USER PROGRESS (Day 1 unlocked)
CREATE OR REPLACE FUNCTION public.initialize_user_progress(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_progress (user_id, day_number, is_unlocked)
  SELECT p_user_id, generate_series(1, 7), false
  ON CONFLICT (user_id, day_number) DO NOTHING;
  
  -- Unlock Day 1
  UPDATE public.user_progress
  SET is_unlocked = true
  WHERE user_id = p_user_id AND day_number = 1;
END;
$$;

-- FUNCTION TO COMPLETE A TASK AND CHECK DAY COMPLETION
CREATE OR REPLACE FUNCTION public.complete_task(
  p_user_id uuid,
  p_day_number integer,
  p_task_id text,
  p_required_tasks text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tasks_completed jsonb;
  v_all_complete boolean;
  v_result jsonb;
BEGIN
  -- Get current tasks_completed
  SELECT tasks_completed INTO v_tasks_completed
  FROM public.user_progress
  WHERE user_id = p_user_id AND day_number = p_day_number;
  
  -- Add the new task
  v_tasks_completed := COALESCE(v_tasks_completed, '{}'::jsonb) || jsonb_build_object(p_task_id, now());
  
  -- Check if all required tasks are complete
  v_all_complete := true;
  FOR i IN 1..array_length(p_required_tasks, 1) LOOP
    IF NOT (v_tasks_completed ? p_required_tasks[i]) THEN
      v_all_complete := false;
      EXIT;
    END IF;
  END LOOP;
  
  -- Update the progress record
  UPDATE public.user_progress
  SET 
    tasks_completed = v_tasks_completed,
    is_completed = v_all_complete,
    completed_at = CASE WHEN v_all_complete THEN now() ELSE completed_at END,
    updated_at = now()
  WHERE user_id = p_user_id AND day_number = p_day_number;
  
  -- If day is complete, unlock next day
  IF v_all_complete AND p_day_number < 7 THEN
    UPDATE public.user_progress
    SET is_unlocked = true
    WHERE user_id = p_user_id AND day_number = p_day_number + 1;
  END IF;
  
  v_result := jsonb_build_object(
    'task_id', p_task_id,
    'day_number', p_day_number,
    'day_completed', v_all_complete,
    'next_day_unlocked', v_all_complete AND p_day_number < 7
  );
  
  RETURN v_result;
END;
$$;

-- FUNCTION TO GET USER STATS (streak, percentile, etc.)
CREATE OR REPLACE FUNCTION public.get_user_stats(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  -- Get user's cohort
  SELECT cohort_id INTO v_cohort_id FROM public.profiles WHERE id = p_user_id;
  
  -- Calculate days completed
  SELECT COUNT(*) INTO v_days_completed
  FROM public.user_progress
  WHERE user_id = p_user_id AND is_completed = true;
  
  -- Calculate total time
  SELECT COALESCE(SUM(time_spent_seconds), 0) INTO v_total_time
  FROM public.user_progress
  WHERE user_id = p_user_id;
  
  -- Calculate streak (consecutive days from day 1)
  SELECT COUNT(*) INTO v_streak
  FROM (
    SELECT day_number, is_completed,
           day_number - ROW_NUMBER() OVER (ORDER BY day_number) as grp
    FROM public.user_progress
    WHERE user_id = p_user_id AND is_completed = true
    ORDER BY day_number
  ) sub
  WHERE grp = 0;
  
  -- Calculate percentile within cohort
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

-- ATOMIC SPOT RESERVATION FUNCTION
CREATE OR REPLACE FUNCTION public.reserve_cohort_spot(p_cohort_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_spots_taken integer;
  v_max_participants integer;
BEGIN
  -- Lock the row and get current values
  SELECT spots_taken, max_participants INTO v_spots_taken, v_max_participants
  FROM public.cohorts
  WHERE id = p_cohort_id
  FOR UPDATE;
  
  -- Check if spots available
  IF v_spots_taken >= v_max_participants THEN
    RETURN false;
  END IF;
  
  -- Increment spots
  UPDATE public.cohorts
  SET spots_taken = spots_taken + 1, updated_at = now()
  WHERE id = p_cohort_id;
  
  RETURN true;
END;
$$;

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_cohort_id ON public.profiles(cohort_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_day_number ON public.user_progress(day_number);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_payment_intent_id ON public.purchases(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON public.downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_user_id ON public.sms_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_status ON public.sms_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON public.webhook_deliveries(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_is_approved ON public.testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_funnel_events_session_id ON public.funnel_events(session_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_user_id ON public.funnel_events(user_id);
CREATE INDEX IF NOT EXISTS idx_funnel_events_event_type ON public.funnel_events(event_type);
CREATE INDEX IF NOT EXISTS idx_fb_ad_spend_date ON public.fb_ad_spend(date);
CREATE INDEX IF NOT EXISTS idx_fb_ad_spend_campaign_id ON public.fb_ad_spend(campaign_id);