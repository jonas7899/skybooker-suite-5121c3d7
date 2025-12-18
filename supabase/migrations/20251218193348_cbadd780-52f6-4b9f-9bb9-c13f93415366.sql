-- Támogatói fokozatok táblája
CREATE TABLE public.support_tiers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    min_amount_eur INTEGER NOT NULL,
    max_amount_eur INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0,
    color TEXT DEFAULT '#CD7F32',
    icon TEXT DEFAULT 'medal',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Operátor beállítások táblája (bankszámla, stb.)
CREATE TABLE public.operator_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    operator_id UUID NOT NULL UNIQUE REFERENCES public.operators(id) ON DELETE CASCADE,
    bank_account_number TEXT,
    bank_account_name TEXT,
    bank_name TEXT,
    support_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Felhasználói támogatások nyilvántartása
CREATE TABLE public.user_supports (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    support_tier_id UUID NOT NULL REFERENCES public.support_tiers(id) ON DELETE RESTRICT,
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    amount_eur INTEGER NOT NULL,
    payment_date DATE NOT NULL,
    booking_used BOOLEAN NOT NULL DEFAULT false,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    set_by UUID NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Flight packages összekötése a támogatói fokozatokkal
ALTER TABLE public.flight_packages 
ADD COLUMN min_support_tier_id UUID REFERENCES public.support_tiers(id) ON DELETE SET NULL;

-- RLS engedélyezés
ALTER TABLE public.support_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_supports ENABLE ROW LEVEL SECURITY;

-- Support tiers policies
CREATE POLICY "Anyone can view active support tiers" 
ON public.support_tiers 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Operator admins can manage support tiers" 
ON public.support_tiers 
FOR ALL 
USING (
    has_role(auth.uid(), 'operator_admin') 
    AND operator_id = get_user_operator_id(auth.uid())
);

-- Operator settings policies
CREATE POLICY "Anyone can view operator settings" 
ON public.operator_settings 
FOR SELECT 
USING (true);

CREATE POLICY "Operator admins can manage operator settings" 
ON public.operator_settings 
FOR ALL 
USING (
    has_role(auth.uid(), 'operator_admin') 
    AND operator_id = get_user_operator_id(auth.uid())
);

-- User supports policies
CREATE POLICY "Users can view their own supports" 
ON public.user_supports 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Operator admins and staff can view supports" 
ON public.user_supports 
FOR SELECT 
USING (
    (has_role(auth.uid(), 'operator_admin') OR has_role(auth.uid(), 'operator_staff'))
    AND operator_id = get_user_operator_id(auth.uid())
);

CREATE POLICY "Operator admins and staff can insert supports" 
ON public.user_supports 
FOR INSERT 
WITH CHECK (
    (has_role(auth.uid(), 'operator_admin') OR has_role(auth.uid(), 'operator_staff'))
    AND operator_id = get_user_operator_id(auth.uid())
);

CREATE POLICY "Operator admins can update supports" 
ON public.user_supports 
FOR UPDATE 
USING (
    has_role(auth.uid(), 'operator_admin')
    AND operator_id = get_user_operator_id(auth.uid())
);

-- Updated_at trigger a support_tiers táblára
CREATE TRIGGER update_support_tiers_updated_at
BEFORE UPDATE ON public.support_tiers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Updated_at trigger az operator_settings táblára
CREATE TRIGGER update_operator_settings_updated_at
BEFORE UPDATE ON public.operator_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Updated_at trigger a user_supports táblára
CREATE TRIGGER update_user_supports_updated_at
BEFORE UPDATE ON public.user_supports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Függvény: felhasználó aktuális aktív támogatói fokozatának lekérdezése
CREATE OR REPLACE FUNCTION public.get_user_active_support_tier(p_user_id UUID, p_operator_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT us.support_tier_id
    FROM public.user_supports us
    WHERE us.user_id = p_user_id
      AND us.operator_id = p_operator_id
      AND us.booking_used = false
    ORDER BY us.created_at DESC
    LIMIT 1
$$;

-- Függvény: ellenőrzi, hogy a felhasználó tud-e foglalni egy csomagot
CREATE OR REPLACE FUNCTION public.can_user_book_package(p_user_id UUID, p_package_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_package_tier_order INTEGER;
    v_user_tier_order INTEGER;
    v_operator_id UUID;
BEGIN
    -- Get package's minimum tier order
    SELECT st.sort_order, fp.operator_id
    INTO v_package_tier_order, v_operator_id
    FROM public.flight_packages fp
    LEFT JOIN public.support_tiers st ON fp.min_support_tier_id = st.id
    WHERE fp.id = p_package_id;
    
    -- If no minimum tier required, anyone with any active support can book
    IF v_package_tier_order IS NULL THEN
        v_package_tier_order := 0;
    END IF;
    
    -- Get user's current tier order
    SELECT st.sort_order
    INTO v_user_tier_order
    FROM public.user_supports us
    JOIN public.support_tiers st ON us.support_tier_id = st.id
    WHERE us.user_id = p_user_id
      AND us.operator_id = v_operator_id
      AND us.booking_used = false
    ORDER BY st.sort_order DESC
    LIMIT 1;
    
    -- If user has no active support, they can't book
    IF v_user_tier_order IS NULL THEN
        RETURN false;
    END IF;
    
    -- User can book if their tier is >= package's required tier
    RETURN v_user_tier_order >= v_package_tier_order;
END;
$$;