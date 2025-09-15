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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          created_at: string | null
          description: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          is_active: boolean | null
          storage_path: string
          tags: string[] | null
          updated_at: string | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          is_active?: boolean | null
          storage_path: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          is_active?: boolean | null
          storage_path?: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      boq_items: {
        Row: {
          code: string
          created_at: string | null
          description: string
          description_ar: string | null
          id: string
          level: number | null
          parent_id: string | null
          quantity: number
          total_amount: number | null
          unit: string
          unit_ar: string | null
          unit_rate: number
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description: string
          description_ar?: string | null
          id?: string
          level?: number | null
          parent_id?: string | null
          quantity?: number
          total_amount?: number | null
          unit: string
          unit_ar?: string | null
          unit_rate?: number
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string
          description_ar?: string | null
          id?: string
          level?: number | null
          parent_id?: string | null
          quantity?: number
          total_amount?: number | null
          unit?: string
          unit_ar?: string | null
          unit_rate?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "boq_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "boq_items"
            referencedColumns: ["id"]
          },
        ]
      }
      breakdown_items: {
        Row: {
          boq_item_id: string
          created_at: string | null
          description: string | null
          description_ar: string | null
          id: string
          is_leaf: boolean | null
          keyword: string | null
          keyword_ar: string | null
          parent_breakdown_id: string | null
          percentage: number | null
          quantity: number | null
          unit_rate: number | null
          updated_at: string | null
          value: number | null
        }
        Insert: {
          boq_item_id: string
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string
          is_leaf?: boolean | null
          keyword?: string | null
          keyword_ar?: string | null
          parent_breakdown_id?: string | null
          percentage?: number | null
          quantity?: number | null
          unit_rate?: number | null
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          boq_item_id?: string
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string
          is_leaf?: boolean | null
          keyword?: string | null
          keyword_ar?: string | null
          parent_breakdown_id?: string | null
          percentage?: number | null
          quantity?: number | null
          unit_rate?: number | null
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "breakdown_items_boq_item_id_fkey"
            columns: ["boq_item_id"]
            isOneToOne: false
            referencedRelation: "boq_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "breakdown_items_parent_breakdown_id_fkey"
            columns: ["parent_breakdown_id"]
            isOneToOne: false
            referencedRelation: "breakdown_items"
            referencedColumns: ["id"]
          },
        ]
      }
      contractors: {
        Row: {
          company: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      engineers: {
        Row: {
          created_at: string | null
          department: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          specialization: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          specialization?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          specialization?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          active_role: Database["public"]["Enums"]["app_role"] | null
          created_at: string | null
          department: string | null
          full_name: string | null
          id: string
          password: string | null
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          active_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string | null
          department?: string | null
          full_name?: string | null
          id: string
          password?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          active_role?: Database["public"]["Enums"]["app_role"] | null
          created_at?: string | null
          department?: string | null
          full_name?: string | null
          id?: string
          password?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          is_active: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_active?: boolean | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wirs: {
        Row: {
          attachments: string[] | null
          boq_item_id: string
          calculated_amount: number | null
          calculation_equation: string | null
          contractor: string
          created_at: string | null
          description: string
          description_ar: string | null
          diameter_of_line: number
          engineer: string
          id: string
          length_of_line: number
          line: string | null
          line_no: string
          linked_boq_items: string[] | null
          manhole_from: string | null
          manhole_to: string | null
          original_wir_id: string | null
          parent_wir_id: string | null
          received_date: string | null
          region: string
          result: Database["public"]["Enums"]["wir_result"] | null
          revision_number: number | null
          road: string | null
          selected_breakdown_items: string[] | null
          start_task_on_site: string | null
          status: Database["public"]["Enums"]["wir_status"]
          status_conditions: string | null
          submittal_date: string
          type_of_rock: string | null
          updated_at: string | null
          value: number
          wir_number: string
          zone: string | null
        }
        Insert: {
          attachments?: string[] | null
          boq_item_id: string
          calculated_amount?: number | null
          calculation_equation?: string | null
          contractor: string
          created_at?: string | null
          description: string
          description_ar?: string | null
          diameter_of_line: number
          engineer: string
          id?: string
          length_of_line: number
          line?: string | null
          line_no: string
          linked_boq_items?: string[] | null
          manhole_from?: string | null
          manhole_to?: string | null
          original_wir_id?: string | null
          parent_wir_id?: string | null
          received_date?: string | null
          region: string
          result?: Database["public"]["Enums"]["wir_result"] | null
          revision_number?: number | null
          road?: string | null
          selected_breakdown_items?: string[] | null
          start_task_on_site?: string | null
          status?: Database["public"]["Enums"]["wir_status"]
          status_conditions?: string | null
          submittal_date: string
          type_of_rock?: string | null
          updated_at?: string | null
          value: number
          wir_number: string
          zone?: string | null
        }
        Update: {
          attachments?: string[] | null
          boq_item_id?: string
          calculated_amount?: number | null
          calculation_equation?: string | null
          contractor?: string
          created_at?: string | null
          description?: string
          description_ar?: string | null
          diameter_of_line?: number
          engineer?: string
          id?: string
          length_of_line?: number
          line?: string | null
          line_no?: string
          linked_boq_items?: string[] | null
          manhole_from?: string | null
          manhole_to?: string | null
          original_wir_id?: string | null
          parent_wir_id?: string | null
          received_date?: string | null
          region?: string
          result?: Database["public"]["Enums"]["wir_result"] | null
          revision_number?: number | null
          road?: string | null
          selected_breakdown_items?: string[] | null
          start_task_on_site?: string | null
          status?: Database["public"]["Enums"]["wir_status"]
          status_conditions?: string | null
          submittal_date?: string
          type_of_rock?: string | null
          updated_at?: string | null
          value?: number
          wir_number?: string
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wirs_boq_item_id_fkey"
            columns: ["boq_item_id"]
            isOneToOne: false
            referencedRelation: "boq_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wirs_original_wir_id_fkey"
            columns: ["original_wir_id"]
            isOneToOne: false
            referencedRelation: "wirs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wirs_parent_wir_id_fkey"
            columns: ["parent_wir_id"]
            isOneToOne: false
            referencedRelation: "wirs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_roles: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      switch_user_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "editor" | "viewer" | "data_entry" | "management"
      wir_result: "A" | "B" | "C"
      wir_status: "submitted" | "completed"
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
      app_role: ["admin", "editor", "viewer", "data_entry", "management"],
      wir_result: ["A", "B", "C"],
      wir_status: ["submitted", "completed"],
    },
  },
} as const
