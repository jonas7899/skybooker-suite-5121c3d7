import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Coupon, PackageDiscount, Campaign, DiscountType, DiscountCondition } from '@/types/pricing';

export const usePricingAdmin = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [discounts, setDiscounts] = useState<PackageDiscount[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [packages, setPackages] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = async () => {
    const { data } = await supabase
      .from('flight_packages')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    
    if (data) setPackages(data);
  };

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('coupons')
        .select('*, flight_package:flight_packages(id, name)')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setCoupons((data || []) as unknown as Coupon[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching coupons');
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('package_discounts')
        .select('*, flight_package:flight_packages(id, name)')
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setDiscounts((data || []) as unknown as PackageDiscount[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching discounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('*, flight_package:flight_packages(id, name)')
        .order('starts_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      setCampaigns((data || []) as unknown as Campaign[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching campaigns');
    } finally {
      setLoading(false);
    }
  };

  const createCoupon = async (data: {
    code: string;
    discount_type: DiscountType;
    discount_value: number;
    flight_package_id?: string;
    expires_at?: string;
    usage_limit?: number;
  }) => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('operator_id')
      .eq('user_id', userData.user.id)
      .single();

    if (!roleData?.operator_id) throw new Error('No operator found');

    const { error } = await supabase
      .from('coupons')
      .insert([{
        ...data,
        code: data.code.toUpperCase(),
        operator_id: roleData.operator_id,
      }]);
    
    if (error) throw error;
    await fetchCoupons();
  };

  const updateCoupon = async (id: string, data: Partial<Coupon>) => {
    const { error } = await supabase
      .from('coupons')
      .update(data)
      .eq('id', id);
    
    if (error) throw error;
    await fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await fetchCoupons();
  };

  const createDiscount = async (data: {
    flight_package_id: string;
    discount_type: DiscountType;
    discount_value: number;
    condition_type: DiscountCondition;
    condition_days?: number[];
  }) => {
    const { error } = await supabase
      .from('package_discounts')
      .insert([data]);
    
    if (error) throw error;
    await fetchDiscounts();
  };

  const updateDiscount = async (id: string, data: Partial<PackageDiscount>) => {
    const { error } = await supabase
      .from('package_discounts')
      .update(data)
      .eq('id', id);
    
    if (error) throw error;
    await fetchDiscounts();
  };

  const deleteDiscount = async (id: string) => {
    const { error } = await supabase
      .from('package_discounts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await fetchDiscounts();
  };

  const createCampaign = async (data: {
    flight_package_id: string;
    name: string;
    discount_type: DiscountType;
    discount_value: number;
    starts_at: string;
    ends_at: string;
  }) => {
    const { error } = await supabase
      .from('campaigns')
      .insert([data]);
    
    if (error) throw error;
    await fetchCampaigns();
  };

  const updateCampaign = async (id: string, data: Partial<Campaign>) => {
    const { error } = await supabase
      .from('campaigns')
      .update(data)
      .eq('id', id);
    
    if (error) throw error;
    await fetchCampaigns();
  };

  const deleteCampaign = async (id: string) => {
    const { error } = await supabase
      .from('campaigns')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    await fetchCampaigns();
  };

  useEffect(() => {
    fetchPackages();
    fetchCoupons();
    fetchDiscounts();
    fetchCampaigns();
  }, []);

  return {
    coupons,
    discounts,
    campaigns,
    packages,
    loading,
    error,
    fetchCoupons,
    fetchDiscounts,
    fetchCampaigns,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    createCampaign,
    updateCampaign,
    deleteCampaign,
  };
};
