-- Create notifications table
CREATE TABLE public.notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    is_read BOOLEAN NOT NULL DEFAULT false,
    related_booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- System can insert notifications (via trigger)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Create function to generate booking notifications
CREATE OR REPLACE FUNCTION public.create_booking_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- New booking created
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
        VALUES (
            NEW.user_id,
            'Foglalás létrehozva',
            'A foglalásod sikeresen létrejött és jóváhagyásra vár.',
            'booking_created',
            NEW.id
        );
    -- Booking status changed
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        IF NEW.status = 'confirmed' THEN
            INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
            VALUES (
                NEW.user_id,
                'Foglalás megerősítve',
                'A foglalásod megerősítésre került. Várunk a repülésen!',
                'booking_confirmed',
                NEW.id
            );
        ELSIF NEW.status = 'cancelled' THEN
            INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
            VALUES (
                NEW.user_id,
                'Foglalás lemondva',
                'A foglalásod lemondásra került.',
                'booking_cancelled',
                NEW.id
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger for booking notifications
CREATE TRIGGER on_booking_notification
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.create_booking_notification();