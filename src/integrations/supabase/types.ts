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
      "bridge_course_uni(U-C)": {
        Row: {
          course_code: string
          course_name: string
          id_bridge_cu: string
          id_course: string
          id_uni: string
        }
        Insert: {
          course_code: string
          course_name: string
          id_bridge_cu: string
          id_course: string
          id_uni: string
        }
        Update: {
          course_code?: string
          course_name?: string
          id_bridge_cu?: string
          id_course?: string
          id_uni?: string
        }
        Relationships: []
      }
      "bridge_cp(C-P)": {
        Row: {
          "Ba/Ma": string
          code_course: string
          id_bridge_cp: string
          id_course: string
          id_program: string
          "Mandatory/Optional": string
          name_course: string
          program_name: string
          Year: number | null
        }
        Insert: {
          "Ba/Ma": string
          code_course: string
          id_bridge_cp: string
          id_course: string
          id_program: string
          "Mandatory/Optional": string
          name_course: string
          program_name: string
          Year?: number | null
        }
        Update: {
          "Ba/Ma"?: string
          code_course?: string
          id_bridge_cp?: string
          id_course?: string
          id_program?: string
          "Mandatory/Optional"?: string
          name_course?: string
          program_name?: string
          Year?: number | null
        }
        Relationships: []
      }
      "bridge_tc(T-C)": {
        Row: {
          course_code: string
          id_bridge_tc: string
          id_course: string
          id_teacher: string | null
          professor_name: string
        }
        Insert: {
          course_code: string
          id_bridge_tc: string
          id_course: string
          id_teacher?: string | null
          professor_name: string
        }
        Update: {
          course_code?: string
          id_bridge_tc?: string
          id_course?: string
          id_teacher?: string | null
          professor_name?: string
        }
        Relationships: []
      }
      "bridge_ul(U-L)": {
        Row: {
          created_at: string
          id_bridge_lu: string
          id_lab: string | null
          id_uni: string | null
          slug: string | null
          slug_uni: string | null
        }
        Insert: {
          created_at?: string
          id_bridge_lu?: string
          id_lab?: string | null
          id_uni?: string | null
          slug?: string | null
          slug_uni?: string | null
        }
        Update: {
          created_at?: string
          id_bridge_lu?: string
          id_lab?: string | null
          id_uni?: string | null
          slug?: string | null
          slug_uni?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bridge_ul(U-L)_id_lab_fkey"
            columns: ["id_lab"]
            isOneToOne: false
            referencedRelation: "Labs(L)"
            referencedColumns: ["id_lab"]
          },
          {
            foreignKeyName: "bridge_ul(U-L)_id_uni_fkey"
            columns: ["id_uni"]
            isOneToOne: false
            referencedRelation: "Universities(U)"
            referencedColumns: ["uuid"]
          },
        ]
      }
      "bridge_up(U-P)": {
        Row: {
          created_at: string
          duration: string | null
          id_bridge_up: string
          id_program: string | null
          id_uni: string | null
          is_active: boolean | null
          level: string | null
          website: string | null
        }
        Insert: {
          created_at?: string
          duration?: string | null
          id_bridge_up?: string
          id_program?: string | null
          id_uni?: string | null
          is_active?: boolean | null
          level?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string
          duration?: string | null
          id_bridge_up?: string
          id_program?: string | null
          id_uni?: string | null
          is_active?: boolean | null
          level?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bridge_up(U-P)_id_program_fkey"
            columns: ["id_program"]
            isOneToOne: false
            referencedRelation: "Programs(P)"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bridge_up(U-P)_id_uni_fkey"
            columns: ["id_uni"]
            isOneToOne: false
            referencedRelation: "Universities(U)"
            referencedColumns: ["uuid"]
          },
        ]
      }
      "bridge_ut(U-T)": {
        Row: {
          id_teacher: string
          id_uni: string
        }
        Insert: {
          id_teacher: string
          id_uni: string
        }
        Update: {
          id_teacher?: string
          id_uni?: string
        }
        Relationships: []
      }
      "Courses(C)": {
        Row: {
          ba_ma: string | null
          code: string | null
          description: string | null
          ects: number | null
          id_course: string
          language: string | null
          language_code: string | null
          mandatory_optional: string | null
          material_url: string | null
          media: string | null
          name_course: string
          professor_name: string | null
          programs: string | null
          software_equipment: string | null
          stats: string | null
          term: string | null
          topics: string | null
          type_exam: string | null
          updated_at: string
          which_year: string | null
          year: string | null
        }
        Insert: {
          ba_ma?: string | null
          code?: string | null
          description?: string | null
          ects?: number | null
          id_course?: string
          language?: string | null
          language_code?: string | null
          mandatory_optional?: string | null
          material_url?: string | null
          media?: string | null
          name_course: string
          professor_name?: string | null
          programs?: string | null
          software_equipment?: string | null
          stats?: string | null
          term?: string | null
          topics?: string | null
          type_exam?: string | null
          updated_at?: string
          which_year?: string | null
          year?: string | null
        }
        Update: {
          ba_ma?: string | null
          code?: string | null
          description?: string | null
          ects?: number | null
          id_course?: string
          language?: string | null
          language_code?: string | null
          mandatory_optional?: string | null
          material_url?: string | null
          media?: string | null
          name_course?: string
          professor_name?: string | null
          programs?: string | null
          software_equipment?: string | null
          stats?: string | null
          term?: string | null
          topics?: string | null
          type_exam?: string | null
          updated_at?: string
          which_year?: string | null
          year?: string | null
        }
        Relationships: []
      }
      "Labs(L)": {
        Row: {
          created_at: string
          description: string | null
          faculty_match: string | null
          id_lab: string
          image: string | null
          link: string | null
          name: string
          professors: string | null
          slug: string | null
          topics: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          faculty_match?: string | null
          id_lab?: string
          image?: string | null
          link?: string | null
          name: string
          professors?: string | null
          slug?: string | null
          topics?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          faculty_match?: string | null
          id_lab?: string
          image?: string | null
          link?: string | null
          name?: string
          professors?: string | null
          slug?: string | null
          topics?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      "Learning_agreements(LA)": {
        Row: {
          agreement_type: string
          created_at: string
          description: string | null
          id: string
          status: string | null
          title: string | null
          university_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agreement_type: string
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          title?: string | null
          university_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agreement_type?: string
          created_at?: string
          description?: string | null
          id?: string
          status?: string | null
          title?: string | null
          university_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_agreements_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "Universities(U)"
            referencedColumns: ["uuid"]
          },
          {
            foreignKeyName: "learning_agreements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users(US)"
            referencedColumns: ["id"]
          },
        ]
      }
      "Programs(P)": {
        Row: {
          description: string | null
          id: string
          image: string | null
          name: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          description?: string | null
          id?: string
          image?: string | null
          name: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          description?: string | null
          id?: string
          image?: string | null
          name?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      "Teachers(T)": {
        Row: {
          citations: string | null
          email: string | null
          full_name: string | null
          "h-index": string | null
          id_teacher: string
          name: string | null
          topics: string[] | null
          updated_at: string
        }
        Insert: {
          citations?: string | null
          email?: string | null
          full_name?: string | null
          "h-index"?: string | null
          id_teacher?: string
          name?: string | null
          topics?: string[] | null
          updated_at?: string
        }
        Update: {
          citations?: string | null
          email?: string | null
          full_name?: string | null
          "h-index"?: string | null
          id_teacher?: string
          name?: string | null
          topics?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      "Universities(U)": {
        Row: {
          coordinates: unknown
          country: string | null
          country_code: string | null
          created_at: string | null
          logo_url: string | null
          name: string
          slug: string
          uuid: string
          website: string | null
        }
        Insert: {
          coordinates?: unknown
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          logo_url?: string | null
          name: string
          slug: string
          uuid?: string
          website?: string | null
        }
        Update: {
          coordinates?: unknown
          country?: string | null
          country_code?: string | null
          created_at?: string | null
          logo_url?: string | null
          name?: string
          slug?: string
          uuid?: string
          website?: string | null
        }
        Relationships: []
      }
      "user_saved_courses(US-C)": {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          note: string | null
          user_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          note?: string | null
          user_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          note?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usc_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "Courses(C)"
            referencedColumns: ["id_course"]
          },
          {
            foreignKeyName: "usc_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users(US)"
            referencedColumns: ["id"]
          },
        ]
      }
      "user_saved_labs(US-L)": {
        Row: {
          created_at: string | null
          id: string
          lab_id: string | null
          note: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lab_id?: string | null
          note?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lab_id?: string | null
          note?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usl_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "Labs(L)"
            referencedColumns: ["id_lab"]
          },
          {
            foreignKeyName: "usl_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users(US)"
            referencedColumns: ["id"]
          },
        ]
      }
      "user_saved_programs(US-P)": {
        Row: {
          created_at: string | null
          id: string
          id_program: string | null
          note: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          id_program?: string | null
          note?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          id_program?: string | null
          note?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_saved_programs(US-P)_id_program_fkey"
            columns: ["id_program"]
            isOneToOne: false
            referencedRelation: "Programs(P)"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usp_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users(US)"
            referencedColumns: ["id"]
          },
        ]
      }
      "Users(US)": {
        Row: {
          birthday: string | null
          country: string | null
          created_at: string
          email: string
          id: string
          profile_photo_url: string | null
          university_id: string | null
          updated_at: string
          username: string
        }
        Insert: {
          birthday?: string | null
          country?: string | null
          created_at?: string
          email: string
          id?: string
          profile_photo_url?: string | null
          university_id?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          birthday?: string | null
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          profile_photo_url?: string | null
          university_id?: string | null
          updated_at?: string
          username?: string
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
