import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Coupon, PackageDiscount, Campaign, PriceBreakdown, DiscountType, DiscountCondition } from '@/types/pricing';

export const usePricing = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateDiscount = (basePrice: number, discountType: DiscountType, discountValue: number): number => {
    if (discountType === 'percentage') {
      return Math.round(basePrice * (discountValue / 100));
    }
    return Math.min(discountValue, basePrice);
  };

  const isConditionMet = (condition: DiscountCondition, conditionDays: number[] | null, slotDate: Date): boolean => {
    const dayOfWeek = slotDate.getDay();
    
    switch (condition) {
      case 'always':
        return true;
      case 'weekday':
        return dayOfWeek >= 1 && dayOfWeek <= 5;
      case 'weekend':
        return dayOfWeek === 0 || dayOfWeek === 6;
      case 'specific_days':
        return conditionDays?.includes(dayOfWeek) || false;
      default:
        return false;
    }
  };

  const fetchActiveDiscounts = async (packageId: string): Promise<PackageDiscount[]> => {
    const { data, error } = await supabase
      .from('package_discounts')
      .select('*')
      .eq('flight_package_id', packageId)
      .eq('is_active', true);
    
    if (error) throw error;
    return (data || []) as unknown as PackageDiscount[];
  };

  const fetchActiveCampaigns = async (packageId: string): Promise<Campaign[]> => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('flight_package_id', packageId)
      .eq('is_active', true)
      .lte('starts_at', now)
      .gte('ends_at', now);
    
    if (error) throw error;
    return (data || []) as unknown as Campaign[];
  };

  const validateCoupon = async (code: string, packageId?: string): Promise<Coupon | null> => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true);
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      if (!data || data.length === 0) {
        setError('Érvénytelen kuponkód');
        return null;
      }

      const coupon = data[0] as unknown as Coupon;
      
      // Check if coupon is for specific package
      if (coupon.flight_package_id && packageId && coupon.flight_package_id !== packageId) {
        setError('Ez a kupon nem használható ehhez a csomaghoz');
        return null;
      }

      // Check expiration
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        setError('Ez a kupon lejárt');
        return null;
      }

      // Check usage limit
      if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
        setError('Ez a kupon már elérte a felhasználási limitet');
        return null;
      }

      return coupon;
    } catch (err) {
      setError('Hiba a kupon ellenőrzése során');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = useCallback(async (
    basePrice: number,
    passengerCount: number,
    packageId: string,
    slotDate: Date,
    coupon?: Coupon | null
  ): Promise<PriceBreakdown> => {
    const totalBasePrice = basePrice * passengerCount;
    let breakdown: PriceBreakdown = {
      basePrice: totalBasePrice,
      discountAmount: 0,
      campaignAmount: 0,
      couponAmount: 0,
      finalPrice: totalBasePrice,
    };

    try {
      // Fetch and apply automatic discounts
      const discounts = await fetchActiveDiscounts(packageId);
      for (const discount of discounts) {
        if (isConditionMet(discount.condition_type, discount.condition_days || null, slotDate)) {
          const amount = calculateDiscount(totalBasePrice, discount.discount_type, discount.discount_value);
          if (amount > breakdown.discountAmount) {
            breakdown.discountAmount = amount;
            breakdown.appliedDiscount = discount;
          }
        }
      }

      // Fetch and apply campaigns (only best one)
      const campaigns = await fetchActiveCampaigns(packageId);
      for (const campaign of campaigns) {
        const amount = calculateDiscount(totalBasePrice, campaign.discount_type, campaign.discount_value);
        if (amount > breakdown.campaignAmount) {
          breakdown.campaignAmount = amount;
          breakdown.appliedCampaign = campaign;
        }
      }

      // Apply coupon if provided
      if (coupon) {
        breakdown.couponAmount = calculateDiscount(totalBasePrice, coupon.discount_type, coupon.discount_value);
        breakdown.appliedCoupon = coupon;
      }

      // Calculate final price (discounts stack but can't go below 0)
      const totalDiscount = breakdown.discountAmount + breakdown.campaignAmount + breakdown.couponAmount;
      breakdown.finalPrice = Math.max(0, totalBasePrice - totalDiscount);

    } catch (err) {
      console.error('Error calculating price:', err);
    }

    return breakdown;
  }, []);

  const incrementCouponUsage = async (couponId: string) => {
    // Get current usage and increment
    const { data } = await supabase
      .from('coupons')
      .select('times_used')
      .eq('id', couponId)
      .single();
    
    if (data) {
      await supabase
        .from('coupons')
        .update({ times_used: data.times_used + 1 })
        .eq('id', couponId);
    }
  };

  return {
    loading,
    error,
    validateCoupon,
    calculatePrice,
    incrementCouponUsage,
    clearError: () => setError(null),
  };
};
