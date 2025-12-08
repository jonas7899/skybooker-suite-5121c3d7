import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Operator, SubscriptionInfo, SubscriptionStatus } from '@/types/subscription';
import { toast } from 'sonner';

export const useSubscription = (operatorId?: string) => {
  const [operator, setOperator] = useState<Operator | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOperator = async () => {
    if (!operatorId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .eq('id', operatorId)
        .single();

      if (error) throw error;

      const op = data as Operator;
      setOperator(op);

      const expiresAt = op.subscription_expires_at ? new Date(op.subscription_expires_at) : undefined;
      const now = new Date();
      const daysRemaining = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : undefined;
      
      const isActive = (op.subscription_status === 'active' || op.subscription_status === 'trial') && 
        (!expiresAt || expiresAt > now);

      setSubscriptionInfo({
        status: op.subscription_status as SubscriptionStatus,
        plan: op.subscription_plan || 'monthly',
        priceHuf: op.subscription_price_huf || 9999,
        startedAt: op.subscription_started_at ? new Date(op.subscription_started_at) : undefined,
        expiresAt,
        daysRemaining: daysRemaining && daysRemaining > 0 ? daysRemaining : 0,
        isActive,
      });
    } catch (error) {
      console.error('Error fetching operator:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBillingInfo = async (billingEmail: string, billingName: string) => {
    if (!operatorId) return;

    try {
      const { error } = await supabase
        .from('operators')
        .update({ billing_email: billingEmail, billing_name: billingName })
        .eq('id', operatorId);

      if (error) throw error;

      toast.success('Számlázási adatok frissítve');
      await fetchOperator();
    } catch (error) {
      console.error('Error updating billing info:', error);
      toast.error('Hiba történt a mentés során');
    }
  };

  useEffect(() => {
    fetchOperator();
  }, [operatorId]);

  return {
    operator,
    subscriptionInfo,
    isLoading,
    updateBillingInfo,
    refetch: fetchOperator,
  };
};

export const useAdminOperators = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOperators = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOperators(data as Operator[]);
    } catch (error) {
      console.error('Error fetching operators:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOperatorStatus = async (operatorId: string, status: SubscriptionStatus) => {
    try {
      const updates: Record<string, unknown> = { subscription_status: status };
      
      if (status === 'active') {
        const now = new Date();
        const expiresAt = new Date(now);
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        updates.subscription_started_at = now.toISOString();
        updates.subscription_expires_at = expiresAt.toISOString();
      }

      const { error } = await supabase
        .from('operators')
        .update(updates)
        .eq('id', operatorId);

      if (error) throw error;

      toast.success('Előfizetés státusza frissítve');
      await fetchOperators();
    } catch (error) {
      console.error('Error updating operator status:', error);
      toast.error('Hiba történt a frissítés során');
    }
  };

  const extendSubscription = async (operatorId: string, months: number = 1) => {
    try {
      const operator = operators.find(op => op.id === operatorId);
      if (!operator) return;

      const currentExpiry = operator.subscription_expires_at 
        ? new Date(operator.subscription_expires_at) 
        : new Date();
      
      const newExpiry = new Date(currentExpiry);
      newExpiry.setMonth(newExpiry.getMonth() + months);

      const { error } = await supabase
        .from('operators')
        .update({ 
          subscription_expires_at: newExpiry.toISOString(),
          subscription_status: 'active'
        })
        .eq('id', operatorId);

      if (error) throw error;

      toast.success(`Előfizetés meghosszabbítva ${months} hónappal`);
      await fetchOperators();
    } catch (error) {
      console.error('Error extending subscription:', error);
      toast.error('Hiba történt a meghosszabbítás során');
    }
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  return {
    operators,
    isLoading,
    updateOperatorStatus,
    extendSubscription,
    refetch: fetchOperators,
  };
};
