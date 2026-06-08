import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Poll {
  id: string
  title: string
  description: string
  options: { text: string; votes: number }[]
  totalVotes: number
  endDate: string
  priority: 'Baja' | 'Alta'
  votedHouses: string[] // Lista de números de casa que ya votaron
}

export interface Announcement {
  id: string
  title: string
  date: string
  type: 'PDF' | 'Doc' | 'Minuta'
  size?: string
}

export interface Incident {
  id: string
  category: string
  location: string
  description: string
  date: string
  status: 'Pendiente' | 'En revisión' | 'Resuelto'
  houseNumber: string
}

interface CommunityState {
  polls: Poll[]
  announcements: Announcement[]
  incidents: Incident[]
  addPoll: (poll: Poll) => void
  addAnnouncement: (ann: Announcement) => void
  addIncident: (incident: Incident) => void
  voteInPoll: (pollId: string, optionIndex: number, houseNumber: string) => boolean // Retorna true si pudo votar
}

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set, get) => ({
      polls: [
        {
          id: '1',
          title: 'Nuevo color de fachada',
          description: 'Seleccione la paleta cromática para la renovación exterior de los edificios Fase 1.',
          priority: 'Alta',
          endDate: '2024-10-15',
          totalVotes: 100,
          votedHouses: [],
          options: [
            { text: 'Verde Musgo & Piedra', votes: 64 },
            { text: 'Arena & Ochre', votes: 36 }
          ]
        }
      ],
      announcements: [
        { id: '1', title: 'Informe de Mantenimiento Trimestral Q3', date: 'Hace 2 días', type: 'PDF', size: '1.2MB' },
        { id: '2', title: 'Nuevos Protocolos de Seguridad', date: 'Publicado el 12 Oct', type: 'Doc' },
        { id: '3', title: 'Minuta Asamblea General de Propietarios', date: 'Publicado el 5 Oct', type: 'Minuta' }
      ],
      incidents: [
        { id: '1', category: 'Ruidos', location: 'Casa 14-05', description: 'Música alta a la 1:00 AM.', date: 'Hace 10 min', status: 'Pendiente', houseNumber: '14-05' }
      ],
      addPoll: (poll) => set((state) => ({ polls: [poll, ...state.polls] })),
      addAnnouncement: (ann) => set((state) => ({ announcements: [ann, ...state.announcements] })),
      addIncident: (incident) => set((state) => ({ incidents: [incident, ...state.incidents] })),
      voteInPoll: (pollId, optionIndex, houseNumber) => {
        const state = get()
        const poll = state.polls.find(p => p.id === pollId)

        if (!poll || poll.votedHouses.includes(houseNumber)) {
          return false
        }

        set((state) => ({
          polls: state.polls.map(p => {
            if (p.id === pollId) {
              const newOptions = [...p.options]
              newOptions[optionIndex].votes += 1
              return {
                ...p,
                options: newOptions,
                totalVotes: p.totalVotes + 1,
                votedHouses: [...p.votedHouses, houseNumber]
              }
            }
            return p
          })
        }))
        return true
      }
    }),
    { name: 'community-storage' }
  )
)
