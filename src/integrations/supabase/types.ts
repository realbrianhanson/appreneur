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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cohorts: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_accepting_registrations: boolean
          is_active: boolean
          max_participants: number
          name: string
          spots_taken: number
          start_date: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_accepting_registrations?: boolean
          is_active?: boolean
          max_participants?: number
          name: string
          spots_taken?: number
          start_date: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_accepting_registrations?: boolean
          is_active?: boolean
          max_participants?: number
          name?: string
          spots_taken?: number
          start_date?: string
          updated_at?: string
        }
        Relationships: []
      }
      downloads: {
        Row: {
          downloaded_at: string
          id: string
          ip_address: unknown
          resource_key: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          downloaded_at?: string
          id?: string
          ip_address?: unknown
          resource_key: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          downloaded_at?: string
          id?: string
          ip_address?: unknown
          resource_key?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "downloads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fb_ad_spend: {
        Row: {
          ad_id: string | null
          ad_name: string | null
          adset_id: string | null
          adset_name: string | null
          campaign_id: string
          campaign_name: string | null
          clicks: number
          conversions: number
          created_at: string
          date: string
          id: string
          impressions: number
          spend_cents: number
        }
        Insert: {
          ad_id?: string | null
          ad_name?: string | null
          adset_id?: string | null
          adset_name?: string | null
          campaign_id: string
          campaign_name?: string | null
          clicks?: number
          conversions?: number
          created_at?: string
          date: string
          id?: string
          impressions?: number
          spend_cents?: number
        }
        Update: {
          ad_id?: string | null
          ad_name?: string | null
          adset_id?: string | null
          adset_name?: string | null
          campaign_id?: string
          campaign_name?: string | null
          clicks?: number
          conversions?: number
          created_at?: string
          date?: string
          id?: string
          impressions?: number
          spend_cents?: number
        }
        Relationships: []
      }
      funnel_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          fb_ad_id: string | null
          id: string
          page_url: string | null
          referrer: string | null
          session_id: string
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          fb_ad_id?: string | null
          id?: string
          page_url?: string | null
          referrer?: string | null
          session_id: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          fb_ad_id?: string | null
          id?: string
          page_url?: string | null
          referrer?: string | null
          session_id?: string
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "funnel_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cohort_id: string | null
          created_at: string
          email: string
          fb_ad_id: string | null
          fb_adset_id: string | null
          fb_campaign_id: string | null
          first_name: string
          id: string
          is_vip: boolean
          phone: string | null
          quiz_answers: Json | null
          stripe_customer_id: string | null
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          cohort_id?: string | null
          created_at?: string
          email: string
          fb_ad_id?: string | null
          fb_adset_id?: string | null
          fb_campaign_id?: string | null
          first_name: string
          id: string
          is_vip?: boolean
          phone?: string | null
          quiz_answers?: Json | null
          stripe_customer_id?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          cohort_id?: string | null
          created_at?: string
          email?: string
          fb_ad_id?: string | null
          fb_adset_id?: string | null
          fb_campaign_id?: string | null
          first_name?: string
          id?: string
          is_vip?: boolean
          phone?: string | null
          quiz_answers?: Json | null
          stripe_customer_id?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          metadata: Json | null
          product_type: Database["public"]["Enums"]["product_type"]
          status: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          product_type: Database["public"]["Enums"]["product_type"]
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          metadata?: Json | null
          product_type?: Database["public"]["Enums"]["product_type"]
          status?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_leads: {
        Row: {
          answer1: string
          answer2: string
          answer3: string
          cohort_id: string | null
          created_at: string
          email: string
          first_name: string
          id: string
        }
        Insert: {
          answer1: string
          answer2: string
          answer3: string
          cohort_id?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
        }
        Update: {
          answer1?: string
          answer2?: string
          answer3?: string
          cohort_id?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_leads_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_logs: {
        Row: {
          created_at: string
          delivered_at: string | null
          error_message: string | null
          id: string
          message_body: string
          message_type: Database["public"]["Enums"]["sms_message_type"]
          phone: string
          provider_message_id: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["sms_status"]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_body: string
          message_type: Database["public"]["Enums"]["sms_message_type"]
          phone: string
          provider_message_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["sms_status"]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          message_body?: string
          message_type?: Database["public"]["Enums"]["sms_message_type"]
          phone?: string
          provider_message_id?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["sms_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          app_name: string | null
          app_screenshot_url: string | null
          approved_at: string | null
          cohort_id: string | null
          content: string
          created_at: string
          id: string
          is_approved: boolean
          is_featured: boolean
          name: string
          rating: number | null
          user_id: string | null
        }
        Insert: {
          app_name?: string | null
          app_screenshot_url?: string | null
          approved_at?: string | null
          cohort_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean
          is_featured?: boolean
          name: string
          rating?: number | null
          user_id?: string | null
        }
        Update: {
          app_name?: string | null
          app_screenshot_url?: string | null
          approved_at?: string | null
          cohort_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          is_featured?: boolean
          name?: string
          rating?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_cohort_id_fkey"
            columns: ["cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          day_number: number
          id: string
          is_completed: boolean
          is_unlocked: boolean
          tasks_completed: Json
          time_spent_seconds: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          day_number: number
          id?: string
          is_completed?: boolean
          is_unlocked?: boolean
          tasks_completed?: Json
          time_spent_seconds?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          day_number?: number
          id?: string
          is_completed?: boolean
          is_unlocked?: boolean
          tasks_completed?: Json
          time_spent_seconds?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          converted_at: string | null
          converted_user_id: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          phone: string | null
          target_cohort_id: string | null
        }
        Insert: {
          converted_at?: string | null
          converted_user_id?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          phone?: string | null
          target_cohort_id?: string | null
        }
        Update: {
          converted_at?: string | null
          converted_user_id?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          phone?: string | null
          target_cohort_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_cohort_id_fkey"
            columns: ["target_cohort_id"]
            isOneToOne: false
            referencedRelation: "cohorts"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_deliveries: {
        Row: {
          attempts: number
          created_at: string
          id: string
          last_attempt_at: string | null
          response_body: string | null
          response_status: number | null
          status: string
          webhook_endpoint_id: string
          webhook_event_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          response_body?: string | null
          response_status?: number | null
          status?: string
          webhook_endpoint_id: string
          webhook_event_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          last_attempt_at?: string | null
          response_body?: string | null
          response_status?: number | null
          status?: string
          webhook_endpoint_id?: string
          webhook_event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_endpoint_id_fkey"
            columns: ["webhook_endpoint_id"]
            isOneToOne: false
            referencedRelation: "webhook_endpoints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_deliveries_webhook_event_id_fkey"
            columns: ["webhook_event_id"]
            isOneToOne: false
            referencedRelation: "webhook_events"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_endpoints: {
        Row: {
          created_at: string
          events: string[]
          id: string
          is_active: boolean
          name: string
          secret: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          events: string[]
          id?: string
          is_active?: boolean
          name: string
          secret?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          name?: string
          secret?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload: Json
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload: Json
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_task: {
        Args: {
          p_day_number: number
          p_required_tasks: string[]
          p_task_id: string
        }
        Returns: Json
      }
      get_user_stats: { Args: { p_user_id: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_spots_taken: {
        Args: { cohort_uuid: string }
        Returns: undefined
      }
      initialize_user_progress: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      reserve_cohort_spot: { Args: { p_cohort_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "support"
      product_type:
        | "vip_bundle"
        | "prompt_vault"
        | "ship_it_kit"
        | "pro_monthly"
        | "pro_annual"
      sms_message_type:
        | "cohort_reminder"
        | "day_unlock"
        | "missed_day"
        | "completion"
        | "custom"
      sms_status: "queued" | "sent" | "delivered" | "failed"
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
      app_role: ["super_admin", "admin", "support"],
      product_type: [
        "vip_bundle",
        "prompt_vault",
        "ship_it_kit",
        "pro_monthly",
        "pro_annual",
      ],
      sms_message_type: [
        "cohort_reminder",
        "day_unlock",
        "missed_day",
        "completion",
        "custom",
      ],
      sms_status: ["queued", "sent", "delivered", "failed"],
    },
  },
} as const
