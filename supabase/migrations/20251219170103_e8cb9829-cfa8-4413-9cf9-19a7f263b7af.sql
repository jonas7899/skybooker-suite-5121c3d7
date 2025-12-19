
-- Extend the booking cancellation trigger to also reset user_supports.booking_used
CREATE OR REPLACE FUNCTION public.handle_booking_cancellation()
RETURNS TRIGGER AS $$
BEGIN
  -- If booking status changed to 'cancelled', handle cleanup
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    -- Delete associated reminders
    DELETE FROM public.booking_reminders WHERE booking_id = NEW.id;
    
    -- Reset the user_supports booking_used flag so user can book again
    UPDATE public.user_supports 
    SET booking_used = false, booking_id = NULL
    WHERE booking_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
