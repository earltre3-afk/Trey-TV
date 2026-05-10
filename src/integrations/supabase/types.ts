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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          id: string
          metadata: Json | null
          reason: string | null
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          reason?: string | null
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          email: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      creator_applications: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          niche: string | null
          reason: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sample_links: Json | null
          social_links: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          niche?: string | null
          reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sample_links?: Json | null
          social_links?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          niche?: string | null
          reason?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sample_links?: Json | null
          social_links?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      profile_decoration_items: {
        Row: {
          asset_url: string | null
          created_at: string
          creator_only: boolean
          description: string | null
          enabled: boolean
          gold_only: boolean
          id: string
          name: string
          point_cost: number
          rarity: string
          style_metadata: Json | null
          type: string
          updated_at: string
        }
        Insert: {
          asset_url?: string | null
          created_at?: string
          creator_only?: boolean
          description?: string | null
          enabled?: boolean
          gold_only?: boolean
          id?: string
          name: string
          point_cost?: number
          rarity?: string
          style_metadata?: Json | null
          type: string
          updated_at?: string
        }
        Update: {
          asset_url?: string | null
          created_at?: string
          creator_only?: boolean
          description?: string | null
          enabled?: boolean
          gold_only?: boolean
          id?: string
          name?: string
          point_cost?: number
          rarity?: string
          style_metadata?: Json | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          ban_reason: string | null
          banned_at: string | null
          banned_by: string | null
          banned_until: string | null
          bio: string | null
          created_at: string
          creator_status: string
          display_name: string | null
          email: string | null
          gold_verified: boolean
          gold_verified_at: string | null
          gold_verified_by: string | null
          id: string
          status: string
          updated_at: string
          username: string | null
          verification_category: string | null
        }
        Insert: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          banned_until?: string | null
          bio?: string | null
          created_at?: string
          creator_status?: string
          display_name?: string | null
          email?: string | null
          gold_verified?: boolean
          gold_verified_at?: string | null
          gold_verified_by?: string | null
          id: string
          status?: string
          updated_at?: string
          username?: string | null
          verification_category?: string | null
        }
        Update: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by?: string | null
          banned_until?: string | null
          bio?: string | null
          created_at?: string
          creator_status?: string
          display_name?: string | null
          email?: string | null
          gold_verified?: boolean
          gold_verified_at?: string | null
          gold_verified_by?: string | null
          id?: string
          status?: string
          updated_at?: string
          username?: string | null
          verification_category?: string | null
        }
        Relationships: []
      }
      reward_ledger: {
        Row: {
          action_key: string
          created_at: string
          id: string
          points: number
          reason: string | null
          source_id: string | null
          source_type: string | null
          user_id: string
        }
        Insert: {
          action_key: string
          created_at?: string
          id?: string
          points: number
          reason?: string | null
          source_id?: string | null
          source_type?: string | null
          user_id: string
        }
        Update: {
          action_key?: string
          created_at?: string
          id?: string
          points?: number
          reason?: string | null
          source_id?: string | null
          source_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      reward_redemptions: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          points_spent: number
          redemption_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          points_spent: number
          redemption_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          points_spent?: number
          redemption_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      reward_rules: {
        Row: {
          action_key: string
          created_at: string
          daily_cap: number | null
          description: string | null
          enabled: boolean
          id: string
          lifetime_cap: number | null
          points: number
          updated_at: string
        }
        Insert: {
          action_key: string
          created_at?: string
          daily_cap?: number | null
          description?: string | null
          enabled?: boolean
          id?: string
          lifetime_cap?: number | null
          points?: number
          updated_at?: string
        }
        Update: {
          action_key?: string
          created_at?: string
          daily_cap?: number | null
          description?: string | null
          enabled?: boolean
          id?: string
          lifetime_cap?: number | null
          points?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_content_blocks: {
        Row: {
          body: string | null
          created_at: string
          id: string
          key: string
          metadata: Json | null
          page: string | null
          section: string | null
          status: string
          title: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          key: string
          metadata?: Json | null
          page?: string | null
          section?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          key?: string
          metadata?: Json | null
          page?: string | null
          section?: string | null
          status?: string
          title?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_profile_decorations: {
        Row: {
          decoration_id: string
          equipped: boolean
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          decoration_id: string
          equipped?: boolean
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          decoration_id?: string
          equipped?: boolean
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profile_decorations_decoration_id_fkey"
            columns: ["decoration_id"]
            isOneToOne: false
            referencedRelation: "profile_decoration_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      verification_applications: {
        Row: {
          category: string
          created_at: string
          explanation: string | null
          id: string
          notable_for: string | null
          official_links: Json | null
          reference_links: Json | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          explanation?: string | null
          id?: string
          notable_for?: string | null
          official_links?: Json | null
          reference_links?: Json | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          explanation?: string | null
          id?: string
          notable_for?: string | null
          official_links?: Json | null
          reference_links?: Json | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_owner: { Args: { _user_id: string }; Returns: boolean }
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
