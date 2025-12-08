-- Gift Vouchers table
CREATE TABLE public.gift_vouchers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    operator_id UUID NOT NULL REFERENCES public.operators(id) ON DELETE CASCADE,
    flight_package_id UUID NOT NULL REFERENCES public.flight_packages(id) ON DELETE CASCADE,
    purchaser_user_id UUID NOT NULL,
    recipient_name TEXT NOT NULL,
    recipient_email TEXT,
    voucher_code TEXT NOT NULL UNIQUE,
    personal_message TEXT,
    purchase_price_huf INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'cancelled')),
    redeemed_at TIMESTAMP WITH TIME ZONE,
    redeemed_booking_id UUID REFERENCES public.bookings(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Waiting List table
CREATE TABLE public.waiting_list (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    time_slot_id UUID NOT NULL REFERENCES public.flight_time_slots(id) ON DELETE CASCADE,
    flight_package_id UUID NOT NULL REFERENCES public.flight_packages(id) ON DELETE CASCADE,
    passenger_count INTEGER NOT NULL DEFAULT 1,
    notified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, time_slot_id)
);

-- Booking Reminders table (for scheduled reminders)
CREATE TABLE public.booking_reminders (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    reminder_type TEXT NOT NULL CHECK (reminder_type IN ('24h_before', '1h_before', '1_week_before')),
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent BOOLEAN NOT NULL DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gift_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiting_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_reminders ENABLE ROW LEVEL SECURITY;

-- Gift Vouchers RLS policies
CREATE POLICY "Users can view their purchased vouchers"
ON public.gift_vouchers FOR SELECT
USING (auth.uid() = purchaser_user_id);

CREATE POLICY "Users can create vouchers"
ON public.gift_vouchers FOR INSERT
WITH CHECK (auth.uid() = purchaser_user_id);

CREATE POLICY "Operator admins can view their vouchers"
ON public.gift_vouchers FOR SELECT
USING (has_role(auth.uid(), 'operator_admin'::app_role) AND operator_id = get_user_operator_id(auth.uid()));

CREATE POLICY "Anyone can validate voucher codes"
ON public.gift_vouchers FOR SELECT
USING (status = 'active');

-- Waiting List RLS policies
CREATE POLICY "Users can view their waiting list entries"
ON public.waiting_list FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can join waiting list"
ON public.waiting_list FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave waiting list"
ON public.waiting_list FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Operator admins can view waiting list"
ON public.waiting_list FOR SELECT
USING (
    has_role(auth.uid(), 'operator_admin'::app_role) AND 
    EXISTS (
        SELECT 1 FROM public.flight_time_slots fts
        WHERE fts.id = waiting_list.time_slot_id
        AND fts.operator_id = get_user_operator_id(auth.uid())
    )
);

-- Booking Reminders RLS policies
CREATE POLICY "Users can view their booking reminders"
ON public.booking_reminders FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id = booking_reminders.booking_id
        AND b.user_id = auth.uid()
    )
);

CREATE POLICY "System can insert reminders"
ON public.booking_reminders FOR INSERT
WITH CHECK (true);

-- Trigger to create booking reminders automatically
CREATE OR REPLACE FUNCTION public.create_booking_reminders()
RETURNS TRIGGER AS $$
DECLARE
    slot_datetime TIMESTAMP WITH TIME ZONE;
BEGIN
    IF NEW.status = 'confirmed' AND (OLD IS NULL OR OLD.status != 'confirmed') THEN
        -- Get the slot datetime
        SELECT (fts.slot_date + fts.start_time)::timestamp with time zone
        INTO slot_datetime
        FROM public.flight_time_slots fts
        WHERE fts.id = NEW.time_slot_id;
        
        -- Create 24h reminder
        INSERT INTO public.booking_reminders (booking_id, reminder_type, scheduled_for)
        VALUES (NEW.id, '24h_before', slot_datetime - INTERVAL '24 hours')
        ON CONFLICT DO NOTHING;
        
        -- Create 1 week reminder if more than 1 week away
        IF slot_datetime > now() + INTERVAL '7 days' THEN
            INSERT INTO public.booking_reminders (booking_id, reminder_type, scheduled_for)
            VALUES (NEW.id, '1_week_before', slot_datetime - INTERVAL '7 days')
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_create_booking_reminders
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.create_booking_reminders();

-- Trigger to notify waiting list when slot becomes available
CREATE OR REPLACE FUNCTION public.notify_waiting_list()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'available' AND OLD.status = 'booked' AND NEW.current_passengers < NEW.max_passengers THEN
        -- Create notifications for waiting list users
        INSERT INTO public.notifications (user_id, title, message, type, related_booking_id)
        SELECT 
            wl.user_id,
            'Időpont felszabadult!',
            'Egy korábban foglalt időpont felszabadult. Foglaljon most!',
            'waiting_list_available',
            NULL
        FROM public.waiting_list wl
        WHERE wl.time_slot_id = NEW.id
        AND wl.notified = false;
        
        -- Mark as notified
        UPDATE public.waiting_list
        SET notified = true
        WHERE time_slot_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_waiting_list
AFTER UPDATE ON public.flight_time_slots
FOR EACH ROW
EXECUTE FUNCTION public.notify_waiting_list();

-- Updated at triggers
CREATE TRIGGER update_gift_vouchers_updated_at
BEFORE UPDATE ON public.gift_vouchers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Generate unique voucher code function
CREATE OR REPLACE FUNCTION public.generate_voucher_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := 'VGY-';
    i INTEGER;
BEGIN
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;