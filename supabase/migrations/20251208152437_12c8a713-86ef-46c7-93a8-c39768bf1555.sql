-- Fix search_path for notify_profile_status_change function
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