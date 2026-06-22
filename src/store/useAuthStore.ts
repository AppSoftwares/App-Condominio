import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'

export type UserRole = 'resident' | 'admin' | 'guard' | 'superadmin'

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  avatar_url?: string
  residential_cluster?: string
  house_number?: string
  etapa?: string
}

interface AuthState {
  user: UserProfile | null
  whitelist: any[]
  setUser: (user: UserProfile | null) => void
  setWhitelist: (list: any[]) => void
  updateAvatar: (url: string) => void
  signOut: () => Promise<void>
  initialize: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      whitelist: [
        // ... (se mantienen los datos existentes para compatibilidad)
      ],
      setUser: (user) => set({ user }),
      setWhitelist: (list) => set({ whitelist: list }),
      updateAvatar: (url) => set((state) => ({
        user: state.user ? { ...state.user, avatar_url: url } : null
      })),
      signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null })
      },
      initialize: () => {
        // Escuchar cambios de sesión de Supabase
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            // Aquí podrías cargar el perfil extendido desde tu tabla 'profiles'
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (profile) {
              set({ user: profile as UserProfile })
            }
          } else {
            set({ user: null })
          }
        })
      }
    }),
    { name: 'auth-storage-v2' }
  )
)
