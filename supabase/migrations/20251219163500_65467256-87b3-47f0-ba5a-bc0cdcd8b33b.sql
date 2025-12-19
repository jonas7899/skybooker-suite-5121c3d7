
-- Create trigger to delete reminders when booking is cancelled
CREATE OR REPLACE FUNCTION public.handle_booking_cancellation()
RETURNS TRIGGER AS $$
BEGIN
  -- If booking status changed to 'cancelled', delete associated reminders
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    DELETE FROM public.booking_reminders WHERE booking_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger
DROP TRIGGER IF EXISTS on_booking_cancelled ON public.bookings;
CREATE TRIGGER on_booking_cancelled
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled')
  EXECUTE FUNCTION public.handle_booking_cancellation();
