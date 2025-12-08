export type DiscountType = 'percentage' | 'fixed_amount';
export type DiscountCondition = 'always' | 'weekday' | 'weekend' | 'specific_days';

export interface Coupon {
  id: string;
  operator_id: string;
  flight_package_id?: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  expires_at?: string;
  usage_limit?: number;
  times_used: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  flight_package?: {
    id: string;
    name: string;
  };
}

export interface PackageDiscount {
  id: string;
  flight_package_id: string;
  discount_type: DiscountType;
  discount_value: number;
  condition_type: DiscountCondition;
  condition_days?: number[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  flight_package?: {
    id: string;
    name: string;
  };
}

export interface Campaign {
  id: string;
  flight_package_id: string;
  name: string;
  discount_type: DiscountType;
  discount_value: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  flight_package?: {
    id: string;
    name: string;
  };
}

export interface PriceBreakdown {
  basePrice: number;
  discountAmount: number;
  campaignAmount: number;
  couponAmount: number;
  finalPrice: number;
  appliedDiscount?: PackageDiscount;
  appliedCampaign?: Campaign;
  appliedCoupon?: Coupon;
}
