-- Create enum for discount types
CREATE TYPE public.discount_type AS ENUM ('percentage', 'fixed_amount');

-- Create enum for discount condition types
CREATE TYPE public.discount_condition AS ENUM ('always', 'weekday', 'weekend', 'specific_days');

-- Coupons table
CREATE TABLE public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    flight_package_id UUID REFERENCES public.flight_packages(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    discount_type discount_type NOT NULL,
    discount_value INTEGER NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    times_used INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(operator_id, code)
);

-- Automatic discounts table
CREATE TABLE public.package_discounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_package_id UUID NOT NULL REFERENCES public.flight_packages(id) ON DELETE CASCADE,
    discount_type discount_type NOT NULL,
    discount_value INTEGER NOT NULL,
    condition_type discount_condition NOT NULL DEFAULT 'always',
    condition_days INTEGER[] DEFAULT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Campaigns table
CREATE TABLE public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flight_package_id UUID NOT NULL REFERENCES public.flight_packages(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    discount_type discount_type NOT NULL,
    discount_value INTEGER NOT NULL,
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Coupons policies
CREATE POLICY "Operator admins can manage their coupons"
ON public.coupons FOR ALL
USING (has_role(auth.uid(), 'operator_admin') AND operator_id = get_user_operator_id(auth.uid()));

CREATE POLICY "Anyone can view active coupons for validation"
ON public.coupons FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Package discounts policies
CREATE POLICY "Operator admins can manage package discounts"
ON public.package_discounts FOR ALL
USING (has_role(auth.uid(), 'operator_admin') AND EXISTS (
    SELECT 1 FROM public.flight_packages fp 
    WHERE fp.id = flight_package_id 
    AND fp.operator_id = get_user_operator_id(auth.uid())
));

CREATE POLICY "Anyone can view active discounts"
ON public.package_discounts FOR SELECT
USING (is_active = true);

-- Campaigns policies
CREATE POLICY "Operator admins can manage campaigns"
ON public.campaigns FOR ALL
USING (has_role(auth.uid(), 'operator_admin') AND EXISTS (
    SELECT 1 FROM public.flight_packages fp 
    WHERE fp.id = flight_package_id 
    AND fp.operator_id = get_user_operator_id(auth.uid())
));

CREATE POLICY "Anyone can view active campaigns"
ON public.campaigns FOR SELECT
USING (is_active = true AND starts_at <= now() AND ends_at >= now());

-- Triggers for updated_at
CREATE TRIGGER update_coupons_updated_at
BEFORE UPDATE ON public.coupons
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_package_discounts_updated_at
BEFORE UPDATE ON public.package_discounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();