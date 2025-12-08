export interface NotificationBookingDetails {
  id: string;
  time_slot: {
    slot_date: string;
    start_time: string;
  } | null;
  flight_package: {
    name: string;
  } | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  related_booking_id: string | null;
  created_at: string;
  booking?: NotificationBookingDetails | null;
}
