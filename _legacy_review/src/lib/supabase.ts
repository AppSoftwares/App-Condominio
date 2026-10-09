// Creado por Jesús Pirela.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = ((import.meta as any).env.VITE_SUPABASE_URL || '').trim()
const supabaseAnonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || '').trim()

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Faltan las variables de entorno de Supabase.')
}

export const supabase = createClient(supabaseUrl || 'https://example.supabase.co', supabaseAnonKey || 'public-anon-key')
