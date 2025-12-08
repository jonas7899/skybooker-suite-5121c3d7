import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TimeSlot, TimeSlotStatus } from '@/types/scheduling';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addHours, isBefore } from 'date-fns';

export const useTimeSlots = (operatorId?: string) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeSlots = async (startDate: Date, endDate: Date) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('flight_time_slots')
        .select(`
          *,
          flight_package:flight_packages(*)
        `)
        .gte('slot_date', format(startDate, 'yyyy-MM-dd'))
        .lte('slot_date', format(endDate, 'yyyy-MM-dd'))
        .order('slot_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (operatorId) {
        query = query.eq('operator_id', operatorId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setTimeSlots(data as TimeSlot[] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba történt');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeekSlots = async (date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    await fetchTimeSlots(start, end);
  };

  const fetchMonthSlots = async (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    await fetchTimeSlots(start, end);
  };

  const createTimeSlot = async (slot: {
    operator_id: string;
    flight_package_id?: string;
    slot_date: string;
    start_time: string;
    duration_minutes: number;
    max_passengers: number;
  }) => {
    const { data, error } = await supabase
      .from('flight_time_slots')
      .insert([slot])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateTimeSlotStatus = async (slotId: string, status: TimeSlotStatus) => {
    const { data, error } = await supabase
      .from('flight_time_slots')
      .update({ status })
      .eq('id', slotId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteTimeSlot = async (slotId: string) => {
    const { error } = await supabase
      .from('flight_time_slots')
      .delete()
      .eq('id', slotId);

    if (error) throw error;
  };

  const canBook = (slot: TimeSlot): boolean => {
    if (slot.status !== 'available') return false;
    if (slot.current_passengers >= slot.max_passengers) return false;
    
    // Block booking less than 24 hours before flight
    const slotDateTime = new Date(`${slot.slot_date}T${slot.start_time}`);
    const minBookingTime = addHours(new Date(), 24);
    
    return isBefore(minBookingTime, slotDateTime);
  };

  return {
    timeSlots,
    loading,
    error,
    fetchTimeSlots,
    fetchWeekSlots,
    fetchMonthSlots,
    createTimeSlot,
    updateTimeSlotStatus,
    deleteTimeSlot,
    canBook,
  };
};
