import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Booking, BookingStatus, PassengerDetails } from '@/types/booking';
import { Json } from '@/integrations/supabase/types';

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mapBookingData = (data: any[]): Booking[] => {
    return data.map(item => ({
      ...item,
      passenger_details: item.passenger_details as PassengerDetails[] | undefined,
    }));
  };

  const fetchUserBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          flight_package:flight_packages(id, name, short_description, duration_minutes, base_price_huf, difficulty_level),
          time_slot:flight_time_slots(id, slot_date, start_time, duration_minutes)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setBookings(mapBookingData(data || []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchOperatorBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          flight_package:flight_packages(id, name, short_description, duration_minutes, base_price_huf, difficulty_level),
          time_slot:flight_time_slots(id, slot_date, start_time, duration_minutes, operator_id)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setBookings(mapBookingData(data || []));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching bookings');
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (booking: {
    flight_package_id: string;
    time_slot_id: string;
    passenger_count: number;
    passenger_details: PassengerDetails[];
    total_price_huf: number;
    notes?: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        ...booking,
        user_id: user.id,
        passenger_details: booking.passenger_details as unknown as Json,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const cancelBooking = async (bookingId: string) => {
    return updateBookingStatus(bookingId, 'cancelled');
  };

  return {
    bookings,
    loading,
    error,
    fetchUserBookings,
    fetchOperatorBookings,
    createBooking,
    updateBookingStatus,
    cancelBooking,
  };
};
