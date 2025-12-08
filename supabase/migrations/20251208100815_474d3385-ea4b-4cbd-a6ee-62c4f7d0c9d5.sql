-- Create booking status enum
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

-- Create bookings table
CREATE TABLE public.bookings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    flight_package_id UUID NOT NULL REFERENCES public.flight_packages(id) ON DELETE RESTRICT,
    time_slot_id UUID NOT NULL REFERENCES public.flight_time_slots(id) ON DELETE RESTRICT,
    passenger_count INTEGER NOT NULL DEFAULT 1,
    passenger_details JSONB,
    status public.booking_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    total_price_huf INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT valid_passenger_count CHECK (passenger_count > 0)
);

-- Enable RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings"
ON public.bookings
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own bookings
CREATE POLICY "Users can create their own bookings"
ON public.bookings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can cancel their own pending bookings
CREATE POLICY "Users can update their own bookings"
ON public.bookings
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Operator admins can view bookings for their time slots
CREATE POLICY "Operator admins can view bookings for their slots"
ON public.bookings
FOR SELECT
USING (
    has_role(auth.uid(), 'operator_admin') AND 
    EXISTS (
        SELECT 1 FROM public.flight_time_slots 
        WHERE id = time_slot_id 
        AND operator_id = get_user_operator_id(auth.uid())
    )
);

-- Operator admins can update booking status
CREATE POLICY "Operator admins can update bookings for their slots"
ON public.bookings
FOR UPDATE
USING (
    has_role(auth.uid(), 'operator_admin') AND 
    EXISTS (
        SELECT 1 FROM public.flight_time_slots 
        WHERE id = time_slot_id 
        AND operator_id = get_user_operator_id(auth.uid())
    )
);

-- Trigger for updated_at
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update time slot passengers when booking is confirmed
CREATE OR REPLACE FUNCTION public.update_slot_passengers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
        UPDATE public.flight_time_slots
        SET current_passengers = current_passengers + NEW.passenger_count
        WHERE id = NEW.time_slot_id;
        
        -- Mark slot as booked if full
        UPDATE public.flight_time_slots
        SET status = 'booked'
        WHERE id = NEW.time_slot_id 
        AND current_passengers >= max_passengers;
    ELSIF OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
        UPDATE public.flight_time_slots
        SET current_passengers = GREATEST(0, current_passengers - OLD.passenger_count),
            status = 'available'
        WHERE id = NEW.time_slot_id;
    END IF;
    RETURN NEW;
END;
$$;

-- Trigger to update slot passengers
CREATE TRIGGER on_booking_status_change
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_slot_passengers();