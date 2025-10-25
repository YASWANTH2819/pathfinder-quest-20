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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      career_options: {
        Row: {
          career_name: string
          created_at: string
          description: string | null
          id: string
          match_percentage: number | null
          rationale: string | null
          required_skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          career_name: string
          created_at?: string
          description?: string | null
          id?: string
          match_percentage?: number | null
          rationale?: string | null
          required_skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          career_name?: string
          created_at?: string
          description?: string | null
          id?: string
          match_percentage?: number | null
          rationale?: string | null
          required_skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      career_profiles: {
        Row: {
          age: string
          career_health_score: number | null
          career_transition: string | null
          certifications: string | null
          company_type: string | null
          country: string
          created_at: string
          current_year: string | null
          education_level: string | null
          field_of_study: string | null
          financial_support: string | null
          id: string
          interests: string | null
          location_preference: string | null
          long_term_goals: string | null
          name: string
          short_term_goals: string | null
          skills: string | null
          specialization: string | null
          study_or_job: string | null
          updated_at: string
          user_id: string
          work_environment: string | null
        }
        Insert: {
          age: string
          career_health_score?: number | null
          career_transition?: string | null
          certifications?: string | null
          company_type?: string | null
          country: string
          created_at?: string
          current_year?: string | null
          education_level?: string | null
          field_of_study?: string | null
          financial_support?: string | null
          id?: string
          interests?: string | null
          location_preference?: string | null
          long_term_goals?: string | null
          name: string
          short_term_goals?: string | null
          skills?: string | null
          specialization?: string | null
          study_or_job?: string | null
          updated_at?: string
          user_id: string
          work_environment?: string | null
        }
        Update: {
          age?: string
          career_health_score?: number | null
          career_transition?: string | null
          certifications?: string | null
          company_type?: string | null
          country?: string
          created_at?: string
          current_year?: string | null
          education_level?: string | null
          field_of_study?: string | null
          financial_support?: string | null
          id?: string
          interests?: string | null
          location_preference?: string | null
          long_term_goals?: string | null
          name?: string
          short_term_goals?: string | null
          skills?: string | null
          specialization?: string | null
          study_or_job?: string | null
          updated_at?: string
          user_id?: string
          work_environment?: string | null
        }
        Relationships: []
      }
      career_progress: {
        Row: {
          created_at: string
          id: string
          last_activity_date: string | null
          roadmap_data: Json | null
          selected_career_id: string | null
          selected_career_name: string | null
          streak_count: number | null
          updated_at: string
          user_id: string
          xp: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_activity_date?: string | null
          roadmap_data?: Json | null
          selected_career_id?: string | null
          selected_career_name?: string | null
          streak_count?: number | null
          updated_at?: string
          user_id: string
          xp?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          last_activity_date?: string | null
          roadmap_data?: Json | null
          selected_career_id?: string | null
          selected_career_name?: string | null
          streak_count?: number | null
          updated_at?: string
          user_id?: string
          xp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "career_progress_selected_career_id_fkey"
            columns: ["selected_career_id"]
            isOneToOne: false
            referencedRelation: "career_options"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          ats_score: number | null
          career_health: string | null
          career_score: number | null
          created_at: string
          filename: string
          id: string
          overall_rating: number | null
          parsed_data: Json | null
          resume_text: string | null
          skills_analysis: Json | null
          suggestions: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ats_score?: number | null
          career_health?: string | null
          career_score?: number | null
          created_at?: string
          filename: string
          id?: string
          overall_rating?: number | null
          parsed_data?: Json | null
          resume_text?: string | null
          skills_analysis?: Json | null
          suggestions?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ats_score?: number | null
          career_health?: string | null
          career_score?: number | null
          created_at?: string
          filename?: string
          id?: string
          overall_rating?: number | null
          parsed_data?: Json | null
          resume_text?: string | null
          skills_analysis?: Json | null
          suggestions?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      roadmaps: {
        Row: {
          created_at: string
          explanation: string | null
          goal: string | null
          id: string
          profile_data: Json | null
          roadmap_data: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          explanation?: string | null
          goal?: string | null
          id?: string
          profile_data?: Json | null
          roadmap_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          explanation?: string | null
          goal?: string | null
          id?: string
          profile_data?: Json | null
          roadmap_data?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          id: string
          language: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          name?: string
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
      [_ in never]: never
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
