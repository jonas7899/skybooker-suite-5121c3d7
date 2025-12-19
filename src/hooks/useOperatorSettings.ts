import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OperatorSettings {
  id: string;
  operator_id: string;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_account_number: string | null;
  support_description: string | null;
  created_at: string;
  updated_at: string;
}

export const useOperatorSettings = (operatorId?: string) => {
  const [settings, setSettings] = useState<OperatorSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    if (!operatorId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('operator_settings')
        .select('*')
        .eq('operator_id', operatorId)
        .maybeSingle();

      if (error) throw error;
      setSettings(data as OperatorSettings | null);
    } catch (error) {
      console.error('Error fetching operator settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<OperatorSettings>) => {
    if (!operatorId) return { error: new Error('No operator ID') };

    try {
      if (settings) {
        // Update existing
        const { error } = await supabase
          .from('operator_settings')
          .update(updates)
          .eq('operator_id', operatorId);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('operator_settings')
          .insert({
            operator_id: operatorId,
            ...updates,
          });

        if (error) throw error;
      }

      await fetchSettings();
      return { error: null };
    } catch (error) {
      console.error('Error updating settings:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [operatorId]);

  return {
    settings,
    isLoading,
    updateSettings,
    refetch: fetchSettings,
  };
};
