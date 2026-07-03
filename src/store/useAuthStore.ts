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
  updateAvatar: (url: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      whitelist: [],
      setUser: (user) => set({ user }),
      setWhitelist: (list) => set({ whitelist: list }),
      updateAvatar: async (url) => {
        const currentUser = get().user
        if (!currentUser) return

        try {
          // 1. Actualizar localmente para feedback inmediato
          set((state) => ({
            user: state.user ? { ...state.user, avatar_url: url } : null
          }))

          // 2. Persistir en la base de datos de Supabase
          const { error } = await supabase
            .from('profiles')
            .update({ avatar_url: url })
            .eq('id', currentUser.id)

          if (error) throw error
        } catch (err) {
          console.error('Error al guardar el avatar:', err)
        }
      },
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
    { name: 'auth-storage-v6' }
  )
)
