export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      booking_reminders: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          reminder_type: string
          scheduled_for: string
          sent: boolean
          sent_at: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          reminder_type: string
          scheduled_for: string
          sent?: boolean
          sent_at?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          reminder_type?: string
          scheduled_for?: string
          sent?: boolean
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_reminders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          created_at: string
          flight_package_id: string
          id: string
          notes: string | null
          passenger_count: number
          passenger_details: Json | null
          status: Database["public"]["Enums"]["booking_status"]
          time_slot_id: string
          total_price_huf: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          flight_package_id: string
          id?: string
          notes?: string | null
          passenger_count?: number
          passenger_details?: Json | null
          status?: Database["public"]["Enums"]["booking_status"]
          time_slot_id: string
          total_price_huf: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          flight_package_id?: string
          id?: string
          notes?: string | null
          passenger_count?: number
          passenger_details?: Json | null
          status?: Database["public"]["Enums"]["booking_status"]
          time_slot_id?: string
          total_price_huf?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_flight_package_id_fkey"
            columns: ["flight_package_id"]
            isOneToOne: false
            referencedRelation: "flight_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "flight_time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          created_at: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          ends_at: string
          flight_package_id: string
          id: string
          is_active: boolean
          name: string
          starts_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          ends_at: string
          flight_package_id: string
          id?: string
          is_active?: boolean
          name: string
          starts_at: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          ends_at?: string
          flight_package_id?: string
          id?: string
          is_active?: boolean
          name?: string
          starts_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_flight_package_id_fkey"
            columns: ["flight_package_id"]
            isOneToOne: false
            referencedRelation: "flight_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          expires_at: string | null
          flight_package_id: string | null
          id: string
          is_active: boolean
          operator_id: string
          times_used: number
          updated_at: string
          usage_limit: number | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          expires_at?: string | null
          flight_package_id?: string | null
          id?: string
          is_active?: boolean
          operator_id: string
          times_used?: number
          updated_at?: string
          usage_limit?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          expires_at?: string | null
          flight_package_id?: string | null
          id?: string
          is_active?: boolean
          operator_id?: string
          times_used?: number
          updated_at?: string
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_flight_package_id_fkey"
            columns: ["flight_package_id"]
            isOneToOne: false
            referencedRelation: "flight_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupons_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_packages: {
        Row: {
          base_price_huf: number
          created_at: string
          detailed_description: string | null
          difficulty_level: string
          duration_minutes: number
          id: string
          image_url: string | null
          is_active: boolean
          max_passengers: number
          name: string
          operator_id: string
          recommended_audience: string | null
          route_description: string | null
          short_description: string | null
          updated_at: string
        }
        Insert: {
          base_price_huf: number
          created_at?: string
          detailed_description?: string | null
          difficulty_level?: string
          duration_minutes?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_passengers?: number
          name: string
          operator_id: string
          recommended_audience?: string | null
          route_description?: string | null
          short_description?: string | null
          updated_at?: string
        }
        Update: {
          base_price_huf?: number
          created_at?: string
          detailed_description?: string | null
          difficulty_level?: string
          duration_minutes?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          max_passengers?: number
          name?: string
          operator_id?: string
          recommended_audience?: string | null
          route_description?: string | null
          short_description?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flight_packages_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      flight_time_slots: {
        Row: {
          created_at: string
          current_passengers: number
          duration_minutes: number
          flight_package_id: string | null
          id: string
          max_passengers: number
          operator_id: string
          slot_date: string
          start_time: string
          status: Database["public"]["Enums"]["time_slot_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_passengers?: number
          duration_minutes?: number
          flight_package_id?: string | null
          id?: string
          max_passengers?: number
          operator_id: string
          slot_date: string
          start_time: string
          status?: Database["public"]["Enums"]["time_slot_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_passengers?: number
          duration_minutes?: number
          flight_package_id?: string | null
          id?: string
          max_passengers?: number
          operator_id?: string
          slot_date?: string
          start_time?: string
          status?: Database["public"]["Enums"]["time_slot_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flight_time_slots_flight_package_id_fkey"
            columns: ["flight_package_id"]
            isOneToOne: false
            referencedRelation: "flight_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flight_time_slots_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_vouchers: {
        Row: {
          created_at: string
          expires_at: string
          flight_package_id: string
          id: string
          operator_id: string
          personal_message: string | null
          purchase_price_huf: number
          purchaser_user_id: string
          recipient_email: string | null
          recipient_name: string
          redeemed_at: string | null
          redeemed_booking_id: string | null
          status: string
          updated_at: string
          voucher_code: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          flight_package_id: string
          id?: string
          operator_id: string
          personal_message?: string | null
          purchase_price_huf: number
          purchaser_user_id: string
          recipient_email?: string | null
          recipient_name: string
          redeemed_at?: string | null
          redeemed_booking_id?: string | null
          status?: string
          updated_at?: string
          voucher_code: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          flight_package_id?: string
          id?: string
          operator_id?: string
          personal_message?: string | null
          purchase_price_huf?: number
          purchaser_user_id?: string
          recipient_email?: string | null
          recipient_name?: string
          redeemed_at?: string | null
          redeemed_booking_id?: string | null
          status?: string
          updated_at?: string
          voucher_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_vouchers_flight_package_id_fkey"
            columns: ["flight_package_id"]
            isOneToOne: false
            referencedRelation: "flight_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_vouchers_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gift_vouchers_redeemed_booking_id_fkey"
            columns: ["redeemed_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_booking_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_booking_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_booking_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      operators: {
        Row: {
          billing_email: string | null
          billing_name: string | null
          created_at: string
          id: string
          name: string
          slug: string
          subscription_expires_at: string | null
          subscription_plan: string | null
          subscription_price_huf: number | null
          subscription_started_at: string | null
          subscription_status: string
        }
        Insert: {
          billing_email?: string | null
          billing_name?: string | null
          created_at?: string
          id?: string
          name: string
          slug: string
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          subscription_price_huf?: number | null
          subscription_started_at?: string | null
          subscription_status?: string
        }
        Update: {
          billing_email?: string | null
          billing_name?: string | null
          created_at?: string
          id?: string
          name?: string
          slug?: string
          subscription_expires_at?: string | null
          subscription_plan?: string | null
          subscription_price_huf?: number | null
          subscription_started_at?: string | null
          subscription_status?: string
        }
        Relationships: []
      }
      package_discounts: {
        Row: {
          condition_days: number[] | null
          condition_type: Database["public"]["Enums"]["discount_condition"]
          created_at: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          flight_package_id: string
          id: string
          is_active: boolean
          updated_at: string
        }
        Insert: {
          condition_days?: number[] | null
          condition_type?: Database["public"]["Enums"]["discount_condition"]
          created_at?: string
          discount_type: Database["public"]["Enums"]["discount_type"]
          discount_value: number
          flight_package_id: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          condition_days?: number[] | null
          condition_type?: Database["public"]["Enums"]["discount_condition"]
          created_at?: string
          discount_type?: Database["public"]["Enums"]["discount_type"]
          discount_value?: number
          flight_package_id?: string
          id?: string
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_discounts_flight_package_id_fkey"
            columns: ["flight_package_id"]
            isOneToOne: false
            referencedRelation: "flight_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          is_bootstrap: boolean
          phone: string | null
          rejected_until: string | null
          status: Database["public"]["Enums"]["profile_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id: string
          is_bootstrap?: boolean
          phone?: string | null
          rejected_until?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          is_bootstrap?: boolean
          phone?: string | null
          rejected_until?: string | null
          status?: Database["public"]["Enums"]["profile_status"]
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          id: string
          operator_id: string | null
          rejected_at: string | null
          rejection_reason: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          operator_id?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          id?: string
          operator_id?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waiting_list: {
        Row: {
          created_at: string
          flight_package_id: string
          id: string
          notified: boolean
          passenger_count: number
          time_slot_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          flight_package_id: string
          id?: string
          notified?: boolean
          passenger_count?: number
          time_slot_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          flight_package_id?: string
          id?: string
          notified?: boolean
          passenger_count?: number
          time_slot_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waiting_list_flight_package_id_fkey"
            columns: ["flight_package_id"]
            isOneToOne: false
            referencedRelation: "flight_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waiting_list_time_slot_id_fkey"
            columns: ["time_slot_id"]
            isOneToOne: false
            referencedRelation: "flight_time_slots"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_first_super_admin: {
        Args: { _full_name: string; _phone?: string; _user_id: string }
        Returns: boolean
      }
      generate_voucher_code: { Args: never; Returns: string }
      get_user_operator_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_operator_subscription_active: {
        Args: { _operator_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "operator_admin" | "operator_staff" | "user"
      booking_status: "pending" | "confirmed" | "cancelled"
      discount_condition: "always" | "weekday" | "weekend" | "specific_days"
      discount_type: "percentage" | "fixed_amount"
      profile_status:
        | "bootstrap"
        | "pending"
        | "active"
        | "rejected"
        | "inactive"
        | "suspended"
      time_slot_status: "available" | "booked" | "closed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "operator_admin", "operator_staff", "user"],
      booking_status: ["pending", "confirmed", "cancelled"],
      discount_condition: ["always", "weekday", "weekend", "specific_days"],
      discount_type: ["percentage", "fixed_amount"],
      profile_status: [
        "bootstrap",
        "pending",
        "active",
        "rejected",
        "inactive",
        "suspended",
      ],
      time_slot_status: ["available", "booked", "closed"],
    },
  },
} as const
