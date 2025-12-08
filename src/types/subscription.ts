export type SubscriptionStatus = 'trial' | 'active' | 'expired' | 'cancelled';

export interface Operator {
  id: string;
  name: string;
  slug: string;
  subscription_status: SubscriptionStatus;
  subscription_plan: string;
  subscription_price_huf: number;
  subscription_started_at?: string;
  subscription_expires_at?: string;
  billing_email?: string;
  billing_name?: string;
  created_at: string;
}

export interface SubscriptionInfo {
  status: SubscriptionStatus;
  plan: string;
  priceHuf: number;
  startedAt?: Date;
  expiresAt?: Date;
  daysRemaining?: number;
  isActive: boolean;
}
