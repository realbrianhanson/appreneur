
-- 1. Per-channel columns on registration_deliveries
ALTER TABLE public.registration_deliveries
  ADD COLUMN IF NOT EXISTS email_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS webhook_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS email_claim_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS webhook_claim_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS email_last_error text,
  ADD COLUMN IF NOT EXISTS webhook_last_error text;

-- 2. Conservative backfill. Preserve sent timestamps and statuses; assume the
-- legacy shared "attempts" counter reflects effort spent on both channels
-- so far, but never on a channel that already succeeded.
UPDATE public.registration_deliveries
SET
  email_attempts = CASE
    WHEN email_status = 'sent' THEN 1
    WHEN email_status IN ('failed','pending') THEN GREATEST(attempts, 1)
    ELSE 0
  END,
  webhook_attempts = CASE
    WHEN webhook_status = 'sent' THEN 1
    WHEN webhook_status IN ('failed','pending') THEN GREATEST(attempts, 1)
    ELSE 0
  END,
  email_last_error = CASE WHEN email_status = 'failed' THEN last_error END,
  webhook_last_error = CASE WHEN webhook_status = 'failed' THEN last_error END
WHERE email_attempts = 0 AND webhook_attempts = 0;

-- 3. Kind-specific atomic claim. Each channel has its own lease and attempt
-- counter. A live lease/attempt cap on one channel never blocks the other.
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
  v_status text;
  v_attempts integer;
  v_claim_expires timestamptz;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'user_id required';
  END IF;
  IF _kind NOT IN ('email','webhook') THEN
    RAISE EXCEPTION 'invalid kind: %', _kind;
  END IF;

  INSERT INTO public.registration_deliveries (user_id)
  VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_row FROM public.registration_deliveries
    WHERE user_id = _user_id FOR UPDATE;

  IF _kind = 'email' THEN
    v_status := v_row.email_status;
    v_attempts := v_row.email_attempts;
    v_claim_expires := v_row.email_claim_expires_at;
  ELSE
    v_status := v_row.webhook_status;
    v_attempts := v_row.webhook_attempts;
    v_claim_expires := v_row.webhook_claim_expires_at;
  END IF;

  IF v_status = 'sent' THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'already_sent');
  END IF;

  IF v_attempts >= _max_attempts THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'attempts_exceeded');
  END IF;

  IF v_claim_expires IS NOT NULL AND v_claim_expires > v_now THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'in_progress');
  END IF;

  IF _kind = 'email' THEN
    UPDATE public.registration_deliveries
       SET email_claim_expires_at = v_claim_until,
           email_attempts = email_attempts + 1,
           updated_at = v_now
     WHERE user_id = _user_id;
  ELSE
    UPDATE public.registration_deliveries
       SET webhook_claim_expires_at = v_claim_until,
           webhook_attempts = webhook_attempts + 1,
           updated_at = v_now
     WHERE user_id = _user_id;
  END IF;

  RETURN jsonb_build_object(
    'claimed', true,
    'attempt', v_attempts + 1,
    'expires_at', v_claim_until,
    'kind', _kind
  );
END;
$$;

-- Keep the function service-role-only.
REVOKE ALL ON FUNCTION public.claim_registration_delivery(uuid, text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.claim_registration_delivery(uuid, text, integer) FROM anon;
REVOKE ALL ON FUNCTION public.claim_registration_delivery(uuid, text, integer) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.claim_registration_delivery(uuid, text, integer) TO service_role;

-- 4. Indexes for per-channel retry scans.
CREATE INDEX IF NOT EXISTS registration_deliveries_email_claim_idx
  ON public.registration_deliveries (email_claim_expires_at)
  WHERE email_claim_expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS registration_deliveries_webhook_claim_idx
  ON public.registration_deliveries (webhook_claim_expires_at)
  WHERE webhook_claim_expires_at IS NOT NULL;
