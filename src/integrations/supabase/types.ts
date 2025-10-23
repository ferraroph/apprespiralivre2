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
      achievements: {
        Row: {
          achievement_type: string
          description: string | null
          icon: string | null
          id: string
          title: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_type: string
          description?: string | null
          icon?: string | null
          id?: string
          title: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_type?: string
          description?: string | null
          icon?: string | null
          id?: string
          title?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      checkins: {
        Row: {
          checkin_date: string
          created_at: string | null
          id: string
          mood: string | null
          notes: string | null
          respi_coins_earned: number | null
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          checkin_date: string
          created_at?: string | null
          id?: string
          mood?: string | null
          notes?: string | null
          respi_coins_earned?: number | null
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          checkin_date?: string
          created_at?: string | null
          id?: string
          mood?: string | null
          notes?: string | null
          respi_coins_earned?: number | null
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      content: {
        Row: {
          coins_reward: number | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_premium: boolean | null
          media_url: string | null
          order_index: number | null
          thumbnail_url: string | null
          title: string
          type: string
          xp_reward: number | null
        }
        Insert: {
          coins_reward?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_premium?: boolean | null
          media_url?: string | null
          order_index?: number | null
          thumbnail_url?: string | null
          title: string
          type: string
          xp_reward?: number | null
        }
        Update: {
          coins_reward?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_premium?: boolean | null
          media_url?: string | null
          order_index?: number | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          archetype: string | null
          avatar_url: string | null
          cigarettes_per_day: number | null
          created_at: string | null
          id: string
          nickname: string
          price_per_pack: number | null
          quit_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          archetype?: string | null
          avatar_url?: string | null
          cigarettes_per_day?: number | null
          created_at?: string | null
          id?: string
          nickname: string
          price_per_pack?: number | null
          quit_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          archetype?: string | null
          avatar_url?: string | null
          cigarettes_per_day?: number | null
          created_at?: string | null
          id?: string
          nickname?: string
          price_per_pack?: number | null
          quit_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      progress: {
        Row: {
          cigarettes_avoided: number | null
          created_at: string | null
          current_streak: number | null
          health_score: number | null
          id: string
          last_checkin_date: string | null
          league: string | null
          level: number | null
          longest_streak: number | null
          money_saved: number | null
          respi_coins: number | null
          streak_freezes: number | null
          updated_at: string | null
          user_id: string
          xp: number | null
        }
        Insert: {
          cigarettes_avoided?: number | null
          created_at?: string | null
          current_streak?: number | null
          health_score?: number | null
          id?: string
          last_checkin_date?: string | null
          league?: string | null
          level?: number | null
          longest_streak?: number | null
          money_saved?: number | null
          respi_coins?: number | null
          streak_freezes?: number | null
          updated_at?: string | null
          user_id: string
          xp?: number | null
        }
        Update: {
          cigarettes_avoided?: number | null
          created_at?: string | null
          current_streak?: number | null
          health_score?: number | null
          id?: string
          last_checkin_date?: string | null
          league?: string | null
          level?: number | null
          longest_streak?: number | null
          money_saved?: number | null
          respi_coins?: number | null
          streak_freezes?: number | null
          updated_at?: string | null
          user_id?: string
          xp?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_daily_progress: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
