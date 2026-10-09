import api from './api'

export interface VotingDTO {
  id: number
  titulo: string
  descripcion: string
  fecha_inicio: string
  fecha_fin: string
  activa: boolean
  monto_propuesto: number | null
}

export interface VotingResults {
  favor: number
  contra: number
}

export async function listVotings(): Promise<VotingDTO[]> {
  const res = await api.get('/api/v1/votings/')
  return res.data
}

export async function createVoting(payload: { titulo: string, descripcion: string, fecha_fin: string, monto_propuesto?: number }) {
  const res = await api.post('/api/v1/votings/', payload)
  return res.data
}

export async function castVote(votingId: number, opcion: 'favor' | 'contra') {
  const res = await api.post(`/api/v1/votings/${votingId}/vote`, null, { params: { opcion } })
  return res.data
}

export async function getVotingResults(votingId: number): Promise<VotingResults> {
  const res = await api.get(`/api/v1/votings/${votingId}/results`)
  return res.data
}
