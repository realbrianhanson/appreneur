-- The funnel_events INSERT policy with (true) is intentional for anonymous tracking
-- The quiz_leads and waitlist INSERT policies are also intentional for public forms
-- These are acceptable patterns for public-facing forms where we want anyone to submit data
-- No changes needed - these are expected security patterns for lead capture forms

-- However, let's add rate limiting metadata for these public tables
COMMENT ON POLICY "Anyone can insert funnel events" ON public.funnel_events IS 'Intentionally permissive for anonymous analytics tracking';
COMMENT ON POLICY "Anyone can submit quiz leads" ON public.quiz_leads IS 'Intentionally permissive for public lead capture form';
COMMENT ON POLICY "Anyone can join waitlist" ON public.waitlist IS 'Intentionally permissive for public waitlist signup';