import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * REGLAS DE SEGURIDAD (RLS) RECOMENDADAS:
 * 1. profile: select allowed for auth.uid() == user_id, update allowed for auth.uid() == user_id.
 * 2. lessons: select public if is_published = true.
 * 3. audit_logs: select only for is_super_admin = true.
 */
