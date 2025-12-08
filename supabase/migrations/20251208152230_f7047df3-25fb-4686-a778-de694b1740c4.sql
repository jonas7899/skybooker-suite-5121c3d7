-- Create profile status enum
CREATE TYPE public.profile_status AS ENUM ('bootstrap', 'pending', 'active', 'rejected', 'inactive', 'suspended');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    status profile_status NOT NULL DEFAULT 'pending',
    is_bootstrap BOOLEAN NOT NULL DEFAULT false,
    rejected_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'operator_admin'::app_role) OR
    has_role(auth.uid(), 'operator_staff'::app_role)
);

CREATE POLICY "Admins can update profiles"
ON public.profiles
FOR UPDATE
USING (
    has_role(auth.uid(), 'super_admin'::app_role) OR
    has_role(auth.uid(), 'operator_admin'::app_role) OR
    has_role(auth.uid(), 'operator_staff'::app_role)
);

CREATE POLICY "Anyone can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Add approval fields to user_roles
ALTER TABLE public.user_roles
ADD COLUMN approved_by UUID REFERENCES auth.users(id),
ADD COLUMN approved_at TIMESTAMPTZ,
ADD COLUMN rejected_at TIMESTAMPTZ,
ADD COLUMN rejection_reason TEXT;

-- Trigger to update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create notification on profile status change
CREATE OR REPLACE FUNCTION public.notify_profile_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF OLD.status = 'pending' AND NEW.status = 'active' THEN
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            NEW.id,
            'Fiók aktiválva',
            'A regisztrációd jóváhagyásra került. Üdvözlünk!',
            'account_activated'
        );
    ELSIF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            NEW.id,
            'Regisztráció elutasítva',
            'A regisztrációd elutasításra került. 24 óra múlva újra próbálkozhatsz.',
            'account_rejected'
        );
    ELSIF NEW.status = 'suspended' THEN
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (
            NEW.id,
            'Fiók felfüggesztve',
            'A fiókod felfüggesztésre került.',
            'account_suspended'
        );
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger for profile status notifications
CREATE TRIGGER on_profile_status_change
AFTER UPDATE OF status ON public.profiles
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.notify_profile_status_change();