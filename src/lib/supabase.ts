import { createClient } from '@supabase/supabase-js'

// Estas variáveis são configuradas no painel da Vercel (Settings → Environment Variables)
// e no painel do Supabase (Project Settings → API)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export type Database = {
  public: {
    Tables: {
      assessments: {
        Row: {
          id: string
          child_id: string
          user_id: string
          student_info: Record<string, string>
          responses: Record<string, string | null>
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['assessments']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['assessments']['Insert']>
      }
      announcements: {
        Row: {
          id: string
          title: string
          body: string
          created_at: string
          created_by: string
        }
        Insert: Omit<Database['public']['Tables']['announcements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['announcements']['Insert']>
      }
    }
  }
}
