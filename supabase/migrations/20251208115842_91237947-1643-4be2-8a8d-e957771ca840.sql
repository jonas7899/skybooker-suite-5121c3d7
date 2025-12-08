-- Add subscription fields to operators table
ALTER TABLE public.operators 
ADD COLUMN IF NOT EXISTS subscription_plan text DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS subscription_price_huf integer DEFAULT 9999,
ADD COLUMN IF NOT EXISTS subscription_started_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS subscription_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS billing_email text,
ADD COLUMN IF NOT EXISTS billing_name text;

-- Update flight_packages to check operator subscription
CREATE OR REPLACE FUNCTION public.is_operator_subscription_active(_operator_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.operators
    WHERE id = _operator_id
      AND subscription_status IN ('active', 'trial')
      AND (subscription_expires_at IS NULL OR subscription_expires_at > now())
  )
$$;

-- Drop existing policy and create new one that checks subscription
DROP POLICY IF EXISTS "Anyone can view active flight packages" ON public.flight_packages;

CREATE POLICY "Anyone can view active flight packages with valid subscription" 
ON public.flight_packages 
FOR SELECT
USING (
  is_active = true 
  AND is_operator_subscription_active(operator_id)
);

-- Update time slots policy to check subscription
DROP POLICY IF EXISTS "Anyone can view available time slots" ON public.flight_time_slots;

CREATE POLICY "Anyone can view available time slots with valid subscription" 
ON public.flight_time_slots 
FOR SELECT
USING (
  status = 'available'::time_slot_status
  AND is_operator_subscription_active(operator_id)
);