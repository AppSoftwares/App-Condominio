import { supabase } from '../lib/supabase'

export interface AnnouncementDTO {
  id: string
  titulo: string
  mensaje: string
  tipo: string
  seccion_id: number | null
  fecha_creacion: string
  residential_cluster?: string | null
  metadata?: any
  created_by?: string | null
  push_recipients?: number
}

export async function listAnnouncements(seccionId?: number): Promise<AnnouncementDTO[]> {
  try {
    let query = supabase
      .from('announcements')
      .select('*')
      .order('fecha_creacion', { ascending: false })

    if (seccionId !== undefined) {
      query = query.eq('seccion_id', seccionId)
    }

    const { data, error } = await query
    if (error) {
      console.warn('Error fetching announcements from Supabase:', error.message)
      return []
    }
    return data || []
  } catch (err) {
    console.error('Error in listAnnouncements:', err)
    return []
  }
}

export async function createAnnouncement(payload: { titulo: string, mensaje: string, tipo: string, seccion_id?: number, residential_cluster?: string }) {
  const { data, error } = await supabase
    .from('announcements')
    .insert([payload])
    .select()
    .single()

  if (error) throw error
  return data
}
