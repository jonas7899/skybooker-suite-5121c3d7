-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'operator_admin', 'operator_staff', 'user');

-- Create user_roles table for RBAC
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    operator_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
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

-- Create function to get user's operator_id
CREATE OR REPLACE FUNCTION public.get_user_operator_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT operator_id
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Create operators table
CREATE TABLE public.operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    subscription_status TEXT NOT NULL DEFAULT 'trial' CHECK (subscription_status IN ('active', 'trial', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;

-- Create flight_packages table
CREATE TABLE public.flight_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID REFERENCES public.operators(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    short_description TEXT,
    detailed_description TEXT,
    route_description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    difficulty_level TEXT NOT NULL DEFAULT 'easy' CHECK (difficulty_level IN ('easy', 'medium', 'aerobatic')),
    recommended_audience TEXT,
    base_price_huf INTEGER NOT NULL,
    max_passengers INTEGER NOT NULL DEFAULT 1,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.flight_packages ENABLE ROW LEVEL SECURITY;

-- Create time_slot_status enum
CREATE TYPE public.time_slot_status AS ENUM ('available', 'booked', 'closed');

-- Create flight_time_slots table
CREATE TABLE public.flight_time_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID REFERENCES public.operators(id) ON DELETE CASCADE NOT NULL,
    flight_package_id UUID REFERENCES public.flight_packages(id) ON DELETE CASCADE,
    slot_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    max_passengers INTEGER NOT NULL DEFAULT 1,
    current_passengers INTEGER NOT NULL DEFAULT 0,
    status time_slot_status NOT NULL DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT valid_passengers CHECK (current_passengers <= max_passengers)
);

ALTER TABLE public.flight_time_slots ENABLE ROW LEVEL SECURITY;

-- Create index for faster queries
CREATE INDEX idx_time_slots_date ON public.flight_time_slots(slot_date);
CREATE INDEX idx_time_slots_operator ON public.flight_time_slots(operator_id);
CREATE INDEX idx_time_slots_status ON public.flight_time_slots(status);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policies for operators
CREATE POLICY "Anyone can view active operators"
ON public.operators FOR SELECT
USING (subscription_status IN ('active', 'trial'));

CREATE POLICY "Super admins can manage operators"
ON public.operators FOR ALL
USING (public.has_role(auth.uid(), 'super_admin'));

-- RLS Policies for flight_packages
CREATE POLICY "Anyone can view active flight packages"
ON public.flight_packages FOR SELECT
USING (is_active = true);

CREATE POLICY "Operator admins can manage their packages"
ON public.flight_packages FOR ALL
USING (
    public.has_role(auth.uid(), 'operator_admin') 
    AND operator_id = public.get_user_operator_id(auth.uid())
);

-- RLS Policies for flight_time_slots
CREATE POLICY "Anyone can view available time slots"
ON public.flight_time_slots FOR SELECT
USING (status = 'available');

CREATE POLICY "Operator admins can view all their time slots"
ON public.flight_time_slots FOR SELECT
USING (
    (public.has_role(auth.uid(), 'operator_admin') OR public.has_role(auth.uid(), 'operator_staff'))
    AND operator_id = public.get_user_operator_id(auth.uid())
);

CREATE POLICY "Operator admins can create time slots"
ON public.flight_time_slots FOR INSERT
WITH CHECK (
    public.has_role(auth.uid(), 'operator_admin')
    AND operator_id = public.get_user_operator_id(auth.uid())
);

CREATE POLICY "Operator admins can update their time slots"
ON public.flight_time_slots FOR UPDATE
USING (
    public.has_role(auth.uid(), 'operator_admin')
    AND operator_id = public.get_user_operator_id(auth.uid())
);

CREATE POLICY "Operator admins can delete their time slots"
ON public.flight_time_slots FOR DELETE
USING (
    public.has_role(auth.uid(), 'operator_admin')
    AND operator_id = public.get_user_operator_id(auth.uid())
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_flight_packages_updated_at
    BEFORE UPDATE ON public.flight_packages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flight_time_slots_updated_at
    BEFORE UPDATE ON public.flight_time_slots
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();