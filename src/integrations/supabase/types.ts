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
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_messages: {
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
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
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
      "bridge_lp(L-P)": {
        Row: {
          id_bridge_lp: string
          lab_id: string
          lab_slug: string
          program_id: string
          program_slug: string
        }
        Insert: {
          id_bridge_lp: string
          lab_id: string
          lab_slug: string
          program_id: string
          program_slug: string
        }
        Update: {
          id_bridge_lp?: string
          lab_id?: string
          lab_slug?: string
          program_id?: string
          program_slug?: string
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
      "bridge_topc(TOP-C)": {
        Row: {
          bridge_id: string
          course_code: string | null
          course_id: string | null
          course_name: string | null
          topic_id: string | null
          topic_name: string | null
        }
        Insert: {
          bridge_id?: string
          course_code?: string | null
          course_id?: string | null
          course_name?: string | null
          topic_id?: string | null
          topic_name?: string | null
        }
        Update: {
          bridge_id?: string
          course_code?: string | null
          course_id?: string | null
          course_name?: string | null
          topic_id?: string | null
          topic_name?: string | null
        }
        Relationships: []
      }
      "bridge_topl(TOP-L)": {
        Row: {
          lab_slug: string | null
          topic_name: string | null
          uuid_bridge: string
          uuid_lab: string | null
          uuid_topic: string | null
        }
        Insert: {
          lab_slug?: string | null
          topic_name?: string | null
          uuid_bridge?: string
          uuid_lab?: string | null
          uuid_topic?: string | null
        }
        Update: {
          lab_slug?: string | null
          topic_name?: string | null
          uuid_bridge?: string
          uuid_lab?: string | null
          uuid_topic?: string | null
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
      course_review_upvotes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_review_upvotes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "course_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_review_upvotes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users(US)"
            referencedColumns: ["id"]
          },
        ]
      }
      course_reviews: {
        Row: {
          comment: string | null
          course_id: string
          created_at: string
          difficulty: string | null
          id: string
          organization: string | null
          rating: number
          updated_at: string
          upvote_count: number | null
          user_id: string
          workload: string | null
        }
        Insert: {
          comment?: string | null
          course_id: string
          created_at?: string
          difficulty?: string | null
          id?: string
          organization?: string | null
          rating: number
          updated_at?: string
          upvote_count?: number | null
          user_id: string
          workload?: string | null
        }
        Update: {
          comment?: string | null
          course_id?: string
          created_at?: string
          difficulty?: string | null
          id?: string
          organization?: string | null
          rating?: number
          updated_at?: string
          upvote_count?: number | null
          user_id?: string
          workload?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "Courses(C)"
            referencedColumns: ["id_course"]
          },
          {
            foreignKeyName: "course_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Users(US)"
            referencedColumns: ["id"]
          },
        ]
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
      diary_lab_communications: {
        Row: {
          created_at: string
          email_draft_id: string | null
          id: string
          lab_id: string | null
          notes: string | null
          reply_received: boolean | null
          sent_date: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_draft_id?: string | null
          id?: string
          lab_id?: string | null
          notes?: string | null
          reply_received?: boolean | null
          sent_date?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_draft_id?: string | null
          id?: string
          lab_id?: string | null
          notes?: string | null
          reply_received?: boolean | null
          sent_date?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diary_lab_communications_email_draft_id_fkey"
            columns: ["email_draft_id"]
            isOneToOne: false
            referencedRelation: "email_drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diary_lab_communications_lab_id_fkey"
            columns: ["lab_id"]
            isOneToOne: false
            referencedRelation: "Labs(L)"
            referencedColumns: ["id_lab"]
          },
        ]
      }
      diary_notebooks: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      diary_page_items: {
        Row: {
          color: string | null
          content: string | null
          created_at: string
          height: number | null
          id: string
          is_completed: boolean | null
          item_type: string
          page_id: string
          position_x: number
          position_y: number
          reference_id: string | null
          updated_at: string
          width: number | null
          zone: string | null
        }
        Insert: {
          color?: string | null
          content?: string | null
          created_at?: string
          height?: number | null
          id?: string
          is_completed?: boolean | null
          item_type: string
          page_id: string
          position_x?: number
          position_y?: number
          reference_id?: string | null
          updated_at?: string
          width?: number | null
          zone?: string | null
        }
        Update: {
          color?: string | null
          content?: string | null
          created_at?: string
          height?: number | null
          id?: string
          is_completed?: boolean | null
          item_type?: string
          page_id?: string
          position_x?: number
          position_y?: number
          reference_id?: string | null
          updated_at?: string
          width?: number | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diary_page_items_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "diary_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      diary_pages: {
        Row: {
          created_at: string
          id: string
          notebook_id: string
          page_number: number
          page_type: string
          semester: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          notebook_id: string
          page_number?: number
          page_type?: string
          semester?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          notebook_id?: string
          page_number?: number
          page_type?: string
          semester?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "diary_pages_notebook_id_fkey"
            columns: ["notebook_id"]
            isOneToOne: false
            referencedRelation: "diary_notebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      email_drafts: {
        Row: {
          ai_generated: boolean | null
          body: string | null
          created_at: string
          id: string
          recipient: string | null
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_generated?: boolean | null
          body?: string | null
          created_at?: string
          id?: string
          recipient?: string | null
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_generated?: boolean | null
          body?: string | null
          created_at?: string
          id?: string
          recipient?: string | null
          subject?: string | null
          updated_at?: string
          user_id?: string
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
      "Topics(TOP)": {
        Row: {
          descriptions: string | null
          id_topic: string
          topic_name: string
        }
        Insert: {
          descriptions?: string | null
          id_topic: string
          topic_name: string
        }
        Update: {
          descriptions?: string | null
          id_topic?: string
          topic_name?: string
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
      university_media: {
        Row: {
          created_at: string
          id: string
          image_url: string
          likes_count: number
          type: string
          university_id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          likes_count?: number
          type: string
          university_id: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          likes_count?: number
          type?: string
          university_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "university_media_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "Universities(U)"
            referencedColumns: ["uuid"]
          },
        ]
      }
      university_media_likes: {
        Row: {
          created_at: string
          id: string
          media_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "university_media_likes_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "university_media"
            referencedColumns: ["id"]
          },
        ]
      }
      user_documents: {
        Row: {
          created_at: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          name?: string
          user_id?: string
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
      "Users(US)": {
        Row: {
          background_theme: string | null
          background_theme_mode: string | null
          birthday: string | null
          country: string | null
          created_at: string
          display_compact: boolean | null
          display_items_per_page: number | null
          email: string
          email_public: boolean | null
          flashcard_color_style: string | null
          id: string
          language_preference: string | null
          notification_agreements: boolean | null
          notification_email: boolean | null
          notification_reviews: boolean | null
          profile_photo_url: string | null
          student_level: string | null
          university_id: string | null
          updated_at: string
          username: string
        }
        Insert: {
          background_theme?: string | null
          background_theme_mode?: string | null
          birthday?: string | null
          country?: string | null
          created_at?: string
          display_compact?: boolean | null
          display_items_per_page?: number | null
          email: string
          email_public?: boolean | null
          flashcard_color_style?: string | null
          id?: string
          language_preference?: string | null
          notification_agreements?: boolean | null
          notification_email?: boolean | null
          notification_reviews?: boolean | null
          profile_photo_url?: string | null
          student_level?: string | null
          university_id?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          background_theme?: string | null
          background_theme_mode?: string | null
          birthday?: string | null
          country?: string | null
          created_at?: string
          display_compact?: boolean | null
          display_items_per_page?: number | null
          email?: string
          email_public?: boolean | null
          flashcard_color_style?: string | null
          id?: string
          language_preference?: string | null
          notification_agreements?: boolean | null
          notification_email?: boolean | null
          notification_reviews?: boolean | null
          profile_photo_url?: string | null
          student_level?: string | null
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
