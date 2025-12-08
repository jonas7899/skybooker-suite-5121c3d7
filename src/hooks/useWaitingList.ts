import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WaitingListEntry } from '@/types/voucher';

export const useWaitingList = () => {
  const [entries, setEntries] = useState<WaitingListEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserWaitingList = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Nem vagy bejelentkezve');

      const { data, error: fetchError } = await supabase
        .from('waiting_list')
        .select(`
          *,
          time_slot:flight_time_slots(id, slot_date, start_time),
          flight_package:flight_packages(id, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setEntries(data as WaitingListEntry[] || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hiba a várólista betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const joinWaitingList = async (timeSlotId: string, flightPackageId: string, passengerCount: number = 1) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Nem vagy bejelentkezve');

    // Check if already on waiting list
    const { data: existing } = await supabase
      .from('waiting_list')
      .select('id')
      .eq('user_id', user.id)
      .eq('time_slot_id', timeSlotId)
      .single();

    if (existing) {
      throw new Error('Már feliratkoztál erre az időpontra');
    }

    const { data, error } = await supabase
      .from('waiting_list')
      .insert([{
        user_id: user.id,
        time_slot_id: timeSlotId,
        flight_package_id: flightPackageId,
        passenger_count: passengerCount,
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const leaveWaitingList = async (entryId: string) => {
    const { error } = await supabase
      .from('waiting_list')
      .delete()
      .eq('id', entryId);

    if (error) throw error;
  };

  const getWaitingPosition = async (timeSlotId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('waiting_list')
      .select('id, created_at')
      .eq('time_slot_id', timeSlotId)
      .order('created_at', { ascending: true });

    if (error || !data) return null;

    const position = data.findIndex(entry => {
      // Compare by checking user's entries
      return false; // We need user_id but RLS blocks us, so we use a workaround
    });

    // Get user's specific entry
    const { data: userEntry } = await supabase
      .from('waiting_list')
      .select('id, created_at')
      .eq('time_slot_id', timeSlotId)
      .eq('user_id', user.id)
      .single();

    if (!userEntry) return null;

    const userPosition = data.findIndex(e => e.id === userEntry.id);
    return userPosition >= 0 ? userPosition + 1 : null;
  };

  return {
    entries,
    loading,
    error,
    fetchUserWaitingList,
    joinWaitingList,
    leaveWaitingList,
    getWaitingPosition,
  };
};
