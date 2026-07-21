import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import { Preferences } from '@capacitor/preferences'
import { Device } from '@capacitor/device'
import { UAParser } from 'ua-parser-js'

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
  biometricsEnabled: boolean
  mfaRequired: boolean
  setUser: (user: UserProfile | null) => void
  setWhitelist: (list: any[]) => void
  setAuthReady: (ready: boolean) => void
  setBiometricsEnabled: (enabled: boolean) => void
  setMfaRequired: (required: boolean) => void
  updateAvatar: (url: string) => Promise<void>
  signOut: () => Promise<void>
  initialize: () => () => void
  sync: () => Promise<void>
}

let authListenerSubscription: { unsubscribe: () => void } | null = null

async function registerCurrentDevice() {
  try {
    const info = await Device.getInfo()
    const id = await Device.getId()

    let deviceName = `${info.manufacturer || ''} ${info.model || info.platform}`.trim()

    if (info.platform === 'web') {
      const parser = new UAParser(window.navigator.userAgent)
      const browser = parser.getBrowser()
      const os = parser.getOS()
      deviceName = `${browser.name || 'Navegador'} en ${os.name || 'Web'}`
    }

    await supabase.rpc('rpc_register_session', {
      p_device_name: deviceName || 'Dispositivo desconocido',
      p_device_id: id.identifier,
      p_platform: info.platform,
    })
  } catch (err) {
    console.warn('Error al registrar dispositivo:', err)
  }
}

async function checkMfaStatus(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (error) throw error
    // Si el usuario tiene un factor verificado (aal2 disponible) pero está en aal1, se requiere MFA
    return data.currentLevel === 'aal1' && data.nextLevel === 'aal2'
  } catch (err) {
    console.error('Error verificando MFA:', err)
    return false
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      whitelist: [],
      authReady: false,
      biometricsEnabled: false,
      mfaRequired: false,
      setUser: (user) => set({ user }),
      setWhitelist: (list) => set({ whitelist: list }),
      setAuthReady: (ready) => set({ authReady: ready }),
      setBiometricsEnabled: (enabled) => set({ biometricsEnabled: enabled }),
      setMfaRequired: (required) => set({ mfaRequired: required }),
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
        try {
          await supabase.auth.signOut()
        } catch (err) {
          console.error('Error during Supabase signOut:', err)
        } finally {
          set({ user: null })
        }
      },
      sync: async () => {
        const timeoutId = setTimeout(() => {
          if (!get().authReady) {
            console.warn('Auth sync timeout reached, forcing ready state')
            set({ authReady: true })
          }
        }, 5000)

        try {
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
              const mfaNeeded = await checkMfaStatus()
              set({ user: profile as UserProfile, authReady: true, mfaRequired: mfaNeeded })
              if (!mfaNeeded) registerCurrentDevice() // Registrar solo si no está bloqueado por MFA
            } else {
              set({ authReady: true })
            }
          } else {
            set({ user: null, authReady: true })
          }
        } catch (err) {
          console.error('Critical error in syncSession:', err)
          set({ authReady: true })
        } finally {
          clearTimeout(timeoutId)
        }
      },
      initialize: () => {
        if (authListenerSubscription) {
          console.log('Auth Store already initialized, skipping...')
          if (!get().authReady) set({ authReady: true })
          return () => {}
        }

        console.log('Initializing Auth Store...')
        get().sync()

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
                const mfaNeeded = await checkMfaStatus()
                set({ user: profile as UserProfile, authReady: true, mfaRequired: mfaNeeded })
                if (event === 'SIGNED_IN' && !mfaNeeded) registerCurrentDevice()
              } else {
                set({ authReady: true })
              }
            } catch (err) {
              console.warn('Error refreshing profile on auth change:', err)
              set({ authReady: true })
            }
          } else {
            set({ authReady: true })
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
      onRehydrateStorage: (state) => {
        return (hydratedState, error) => {
          if (error) {
            console.error('Error during hydration:', error)
            state.setAuthReady(true)
          } else if (hydratedState?.user) {
            // Optimistically set ready if we have a persisted user
            hydratedState.setAuthReady(true)
          }
        }
      },
      partialize: (state) => ({
        user: state.user,
        whitelist: state.whitelist,
        biometricsEnabled: state.biometricsEnabled
      })
    }
  )
)
