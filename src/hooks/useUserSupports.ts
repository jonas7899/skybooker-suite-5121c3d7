import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SupportTier } from './useSupportTier';

export interface UserWithProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  status: string;
  created_at: string;
}

export interface UserSupportEntry {
  id: string;
  user_id: string;
  support_tier_id: string;
  operator_id: string;
  amount_eur: number;
  payment_date: string;
  booking_used: boolean;
  booking_id: string | null;
  notes: string | null;
  set_by: string;
  created_at: string;
  updated_at: string;
  support_tier?: SupportTier;
  user_profile?: {
    full_name: string;
    phone: string | null;
  };
}

export const useUserSupports = (operatorId?: string) => {
  const { user } = useAuth();
  const [supports, setSupports] = useState<UserSupportEntry[]>([]);
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    if (!operatorId) return;

    try {
      // Fetch all active users with their profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone, status, created_at')
        .eq('status', 'active')
        .order('full_name', { ascending: true });

      if (error) throw error;

      // Get user emails from auth
      const usersWithEmail = profiles?.map(profile => ({
        ...profile,
        email: '', // We don't have direct access to auth.users email
      })) || [];

      setUsers(usersWithEmail as UserWithProfile[]);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchSupports = async () => {
    if (!operatorId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_supports')
        .select(`
          *,
          support_tier:support_tiers(*)
        `)
        .eq('operator_id', operatorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles for each support
      const supportsWithProfiles = await Promise.all(
        (data || []).map(async (support) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone')
            .eq('id', support.user_id)
            .single();

          return {
            ...support,
            user_profile: profile,
          } as UserSupportEntry;
        })
      );

      setSupports(supportsWithProfiles);
    } catch (error) {
      console.error('Error fetching supports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createSupport = async (supportData: {
    user_id: string;
    support_tier_id: string;
    amount_eur: number;
    payment_date: string;
    notes?: string;
  }) => {
    if (!operatorId || !user) return { error: new Error('Missing operator or user') };

    try {
      const { data, error } = await supabase
        .from('user_supports')
        .insert({
          ...supportData,
          operator_id: operatorId,
          set_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Get tier name for notification
      const { data: tier } = await supabase
        .from('support_tiers')
        .select('name')
        .eq('id', supportData.support_tier_id)
        .single();

      // Create notification for the user
      await supabase.from('notifications').insert({
        user_id: supportData.user_id,
        title: 'Támogatói státusz jóváhagyva',
        message: `Köszönjük támogatásod! A "${tier?.name || 'támogatói'}" fokozatod aktiválva lett. Most már foglalhatsz időpontot.`,
        type: 'support_approved',
      });

      await fetchSupports();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating support:', error);
      return { error };
    }
  };

  const updateSupport = async (supportId: string, updates: Partial<UserSupportEntry>) => {
    try {
      const { error } = await supabase
        .from('user_supports')
        .update(updates)
        .eq('id', supportId);

      if (error) throw error;
      await fetchSupports();
      return { error: null };
    } catch (error) {
      console.error('Error updating support:', error);
      return { error };
    }
  };

  const markAsUsed = async (supportId: string, bookingId: string) => {
    try {
      const { error } = await supabase
        .from('user_supports')
        .update({
          booking_used: true,
          booking_id: bookingId,
        })
        .eq('id', supportId);

      if (error) throw error;
      await fetchSupports();
      return { error: null };
    } catch (error) {
      console.error('Error marking support as used:', error);
      return { error };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchUsers(), fetchSupports()]);
      setIsLoading(false);
    };

    fetchData();
  }, [operatorId]);

  return {
    supports,
    users,
    isLoading,
    createSupport,
    updateSupport,
    markAsUsed,
    refetch: async () => {
      await Promise.all([fetchUsers(), fetchSupports()]);
    },
  };
};
