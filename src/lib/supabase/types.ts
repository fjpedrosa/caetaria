/**
 * Supabase Database Types
 *
 * Auto-generated TypeScript types for the Supabase database schema.
 * These types ensure type safety when interacting with the database.
 *
 * To regenerate these types, run:
 * ```bash
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts
 * ```
 *
 * Or with local development:
 * ```bash
 * npx supabase gen types typescript --local > src/lib/supabase/types.ts
 * ```
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id: string
          email: string
          phone_number: string | null
          company_name: string | null
          first_name: string | null
          last_name: string | null
          source: string
          status: string
          created_at: string
          updated_at: string
          notes: string | null
          interested_features: string[] | null
        }
        Insert: {
          id?: string
          email: string
          phone_number?: string | null
          company_name?: string | null
          first_name?: string | null
          last_name?: string | null
          source: string
          status?: string
          created_at?: string
          updated_at?: string
          notes?: string | null
          interested_features?: string[] | null
        }
        Update: {
          id?: string
          email?: string
          phone_number?: string | null
          company_name?: string | null
          first_name?: string | null
          last_name?: string | null
          source?: string
          status?: string
          created_at?: string
          updated_at?: string
          notes?: string | null
          interested_features?: string[] | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          id: string
          event_name: string
          event_data: Json | null
          user_id: string | null
          session_id: string | null
          page_url: string | null
          user_agent: string | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_name: string
          event_data?: Json | null
          user_id?: string | null
          session_id?: string | null
          page_url?: string | null
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_name?: string
          event_data?: Json | null
          user_id?: string | null
          session_id?: string | null
          page_url?: string | null
          user_agent?: string | null
          ip_address?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
          phone_number: string | null
          company_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          phone_number?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          avatar_url?: string | null
          phone_number?: string | null
          company_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'user_profiles_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      whatsapp_integrations: {
        Row: {
          id: string
          user_id: string
          phone_number: string
          phone_number_id: string
          business_account_id: string
          access_token: string
          webhook_verify_token: string
          webhook_url: string | null
          status: string
          configuration: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          phone_number: string
          phone_number_id: string
          business_account_id: string
          access_token: string
          webhook_verify_token: string
          webhook_url?: string | null
          status?: string
          configuration?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          phone_number?: string
          phone_number_id?: string
          business_account_id?: string
          access_token?: string
          webhook_verify_token?: string
          webhook_url?: string | null
          status?: string
          configuration?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'whatsapp_integrations_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      bot_configurations: {
        Row: {
          id: string
          user_id: string
          integration_id: string
          name: string
          description: string | null
          welcome_message: string
          fallback_message: string
          business_hours: Json | null
          auto_reply_enabled: boolean
          ai_enabled: boolean
          ai_model: string | null
          ai_personality: string | null
          training_data: Json | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          integration_id: string
          name: string
          description?: string | null
          welcome_message: string
          fallback_message: string
          business_hours?: Json | null
          auto_reply_enabled?: boolean
          ai_enabled?: boolean
          ai_model?: string | null
          ai_personality?: string | null
          training_data?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          integration_id?: string
          name?: string
          description?: string | null
          welcome_message?: string
          fallback_message?: string
          business_hours?: Json | null
          auto_reply_enabled?: boolean
          ai_enabled?: boolean
          ai_model?: string | null
          ai_personality?: string | null
          training_data?: Json | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bot_configurations_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bot_configurations_integration_id_fkey'
            columns: ['integration_id']
            referencedRelation: 'whatsapp_integrations'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      lead_status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'
      lead_source: 'landing_page' | 'referral' | 'social_media' | 'email' | 'advertisement' | 'other'
      integration_status: 'pending' | 'active' | 'suspended' | 'error'
      bot_status: 'draft' | 'active' | 'paused' | 'error'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for common operations
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database['public']['Tables'] & Database['public']['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database['public']['Tables'] &
      Database['public']['Views'])
  ? (Database['public']['Tables'] &
      Database['public']['Views'])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database['public']['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
  ? Database['public']['Enums'][PublicEnumNameOrOptions]
  : never

// Common type aliases for easier usage
export type Lead = Tables<'leads'>
export type LeadInsert = TablesInsert<'leads'>
export type LeadUpdate = TablesUpdate<'leads'>

export type AnalyticsEvent = Tables<'analytics_events'>
export type AnalyticsEventInsert = TablesInsert<'analytics_events'>
export type AnalyticsEventUpdate = TablesUpdate<'analytics_events'>

export type UserProfile = Tables<'user_profiles'>
export type UserProfileInsert = TablesInsert<'user_profiles'>
export type UserProfileUpdate = TablesUpdate<'user_profiles'>

export type WhatsAppIntegration = Tables<'whatsapp_integrations'>
export type WhatsAppIntegrationInsert = TablesInsert<'whatsapp_integrations'>
export type WhatsAppIntegrationUpdate = TablesUpdate<'whatsapp_integrations'>

export type BotConfiguration = Tables<'bot_configurations'>
export type BotConfigurationInsert = TablesInsert<'bot_configurations'>
export type BotConfigurationUpdate = TablesUpdate<'bot_configurations'>

export type LeadStatus = Enums<'lead_status'>
export type LeadSource = Enums<'lead_source'>
export type IntegrationStatus = Enums<'integration_status'>
export type BotStatus = Enums<'bot_status'>

// Auth types (from Supabase Auth) - Use Supabase's native types
import type { Session,User } from '@supabase/supabase-js'

export type AuthUser = User
export type AuthSession = Session

// Utility types for form handling
export type CreateLeadForm = Omit<LeadInsert, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type UpdateLeadForm = Partial<Omit<LeadUpdate, 'id' | 'created_at'>> & {
  updated_at?: string
}