export type TimeSlotStatus = 'available' | 'booked' | 'closed';

export interface TimeSlot {
  id: string;
  operator_id: string;
  flight_package_id?: string;
  slot_date: string;
  start_time: string;
  duration_minutes: number;
  max_passengers: number;
  current_passengers: number;
  status: TimeSlotStatus;
  created_at: string;
  updated_at: string;
  flight_package?: FlightPackage;
}

export interface FlightPackage {
  id: string;
  operator_id: string;
  name: string;
  short_description?: string;
  detailed_description?: string;
  route_description?: string;
  duration_minutes: number;
  difficulty_level: 'easy' | 'medium' | 'aerobatic';
  recommended_audience?: string;
  base_price_huf: number;
  max_passengers: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateTimeSlotForm {
  slot_date: Date;
  start_time: string;
  duration_minutes: number;
  max_passengers: number;
  flight_package_id?: string;
}
