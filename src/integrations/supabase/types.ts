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
      alerts: {
        Row: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at: string
          description: string | null
          id: string
          is_read: boolean
          metadata: Json | null
          priority: Database["public"]["Enums"]["alert_priority"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["alert_priority"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: Database["public"]["Enums"]["alert_type"]
          created_at?: string
          description?: string | null
          id?: string
          is_read?: boolean
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["alert_priority"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      patents: {
        Row: {
          abstract: string | null
          all_images: string[] | null
          application_number: string | null
          category: Database["public"]["Enums"]["product_category"]
          cited_by: Json | null
          claims: string | null
          classifications: Json | null
          company: string
          country_status: Json | null
          created_at: string
          description: string | null
          details_loaded: boolean | null
          details_loaded_at: string | null
          events: Json | null
          expiry_date: string | null
          external_links: Json | null
          figures: Json | null
          filing_date: string
          google_patents_link: string | null
          grant_date: string | null
          id: string
          inpi_link: string | null
          inventors: string[] | null
          language: string | null
          legal_events: Json | null
          patent_number: string
          pdf_url: string | null
          prior_art_keywords: string[] | null
          priority_date: string | null
          publication_date: string | null
          publication_number: string | null
          similar_documents: Json | null
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          worldwide_applications: Json | null
        }
        Insert: {
          abstract?: string | null
          all_images?: string[] | null
          application_number?: string | null
          category: Database["public"]["Enums"]["product_category"]
          cited_by?: Json | null
          claims?: string | null
          classifications?: Json | null
          company: string
          country_status?: Json | null
          created_at?: string
          description?: string | null
          details_loaded?: boolean | null
          details_loaded_at?: string | null
          events?: Json | null
          expiry_date?: string | null
          external_links?: Json | null
          figures?: Json | null
          filing_date: string
          google_patents_link?: string | null
          grant_date?: string | null
          id?: string
          inpi_link?: string | null
          inventors?: string[] | null
          language?: string | null
          legal_events?: Json | null
          patent_number: string
          pdf_url?: string | null
          prior_art_keywords?: string[] | null
          priority_date?: string | null
          publication_date?: string | null
          publication_number?: string | null
          similar_documents?: Json | null
          status: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          worldwide_applications?: Json | null
        }
        Update: {
          abstract?: string | null
          all_images?: string[] | null
          application_number?: string | null
          category?: Database["public"]["Enums"]["product_category"]
          cited_by?: Json | null
          claims?: string | null
          classifications?: Json | null
          company?: string
          country_status?: Json | null
          created_at?: string
          description?: string | null
          details_loaded?: boolean | null
          details_loaded_at?: string | null
          events?: Json | null
          expiry_date?: string | null
          external_links?: Json | null
          figures?: Json | null
          filing_date?: string
          google_patents_link?: string | null
          grant_date?: string | null
          id?: string
          inpi_link?: string | null
          inventors?: string[] | null
          language?: string | null
          legal_events?: Json | null
          patent_number?: string
          pdf_url?: string | null
          prior_art_keywords?: string[] | null
          priority_date?: string | null
          publication_date?: string | null
          publication_number?: string | null
          similar_documents?: Json | null
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          worldwide_applications?: Json | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      regulatory_records: {
        Row: {
          active_ingredients: string[] | null
          approval_date: string | null
          category: Database["public"]["Enums"]["product_category"]
          company: string
          created_at: string
          id: string
          mapa_link: string | null
          notes: string | null
          product_name: string
          registration_number: string | null
          status: Database["public"]["Enums"]["regulatory_status"]
          submission_date: string | null
          target_crops: string[] | null
          updated_at: string
        }
        Insert: {
          active_ingredients?: string[] | null
          approval_date?: string | null
          category: Database["public"]["Enums"]["product_category"]
          company: string
          created_at?: string
          id?: string
          mapa_link?: string | null
          notes?: string | null
          product_name: string
          registration_number?: string | null
          status: Database["public"]["Enums"]["regulatory_status"]
          submission_date?: string | null
          target_crops?: string[] | null
          updated_at?: string
        }
        Update: {
          active_ingredients?: string[] | null
          approval_date?: string | null
          category?: Database["public"]["Enums"]["product_category"]
          company?: string
          created_at?: string
          id?: string
          mapa_link?: string | null
          notes?: string | null
          product_name?: string
          registration_number?: string | null
          status?: Database["public"]["Enums"]["regulatory_status"]
          submission_date?: string | null
          target_crops?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          data: Json | null
          file_url: string | null
          filters: Json | null
          id: string
          report_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          file_url?: string | null
          filters?: Json | null
          id?: string
          report_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          file_url?: string | null
          filters?: Json | null
          id?: string
          report_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      alert_priority: "low" | "medium" | "high" | "critical"
      alert_type:
        | "regulatory_approval"
        | "patent_expiry"
        | "competitor_launch"
        | "market_change"
        | "new_publication"
        | "price_change"
      product_category:
        | "foliar_nutrition"
        | "biostimulants"
        | "biodefensives"
        | "adjuvants"
        | "biofertilizers"
      regulatory_status:
        | "pre_registered"
        | "under_analysis"
        | "approved"
        | "rejected"
        | "suspended"
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
      alert_priority: ["low", "medium", "high", "critical"],
      alert_type: [
        "regulatory_approval",
        "patent_expiry",
        "competitor_launch",
        "market_change",
        "new_publication",
        "price_change",
      ],
      product_category: [
        "foliar_nutrition",
        "biostimulants",
        "biodefensives",
        "adjuvants",
        "biofertilizers",
      ],
      regulatory_status: [
        "pre_registered",
        "under_analysis",
        "approved",
        "rejected",
        "suspended",
      ],
    },
  },
} as const
