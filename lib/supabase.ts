import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: string
          created_at: string
          owner_name: string
          business_name: string
          phone: string
          language: 'en' | 'zu' | 'xh' | 'st' | 'af'
          business_type: string
          tier: 'free' | 'kasibooks' | 'kasicomply' | 'kasistore' | 'full'
          status: 'trial' | 'active' | 'suspended' | 'churned'
          trial_ends_at: string | null
          onboarded_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['businesses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>
      }
      transactions: {
        Row: {
          id: string
          created_at: string
          business_id: string
          type: 'income' | 'expense'
          amount: number
          description: string
          category: string
          receipt_url: string | null
          source: 'whatsapp' | 'dashboard' | 'import'
        }
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
      }
      compliance_filings: {
        Row: {
          id: string
          created_at: string
          business_id: string
          filing_type: 'paye' | 'uif' | 'sdl' | 'vat'
          period: string
          amount_due: number
          status: 'pending' | 'submitted' | 'paid' | 'overdue'
          due_date: string
          reference_number: string | null
        }
        Insert: Omit<Database['public']['Tables']['compliance_filings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['compliance_filings']['Insert']>
      }
      store_products: {
        Row: {
          id: string
          created_at: string
          business_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          in_stock: boolean
          category: string | null
        }
        Insert: Omit<Database['public']['Tables']['store_products']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['store_products']['Insert']>
      }
      credit_applications: {
        Row: {
          id: string
          created_at: string
          business_id: string
          amount_requested: number
          purpose: string
          status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'disbursed'
          partner_lender: string | null
          origination_fee: number | null
          approved_amount: number | null
          decision_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['credit_applications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['credit_applications']['Insert']>
      }
      kasi_champions: {
        Row: {
          id: string
          created_at: string
          name: string
          phone: string
          area: string
          businesses_onboarded: number
          total_commission_earned: number
          status: 'active' | 'inactive'
        }
        Insert: Omit<Database['public']['Tables']['kasi_champions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['kasi_champions']['Insert']>
      }
      whatsapp_sessions: {
        Row: {
          id: string
          created_at: string
          phone: string
          business_id: string | null
          state: string
          context: Record<string, unknown>
          last_message_at: string
        }
        Insert: Omit<Database['public']['Tables']['whatsapp_sessions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['whatsapp_sessions']['Insert']>
      }
    }
  }
}
