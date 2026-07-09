// Creado por Jesús Pirela.
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = ((import.meta as any).env.VITE_SUPABASE_URL || 'https://ztndyymxsgzqfzzlthdr.supabase.co').trim()
const supabaseAnonKey = ((import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_og7i1GhdjGujLKOPMCAhQA_Y2XQYj9C').trim()

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Faltan las variables de entorno de Supabase.')
}

export const supabase = createClient(supabaseUrl || 'https://example.supabase.co', supabaseAnonKey || 'public-anon-key')
