export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface PassengerDetails {
  name: string;
  email?: string;
  phone?: string;
  weight_kg?: number;
  notes?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  flight_package_id: string;
  time_slot_id: string;
  passenger_count: number;
  passenger_details?: PassengerDetails[];
  status: BookingStatus;
  notes?: string;
  total_price_huf: number;
  created_at: string;
  updated_at: string;
  flight_package?: {
    id: string;
    name: string;
    short_description?: string;
    duration_minutes: number;
    base_price_huf: number;
    difficulty_level: string;
  };
  time_slot?: {
    id: string;
    slot_date: string;
    start_time: string;
    duration_minutes: number;
  };
}

export interface CreateBookingForm {
  flight_package_id: string;
  time_slot_id: string;
  passenger_count: number;
  passenger_details: PassengerDetails[];
  notes?: string;
}
