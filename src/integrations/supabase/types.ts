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
      achievement_categories: {
        Row: {
          color: string
          created_at: string | null
          icon: string
          id: string
          name: string
        }
        Insert: {
          color: string
          created_at?: string | null
          icon: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string | null
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      achievements: {
        Row: {
          achievement_type: string
          category_id: string | null
          coins_reward: number | null
          description: string | null
          gems_reward: number | null
          icon: string | null
          id: string
          is_secret: boolean | null
          rarity: string | null
          title: string
          unlocked_at: string | null
          user_id: string
          xp_reward: number | null
        }
        Insert: {
          achievement_type: string
          category_id?: string | null
          coins_reward?: number | null
          description?: string | null
          gems_reward?: number | null
          icon?: string | null
          id?: string
          is_secret?: boolean | null
          rarity?: string | null
          title: string
          unlocked_at?: string | null
          user_id: string
          xp_reward?: number | null
        }
        Update: {
          achievement_type?: string
          category_id?: string | null
          coins_reward?: number | null
          description?: string | null
          gems_reward?: number | null
          icon?: string | null
          id?: string
          is_secret?: boolean | null
          rarity?: string | null
          title?: string
          unlocked_at?: string | null
          user_id?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "achievements_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "achievement_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      boss_encounters: {
        Row: {
          boss_id: string
          completed: boolean | null
          created_at: string | null
          damage_dealt: number | null
          id: string
          rewards: Json | null
          user_id: string
          victory: boolean | null
        }
        Insert: {
          boss_id: string
          completed?: boolean | null
          created_at?: string | null
          damage_dealt?: number | null
          id?: string
          rewards?: Json | null
          user_id: string
          victory?: boolean | null
        }
        Update: {
          boss_id?: string
          completed?: boolean | null
          created_at?: string | null
          damage_dealt?: number | null
          id?: string
          rewards?: Json | null
          user_id?: string
          victory?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "boss_encounters_boss_id_fkey"
            columns: ["boss_id"]
            isOneToOne: false
            referencedRelation: "boss_types"
            referencedColumns: ["id"]
          },
        ]
      }
      boss_types: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: string
          icon: string
          id: string
          max_health: number
          name: string
          phases: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty: string
          icon: string
          id?: string
          max_health: number
          name: string
          phases?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: string
          icon?: string
          id?: string
          max_health?: number
          name?: string
          phases?: Json | null
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          role?: string
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
      chest_types: {
        Row: {
          created_at: string | null
          gem_chance: number | null
          icon: string
          id: string
          max_coins: number | null
          max_gems: number | null
          max_xp: number | null
          min_coins: number | null
          min_gems: number | null
          min_xp: number | null
          name: string
          rarity: string
        }
        Insert: {
          created_at?: string | null
          gem_chance?: number | null
          icon: string
          id?: string
          max_coins?: number | null
          max_gems?: number | null
          max_xp?: number | null
          min_coins?: number | null
          min_gems?: number | null
          min_xp?: number | null
          name: string
          rarity: string
        }
        Update: {
          created_at?: string | null
          gem_chance?: number | null
          icon?: string
          id?: string
          max_coins?: number | null
          max_gems?: number | null
          max_xp?: number | null
          min_coins?: number | null
          min_gems?: number | null
          min_xp?: number | null
          name?: string
          rarity?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
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
      duels: {
        Row: {
          bet_amount: number
          challenger_id: string
          challenger_score: number | null
          created_at: string | null
          duel_type: string
          end_date: string
          id: string
          opponent_id: string
          opponent_score: number | null
          start_date: string
          status: string
          winner_id: string | null
        }
        Insert: {
          bet_amount: number
          challenger_id: string
          challenger_score?: number | null
          created_at?: string | null
          duel_type: string
          end_date: string
          id?: string
          opponent_id: string
          opponent_score?: number | null
          start_date: string
          status?: string
          winner_id?: string | null
        }
        Update: {
          bet_amount?: number
          challenger_id?: string
          challenger_score?: number | null
          created_at?: string | null
          duel_type?: string
          end_date?: string
          id?: string
          opponent_id?: string
          opponent_score?: number | null
          start_date?: string
          status?: string
          winner_id?: string | null
        }
        Relationships: []
      }
      league_participants: {
        Row: {
          created_at: string | null
          id: string
          league_id: string
          position: number | null
          user_id: string
          week_end: string
          week_start: string
          week_xp: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          league_id: string
          position?: number | null
          user_id: string
          week_end: string
          week_start: string
          week_xp?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          league_id?: string
          position?: number | null
          user_id?: string
          week_end?: string
          week_start?: string
          week_xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "league_participants_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          color: string
          created_at: string | null
          icon: string
          id: string
          min_xp: number
          name: string
          tier: number
        }
        Insert: {
          color: string
          created_at?: string | null
          icon: string
          id?: string
          min_xp: number
          name: string
          tier: number
        }
        Update: {
          color?: string
          created_at?: string | null
          icon?: string
          id?: string
          min_xp?: number
          name?: string
          tier?: number
        }
        Relationships: []
      }
      missions: {
        Row: {
          category: string
          coins_reward: number | null
          created_at: string | null
          description: string | null
          gems_reward: number | null
          icon: string
          id: string
          is_active: boolean | null
          name: string
          target_value: number
          type: string
          xp_reward: number | null
        }
        Insert: {
          category: string
          coins_reward?: number | null
          created_at?: string | null
          description?: string | null
          gems_reward?: number | null
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          target_value: number
          type: string
          xp_reward?: number | null
        }
        Update: {
          category?: string
          coins_reward?: number | null
          created_at?: string | null
          description?: string | null
          gems_reward?: number | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          target_value?: number
          type?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          ads_removed: boolean | null
          archetype: string | null
          avatar_url: string | null
          cigarettes_per_day: number | null
          created_at: string | null
          id: string
          nickname: string
          premium_until: string | null
          price_per_pack: number | null
          quit_date: string | null
          role: string | null
          streak_freeze_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ads_removed?: boolean | null
          archetype?: string | null
          avatar_url?: string | null
          cigarettes_per_day?: number | null
          created_at?: string | null
          id?: string
          nickname: string
          premium_until?: string | null
          price_per_pack?: number | null
          quit_date?: string | null
          role?: string | null
          streak_freeze_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ads_removed?: boolean | null
          archetype?: string | null
          avatar_url?: string | null
          cigarettes_per_day?: number | null
          created_at?: string | null
          id?: string
          nickname?: string
          premium_until?: string | null
          price_per_pack?: number | null
          quit_date?: string | null
          role?: string | null
          streak_freeze_count?: number | null
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
          elo_rating: number | null
          gems: number | null
          health_crystals: number | null
          health_score: number | null
          id: string
          last_checkin_date: string | null
          last_crystal_regen: string | null
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
          elo_rating?: number | null
          gems?: number | null
          health_crystals?: number | null
          health_score?: number | null
          id?: string
          last_checkin_date?: string | null
          last_crystal_regen?: string | null
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
          elo_rating?: number | null
          gems?: number | null
          health_crystals?: number | null
          health_score?: number | null
          id?: string
          last_checkin_date?: string | null
          last_crystal_regen?: string | null
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
      shop_items: {
        Row: {
          created_at: string | null
          description: string | null
          duration_hours: number | null
          effect: Json | null
          icon: string
          id: string
          is_active: boolean | null
          name: string
          price_coins: number | null
          price_gems: number | null
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          effect?: Json | null
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          price_coins?: number | null
          price_gems?: number | null
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_hours?: number | null
          effect?: Json | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          price_coins?: number | null
          price_gems?: number | null
          type?: string
        }
        Relationships: []
      }
      squad_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string | null
          squad_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string | null
          squad_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string | null
          squad_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_members_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      squad_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          squad_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          squad_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          squad_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_messages_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      squads: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          max_members: number | null
          name: string
          squad_streak: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          max_members?: number | null
          name: string
          squad_streak?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          max_members?: number | null
          name?: string
          squad_streak?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_chests: {
        Row: {
          chest_type_id: string
          earned_at: string | null
          id: string
          opened: boolean | null
          opened_at: string | null
          rewards: Json | null
          user_id: string
        }
        Insert: {
          chest_type_id: string
          earned_at?: string | null
          id?: string
          opened?: boolean | null
          opened_at?: string | null
          rewards?: Json | null
          user_id: string
        }
        Update: {
          chest_type_id?: string
          earned_at?: string | null
          id?: string
          opened?: boolean | null
          opened_at?: string | null
          rewards?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_chests_chest_type_id_fkey"
            columns: ["chest_type_id"]
            isOneToOne: false
            referencedRelation: "chest_types"
            referencedColumns: ["id"]
          },
        ]
      }
      user_inventory: {
        Row: {
          active: boolean | null
          created_at: string | null
          expires_at: string | null
          id: string
          item_id: string
          quantity: number | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          item_id: string
          quantity?: number | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          item_id?: string
          quantity?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_inventory_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "shop_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_missions: {
        Row: {
          claimed: boolean | null
          completed: boolean | null
          created_at: string | null
          current_progress: number | null
          date: string
          id: string
          mission_id: string
          user_id: string
        }
        Insert: {
          claimed?: boolean | null
          completed?: boolean | null
          created_at?: string | null
          current_progress?: number | null
          date?: string
          id?: string
          mission_id: string
          user_id: string
        }
        Update: {
          claimed?: boolean | null
          completed?: boolean | null
          created_at?: string | null
          current_progress?: number | null
          date?: string
          id?: string
          mission_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_tokens: {
        Row: {
          created_at: string
          device_type: string | null
          id: string
          last_used_at: string | null
          push_subscription: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          id?: string
          last_used_at?: string | null
          push_subscription?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_type?: string | null
          id?: string
          last_used_at?: string | null
          push_subscription?: string | null
          user_id?: string
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
      create_daily_chest: { Args: { p_user_id: string }; Returns: undefined }
      get_user_league: { Args: { p_user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_league_positions: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
