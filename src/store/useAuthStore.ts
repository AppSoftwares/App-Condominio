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
  initialize: () => () => void
}

let authListenerSubscription: { unsubscribe: () => void } | null = null

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
        if (authListenerSubscription) {
          console.log('Auth Store already initialized, skipping...')
          return () => {}
        }

        console.log('Initializing Auth Store...')

        const syncSession = async () => {
          try {
            // First, try to get the current session
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
              console.error('Supabase session error:', error)
              set({ authReady: true })
              return
            }

            if (session?.user) {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('id, email, first_name, last_name, role, avatar_url, residential_cluster, house_number, etapa')
                .eq('id', session.user.id)
                .maybeSingle()

              if (profile && !profileError) {
                set({ user: profile as UserProfile, authReady: true })
              } else {
                set({ authReady: true })
              }
            } else {
              set({ authReady: true })
            }
          } catch (err) {
            console.error('Critical error in syncSession:', err)
            set({ authReady: true })
          }
        }

        syncSession()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state change event:', event)

          if (event === 'SIGNED_OUT') {
            set({ user: null, authReady: true })
          } else if (session?.user) {
            try {
              const { data: profile } = await supabase
                .from('profiles')
                .select('id, email, first_name, last_name, role, avatar_url, residential_cluster, house_number, etapa')
                .eq('id', session.user.id)
                .maybeSingle()

              if (profile) {
                set({ user: profile as UserProfile, authReady: true })
              }
            } catch (err) {
              console.warn('Error refreshing profile on auth change:', err)
            }
          }
        })

        authListenerSubscription = subscription

        return () => {
          if (authListenerSubscription) {
            authListenerSubscription.unsubscribe()
            authListenerSubscription = null
          }
        }
      }
    }),
    {
      name: 'auth-storage-v6',
      storage: createJSONStorage(() => capacitorStorage),
      partialize: (state) => ({ user: state.user, whitelist: state.whitelist })
    }
  )
)
