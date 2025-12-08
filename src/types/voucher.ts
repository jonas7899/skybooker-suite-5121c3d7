export type VoucherStatus = 'active' | 'redeemed' | 'expired';

export interface GiftVoucher {
  id: string;
  operator_id: string;
  purchaser_user_id: string;
  flight_package_id: string;
  voucher_code: string;
  recipient_name: string;
  recipient_email?: string;
  personal_message?: string;
  purchase_price_huf: number;
  status: VoucherStatus;
  expires_at: string;
  redeemed_at?: string;
  redeemed_booking_id?: string;
  created_at: string;
  updated_at: string;
  flight_package?: {
    id: string;
    name: string;
    short_description?: string;
    duration_minutes: number;
    base_price_huf: number;
  };
}

export interface CreateVoucherForm {
  flight_package_id: string;
  recipient_name: string;
  recipient_email?: string;
  personal_message?: string;
}

export interface WaitingListEntry {
  id: string;
  user_id: string;
  time_slot_id: string;
  flight_package_id: string;
  passenger_count: number;
  notified: boolean;
  created_at: string;
  time_slot?: {
    id: string;
    slot_date: string;
    start_time: string;
  };
  flight_package?: {
    id: string;
    name: string;
  };
}

export interface BookingReminder {
  id: string;
  booking_id: string;
  reminder_type: '24h_before' | '1_week_before';
  scheduled_for: string;
  sent: boolean;
  sent_at?: string;
  created_at: string;
}
