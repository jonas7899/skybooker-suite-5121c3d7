import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SupportTier {
  id: string;
  name: string;
  min_amount_eur: number;
  max_amount_eur: number | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  operator_id: string;
}

export interface UserSupport {
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
  support_tier?: SupportTier;
}

export const useSupportTier = (operatorId?: string) => {
  const { user } = useAuth();
  const [supportTiers, setSupportTiers] = useState<SupportTier[]>([]);
  const [userSupport, setUserSupport] = useState<UserSupport | null>(null);
  const [currentTier, setCurrentTier] = useState<SupportTier | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSupportTiers = async () => {
    try {
      let query = supabase
        .from('support_tiers')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (operatorId) {
        query = query.eq('operator_id', operatorId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSupportTiers(data as SupportTier[]);
    } catch (error) {
      console.error('Error fetching support tiers:', error);
    }
  };

  const fetchUserSupport = async () => {
    if (!user) {
      setUserSupport(null);
      setCurrentTier(null);
      return;
    }

    try {
      // Get the latest unused support for this user
      let query = supabase
        .from('user_supports')
        .select('*, support_tier:support_tiers(*)')
        .eq('user_id', user.id)
        .eq('booking_used', false)
        .order('created_at', { ascending: false })
        .limit(1);

      if (operatorId) {
        query = query.eq('operator_id', operatorId);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data && data.length > 0) {
        const support = data[0] as unknown as UserSupport;
        setUserSupport(support);
        setCurrentTier(support.support_tier || null);
      } else {
        setUserSupport(null);
        setCurrentTier(null);
      }
    } catch (error) {
      console.error('Error fetching user support:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await Promise.all([fetchSupportTiers(), fetchUserSupport()]);
      setIsLoading(false);
    };

    fetchData();
  }, [user, operatorId]);

  const canBook = !!userSupport && !userSupport.booking_used;

  // Check if user can book a specific package based on tier requirements
  const canBookPackage = (minTierSortOrder?: number | null): boolean => {
    // If no support at all, can't book anything
    if (!canBook || !currentTier) return false;
    
    // If no minimum tier required, user can book
    if (minTierSortOrder === null || minTierSortOrder === undefined) return true;
    
    // User's tier must be >= the minimum required tier (higher sort_order = higher tier)
    return currentTier.sort_order >= minTierSortOrder;
  };

  return {
    supportTiers,
    userSupport,
    currentTier,
    isLoading,
    canBook,
    canBookPackage,
    refetch: async () => {
      await Promise.all([fetchSupportTiers(), fetchUserSupport()]);
    },
  };
};

export const useOperatorSupportTiers = (operatorId?: string) => {
  const [tiers, setTiers] = useState<SupportTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTiers = async () => {
    if (!operatorId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('support_tiers')
        .select('*')
        .eq('operator_id', operatorId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTiers(data as SupportTier[]);
    } catch (error) {
      console.error('Error fetching tiers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createTier = async (tier: Omit<SupportTier, 'id' | 'operator_id' | 'is_active'>) => {
    if (!operatorId) return;

    try {
      const { error } = await supabase
        .from('support_tiers')
        .insert({
          ...tier,
          operator_id: operatorId,
          is_active: true,
        });

      if (error) throw error;
      await fetchTiers();
      return { error: null };
    } catch (error) {
      console.error('Error creating tier:', error);
      return { error };
    }
  };

  const updateTier = async (tierId: string, updates: Partial<SupportTier>) => {
    try {
      const { error } = await supabase
        .from('support_tiers')
        .update(updates)
        .eq('id', tierId);

      if (error) throw error;
      await fetchTiers();
      return { error: null };
    } catch (error) {
      console.error('Error updating tier:', error);
      return { error };
    }
  };

  const deleteTier = async (tierId: string) => {
    try {
      const { error } = await supabase
        .from('support_tiers')
        .update({ is_active: false })
        .eq('id', tierId);

      if (error) throw error;
      await fetchTiers();
      return { error: null };
    } catch (error) {
      console.error('Error deleting tier:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchTiers();
  }, [operatorId]);

  return {
    tiers,
    isLoading,
    createTier,
    updateTier,
    deleteTier,
    refetch: fetchTiers,
  };
};
