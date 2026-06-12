import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'resident' | 'admin' | 'guard'

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  avatar_url?: string
  residential_cluster?: string
  house_number?: string
}

interface AuthState {
  user: UserProfile | null
  whitelist: any[]
  setUser: (user: UserProfile | null) => void
  setWhitelist: (list: any[]) => void
  updateAvatar: (url: string) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      whitelist: [
        {
          id: 'initial-admin',
          name: 'JESÚS PIRELA',
          email: 'jess.pirela@gmail.com',
          role: 'Administrador',
          house_number: '14-28',
          password: 'JESS.HUERTAS.123'
        },
        {
          id: 'initial-resident',
          name: 'CARLOS PIRELA',
          email: 'ofi.pirela@gmail.com',
          role: 'Residente',
          house_number: '14-27',
          password: 'CARLOS.HUERTAS.123'
        }
      ],
      setUser: (user) => set({ user }),
      setWhitelist: (list) => set({ whitelist: list }),
      updateAvatar: (url) => set((state) => ({
        user: state.user ? { ...state.user, avatar_url: url } : null
      })),
      signOut: async () => {
        set({ user: null })
      },
    }),
    { name: 'auth-storage' }
  )
)
