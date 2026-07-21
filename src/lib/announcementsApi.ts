import api from './api'

export interface AnnouncementDTO {
  id: number
  titulo: string
  mensaje: string
  tipo: string
  seccion_id: number | null
  fecha_creacion: string
}

export async function listAnnouncements(seccionId?: number): Promise<AnnouncementDTO[]> {
  const res = await api.get('/api/v1/announcements/', { params: seccionId ? { seccion_id: seccionId } : {} })
  return res.data
}

export async function createAnnouncement(payload: { titulo: string, mensaje: string, tipo: string, seccion_id?: number }) {
  const res = await api.post('/api/v1/announcements/', payload)
  return res.data
}
