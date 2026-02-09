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
      bank_statements: {
        Row: {
          account_number: string | null
          bank_name: string
          created_at: string
          file_name: string
          id: string
          imported_at: string
          statement_period_end: string | null
          statement_period_start: string | null
          total_inflow: number | null
          total_outflow: number | null
          transaction_count: number | null
          user_id: string
        }
        Insert: {
          account_number?: string | null
          bank_name: string
          created_at?: string
          file_name: string
          id?: string
          imported_at?: string
          statement_period_end?: string | null
          statement_period_start?: string | null
          total_inflow?: number | null
          total_outflow?: number | null
          transaction_count?: number | null
          user_id: string
        }
        Update: {
          account_number?: string | null
          bank_name?: string
          created_at?: string
          file_name?: string
          id?: string
          imported_at?: string
          statement_period_end?: string | null
          statement_period_start?: string | null
          total_inflow?: number | null
          total_outflow?: number | null
          transaction_count?: number | null
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          name: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      chit_fund_history: {
        Row: {
          created_at: string
          family_id: string | null
          id: string
          month_number: number
          user_id: string | null
          winner_member_id: string | null
          winning_bid: number
        }
        Insert: {
          created_at?: string
          family_id?: string | null
          id?: string
          month_number: number
          user_id?: string | null
          winner_member_id?: string | null
          winning_bid: number
        }
        Update: {
          created_at?: string
          family_id?: string | null
          id?: string
          month_number?: number
          user_id?: string | null
          winner_member_id?: string | null
          winning_bid?: number
        }
        Relationships: [
          {
            foreignKeyName: "chit_fund_history_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chit_fund_history_winner_member_id_fkey"
            columns: ["winner_member_id"]
            isOneToOne: false
            referencedRelation: "chit_fund_members"
            referencedColumns: ["id"]
          },
        ]
      }
      chit_fund_members: {
        Row: {
          created_at: string
          family_id: string | null
          id: string
          member_index: number
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          family_id?: string | null
          id?: string
          member_index: number
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          family_id?: string | null
          id?: string
          member_index?: number
          name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chit_fund_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      chit_fund_payments: {
        Row: {
          created_at: string
          family_id: string | null
          id: string
          is_paid: boolean
          member_id: string
          month_number: number
          paid_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          family_id?: string | null
          id?: string
          is_paid?: boolean
          member_id: string
          month_number: number
          paid_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          family_id?: string | null
          id?: string
          is_paid?: boolean
          member_id?: string
          month_number?: number
          paid_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chit_fund_payments_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chit_fund_payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "chit_fund_members"
            referencedColumns: ["id"]
          },
        ]
      }
      chit_fund_settings: {
        Row: {
          commission_rate: number
          created_at: string
          created_by: string | null
          family_id: string | null
          id: string
          monthly_contribution: number
          total_members: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          commission_rate?: number
          created_at?: string
          created_by?: string | null
          family_id?: string | null
          id?: string
          monthly_contribution?: number
          total_members?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          commission_rate?: number
          created_at?: string
          created_by?: string | null
          family_id?: string | null
          id?: string
          monthly_contribution?: number
          total_members?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chit_fund_settings_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      family_members: {
        Row: {
          family_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          family_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          family_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_members_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      goal_contributions: {
        Row: {
          amount: number
          contribution_date: string
          created_at: string
          goal_id: string
          id: string
          note: string | null
          source: string
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          contribution_date?: string
          created_at?: string
          goal_id: string
          id?: string
          note?: string | null
          source?: string
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          contribution_date?: string
          created_at?: string
          goal_id?: string
          id?: string
          note?: string | null
          source?: string
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "household_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_contributions_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      household_goals: {
        Row: {
          auto_category: string | null
          auto_percentage: number | null
          category: string | null
          created_at: string
          current_amount: number
          id: string
          is_active: boolean
          name: string
          target_amount: number
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_category?: string | null
          auto_percentage?: number | null
          category?: string | null
          created_at?: string
          current_amount?: number
          id?: string
          is_active?: boolean
          name: string
          target_amount?: number
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_category?: string | null
          auto_percentage?: number | null
          category?: string | null
          created_at?: string
          current_amount?: number
          id?: string
          is_active?: boolean
          name?: string
          target_amount?: number
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lent_borrowed_records: {
        Row: {
          amount: number
          created_at: string
          date: string
          id: string
          linked_transaction_id: string | null
          notes: string | null
          person_name: string
          return_date: string | null
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          id?: string
          linked_transaction_id?: string | null
          notes?: string | null
          person_name: string
          return_date?: string | null
          status: string
          type: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          id?: string
          linked_transaction_id?: string | null
          notes?: string | null
          person_name?: string
          return_date?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recurring_payments: {
        Row: {
          amount: number
          cadence: string
          category: string | null
          confidence: string
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean
          last_paid_date: string | null
          linked_transaction_id: string | null
          name: string
          next_due_date: string
          notes: string | null
          start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          cadence?: string
          category?: string | null
          confidence?: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          last_paid_date?: string | null
          linked_transaction_id?: string | null
          name: string
          next_due_date: string
          notes?: string | null
          start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          cadence?: string
          category?: string | null
          confidence?: string
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean
          last_paid_date?: string | null
          linked_transaction_id?: string | null
          name?: string
          next_due_date?: string
          notes?: string | null
          start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_payments_linked_transaction_id_fkey"
            columns: ["linked_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number | null
          category: string | null
          created_at: string
          description: string
          id: string
          merchant: string | null
          reference_number: string | null
          statement_id: string | null
          transaction_date: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after?: number | null
          category?: string | null
          created_at?: string
          description: string
          id?: string
          merchant?: string | null
          reference_number?: string | null
          statement_id?: string | null
          transaction_date: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          merchant?: string | null
          reference_number?: string | null
          statement_id?: string | null
          transaction_date?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_statement_id_fkey"
            columns: ["statement_id"]
            isOneToOne: false
            referencedRelation: "bank_statements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_financial_profiles: {
        Row: {
          created_at: string
          emergency_fund_goal_months: number | null
          manual_investment_amount: number | null
          manual_monthly_expenses: number | null
          savings_balance: number | null
          updated_at: string
          use_manual_expenses: boolean | null
          use_manual_investment: boolean | null
          user_id: string
        }
        Insert: {
          created_at?: string
          emergency_fund_goal_months?: number | null
          manual_investment_amount?: number | null
          manual_monthly_expenses?: number | null
          savings_balance?: number | null
          updated_at?: string
          use_manual_expenses?: boolean | null
          use_manual_investment?: boolean | null
          user_id: string
        }
        Update: {
          created_at?: string
          emergency_fund_goal_months?: number | null
          manual_investment_amount?: number | null
          manual_monthly_expenses?: number | null
          savings_balance?: number | null
          updated_at?: string
          use_manual_expenses?: boolean | null
          use_manual_investment?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_family_ids: { Args: never; Returns: string[] }
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
