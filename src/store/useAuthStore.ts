import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { Preferences } from '@capacitor/preferences'

// Custom storage for Capacitor Preferences
const capacitorStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const { value } = await Preferences.get({ key: name })
    return value
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await Preferences.set({ key: name, value })
  },
  removeItem: async (name: string): Promise<void> => {
    await Preferences.remove({ key: name })
  },
}

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
  authReady: boolean
  setUser: (user: UserProfile | null) => void
  setWhitelist: (list: any[]) => void
  setAuthReady: (ready: boolean) => void
  updateAvatar: (url: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      whitelist: [],
      authReady: false,
      setUser: (user) => set({ user }),
      setWhitelist: (list) => set({ whitelist: list }),
      setAuthReady: (ready) => set({ authReady: ready }),
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
        console.log('Initializing Auth Store...')
        const syncSession = async () => {
          const storedUser = get().user
          console.log('Stored user found in persist:', storedUser?.email)

          if (!storedUser) {
             set({ authReady: false })
          } else {
             // Si hay usuario guardado, lo damos por bueno inicialmente para rapidez
             set({ authReady: true })
          }

          try {
            const { data, error } = await supabase.auth.getSession()
            if (error) {
              console.error('Error cargando sesión de Supabase:', error)
              set({ user: null, authReady: true })
              return
            }

            const session = data?.session
            if (session?.user) {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, email, first_name, last_name, role, avatar_url, residential_cluster, house_number, etapa')
                .eq('id', session.user.id)
                .single()

              if (profileError) {
                console.error('Error cargando perfil:', profileError)
                set({ user: null, authReady: true })
                return
              }

              if (profile) {
                set({ user: profile as UserProfile, authReady: true })
                return
              }
            }
          } catch (err) {
            console.error('Error al sincronizar la sesión de Supabase:', err)
          }

          set({ user: null, authReady: true })
        }

        syncSession()

        supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state change event:', event)

          if (event === 'SIGNED_OUT') {
            set({ user: null, authReady: true })
            return
          }

          if (session?.user) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('id, email, first_name, last_name, role, avatar_url, residential_cluster, house_number, etapa')
              .eq('id', session.user.id)
              .single()

            if (profileError) {
              console.error('Error cargando perfil tras cambio de sesión:', profileError)
              set({ user: null, authReady: true })
              return
            }

            if (profile) {
              set({ user: profile as UserProfile, authReady: true })
              return
            }
          }

          set({ user: null, authReady: true })
        })
      }
    }),
    {
      name: 'auth-storage-v6',
      storage: createJSONStorage(() => capacitorStorage),
      partialize: (state) => ({ user: state.user, whitelist: state.whitelist })
    }
  )
)
