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
  setUser: (user: UserProfile | null) => void
  updateAvatar: (url: string) => void
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
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
