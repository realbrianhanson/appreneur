
-- 1. registration_deliveries table
CREATE TABLE IF NOT EXISTS public.registration_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  progress_initialized_at timestamptz,
  email_status text NOT NULL DEFAULT 'pending'
    CHECK (email_status IN ('pending','sent','failed','not_configured','skipped')),
  email_sent_at timestamptz,
  webhook_status text NOT NULL DEFAULT 'pending'
    CHECK (webhook_status IN ('pending','sent','failed','skipped')),
  webhook_sent_at timestamptz,
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  claim_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Grants: authenticated may read their own row via RLS; admins read all; service_role writes.
GRANT SELECT ON public.registration_deliveries TO authenticated;
GRANT ALL ON public.registration_deliveries TO service_role;

ALTER TABLE public.registration_deliveries ENABLE ROW LEVEL SECURITY;

-- Signed-in users can see only their own delivery row.
CREATE POLICY "Users view own registration delivery"
  ON public.registration_deliveries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can see every delivery row.
CREATE POLICY "Admins view all registration deliveries"
  ON public.registration_deliveries
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- No INSERT/UPDATE/DELETE policies for authenticated: writes happen only via
-- service_role (which bypasses RLS).

-- Indexes to support retry scans by status/timestamps.
CREATE INDEX IF NOT EXISTS registration_deliveries_email_status_idx
  ON public.registration_deliveries (email_status)
  WHERE email_status IN ('pending','failed');
CREATE INDEX IF NOT EXISTS registration_deliveries_webhook_status_idx
  ON public.registration_deliveries (webhook_status)
  WHERE webhook_status IN ('pending','failed');
CREATE INDEX IF NOT EXISTS registration_deliveries_claim_expires_idx
  ON public.registration_deliveries (claim_expires_at)
  WHERE claim_expires_at IS NOT NULL;

CREATE TRIGGER update_registration_deliveries_updated_at
  BEFORE UPDATE ON public.registration_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Race-safe claim helper. service_role only. Returns whether the caller
-- successfully claimed processing for the given delivery kind ("email" or
-- "webhook"). It:
--   - upserts a row (creating the delivery record if missing),
--   - refuses if the kind already succeeded,
--   - refuses if attempts is at/above the cap,
--   - refuses if a live claim is still held (claim_expires_at > now),
--   - otherwise sets a 5-minute claim window, bumps attempts, returns true.
CREATE OR REPLACE FUNCTION public.claim_registration_delivery(
  _user_id uuid,
  _kind text,
  _max_attempts integer DEFAULT 5
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.registration_deliveries%ROWTYPE;
  v_now timestamptz := now();
  v_claim_until timestamptz := v_now + interval '5 minutes';
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'user_id required';
  END IF;
  IF _kind NOT IN ('email','webhook') THEN
    RAISE EXCEPTION 'invalid kind: %', _kind;
  END IF;

  -- Ensure a row exists (idempotent).
  INSERT INTO public.registration_deliveries (user_id)
  VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_row FROM public.registration_deliveries
    WHERE user_id = _user_id FOR UPDATE;

  IF _kind = 'email' AND v_row.email_status = 'sent' THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'already_sent');
  END IF;
  IF _kind = 'webhook' AND v_row.webhook_status = 'sent' THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'already_sent');
  END IF;

  IF v_row.attempts >= _max_attempts THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'attempts_exceeded');
  END IF;

  IF v_row.claim_expires_at IS NOT NULL AND v_row.claim_expires_at > v_now THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'in_progress');
  END IF;

  UPDATE public.registration_deliveries
     SET claim_expires_at = v_claim_until,
         attempts = attempts + 1,
         updated_at = v_now
   WHERE user_id = _user_id;

  RETURN jsonb_build_object(
    'claimed', true,
    'attempt', v_row.attempts + 1,
    'expires_at', v_claim_until
  );
END;
$$;

-- Lock down: service_role only.
REVOKE ALL ON FUNCTION public.claim_registration_delivery(uuid, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_registration_delivery(uuid, text, integer) FROM anon;
REVOKE ALL ON FUNCTION public.claim_registration_delivery(uuid, text, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_registration_delivery(uuid, text, integer) TO service_role;

-- 3. Progress init helper for a specific user, invoked by finalize-registration
-- with a service-role client. Already exists; ensure grants are service-only.
REVOKE ALL ON FUNCTION public.initialize_user_progress_for(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.initialize_user_progress_for(uuid) FROM anon;
REVOKE ALL ON FUNCTION public.initialize_user_progress_for(uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.initialize_user_progress_for(uuid) TO service_role;

-- 4. Corrective: mark every legacy cohort inactive and not accepting registrations.
-- Idempotent; safe to re-run. Prod may already reflect this; the migration makes
-- it reproducible from schema history alone.
UPDATE public.cohorts
   SET is_active = false,
       is_accepting_registrations = false,
       updated_at = now()
 WHERE is_active = true OR is_accepting_registrations = true;
