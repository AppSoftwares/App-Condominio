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
      polls: [],
      announcements: [],
      incidents: [],
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
