import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { supabase } from '../../shared/lib/supabase'
import { Preferences } from '@capacitor/preferences'
import { Device } from '@capacitor/device'
import { UAParser } from 'ua-parser-js'
import { withTimeout } from '../bootstrap/bootstrapApp'

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

type ProfileResult =
  | { kind: 'ok'; profile: UserProfile }
  | { kind: 'not_registered' }
  | { kind: 'denied' }
  | { kind: 'transient' }

interface AuthState {
  user: UserProfile | null
  whitelist: any[]
  authReady: boolean
  biometricsEnabled: boolean
  mfaRequired: boolean
  authNotice: 'unregistered' | 'denied' | null
  authDegraded: boolean
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
let syncInFlight: Promise<void> | null = null
const AUTH_TIMEOUT_MS = 6000

async function registerCurrentDevice() {
  try {
    const id = await Device.getId()
    const info = await Device.getInfo()

    let deviceName = `${info.manufacturer || ''} ${info.model || info.platform}`.trim()

    if (info.platform === 'web') {
      const parser = new UAParser(window.navigator.userAgent)
      deviceName = `${parser.getBrowser().name || 'Navegador'} en ${parser.getOS().name || 'Web'}`
    }

    const { error } = await supabase.rpc('rpc_register_session', {
      p_device_name: deviceName || 'Dispositivo desconocido',
      p_device_id: id.identifier,
      p_platform: info.platform,
    })

    if (error) console.warn('RPC register_session error:', error.message)
  } catch (err) {
    console.error('Safe device registration failed:', err)
  }
}

async function checkMfaStatus(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (error) throw error
    return data.currentLevel === 'aal1' && data.nextLevel === 'aal2'
  } catch (err) {
    console.error('Error verificando MFA:', err)
    return false
  }
}

async function getOrCreateProfile(authUser: any): Promise<ProfileResult> {
  try {
    const userEmail = authUser.email?.toLowerCase().trim()

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', userEmail)
      .maybeSingle()

    if (error) {
      const status = (error as any).status || (error as any).code
      if (status === 401 || status === 403 || error.code === '42501' || error.code === 'PGRST301') {
        return { kind: 'denied' }
      }
      if (!navigator.onLine || /fetch|network|timeout/i.test(error.message) || (typeof status === 'number' && status >= 500)) {
        return { kind: 'transient' }
      }
      return { kind: 'denied' }
    }

    if (!profile) {
      return { kind: 'not_registered' }
    }

    if (profile.id !== authUser.id) {
      console.log('Vinculando ID de Auth con perfil existente...')
      await supabase.from('profiles').update({ id: authUser.id }).eq('email', userEmail)
    }

    const userProfile: UserProfile = {
      id: authUser.id,
      email: profile.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      role: profile.role,
      avatar_url: profile.avatar_url,
      residential_cluster: profile.residential_cluster || profile.conjunto,
      house_number: profile.house_number || profile.casa_n
    }

    return { kind: 'ok', profile: userProfile }
  } catch (err: any) {
    if (!navigator.onLine || /fetch|network|timeout/i.test(err?.message)) {
      return { kind: 'transient' }
    }
    return { kind: 'transient' }
  }
}

async function applyProfileResult(result: ProfileResult, set: any, get: any) {
  if (result.kind === 'ok') {
    const mfaNeeded = await checkMfaStatus().catch(() => false)
    set({ user: result.profile, authReady: true, mfaRequired: mfaNeeded, authNotice: null, authDegraded: false })
    if (!mfaNeeded) registerCurrentDevice()
  } else if (result.kind === 'not_registered') {
    await supabase.auth.signOut().catch(() => {})
    set({ user: null, authReady: true, authNotice: 'unregistered', authDegraded: false })
  } else if (result.kind === 'denied') {
    await supabase.auth.signOut().catch(() => {})
    set({ user: null, authReady: true, authNotice: 'denied', authDegraded: false })
  } else if (result.kind === 'transient') {
    set({ authReady: true, authDegraded: true })
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
      authNotice: null,
      authDegraded: false,
      setUser: (user) => set({ user }),
      setWhitelist: (list) => set({ whitelist: list }),
      setAuthReady: (ready) => set({ authReady: ready }),
      setBiometricsEnabled: (enabled) => set({ biometricsEnabled: enabled }),
      setMfaRequired: (required) => set({ mfaRequired: required }),
      updateAvatar: async (url) => {
        const currentUser = get().user
        if (!currentUser) return

        set((state) => ({
          user: state.user ? { ...state.user, avatar_url: url } : null
        }))

        const { error } = await supabase
          .from('profiles')
          .update({ avatar_url: url })
          .eq('id', currentUser.id)

        if (error) {
          console.error('Error al guardar el avatar:', error)
          throw error
        }
      },
      signOut: async () => {
        try {
          await supabase.auth.signOut()

          if (authListenerSubscription) {
            authListenerSubscription.unsubscribe()
            authListenerSubscription = null
          }

          const keysToRemove = ['auth-storage-v6', 'biometric_enabled']
          const localStorageKeys = Object.keys(localStorage)
          for (const k of localStorageKeys) {
            if (k.startsWith('sb-') || k.includes('auth-token') || keysToRemove.includes(k)) {
              localStorage.removeItem(k)
            }
          }
          const sessionStorageKeys = Object.keys(sessionStorage)
          for (const k of sessionStorageKeys) {
            if (k.startsWith('sb-') || k.includes('auth-token') || keysToRemove.includes(k)) {
              sessionStorage.removeItem(k)
            }
          }
          await Preferences.remove({ key: 'auth-storage-v6' })
          await Preferences.remove({ key: 'biometric_enabled' })
        } catch (err) {
          console.error('Error during thorough signOut:', err)
        } finally {
          set({
            user: null,
            authReady: true,
            biometricsEnabled: false,
            mfaRequired: false,
            authNotice: null,
            authDegraded: false
          })
        }
      },
      sync: () => {
        if (syncInFlight) return syncInFlight
        syncInFlight = (async () => {
          try {
            const { data: { session }, error } = await withTimeout(supabase.auth.getSession(), AUTH_TIMEOUT_MS)
            if (error || !session?.user) {
              set({ user: error ? get().user : null, authReady: true })
              return
            }
            const result = await withTimeout(getOrCreateProfile(session.user), AUTH_TIMEOUT_MS)
            await applyProfileResult(result, set, get)
          } catch (err) {
            console.warn('[auth] sync degradado:', (err as Error)?.name)
            set({ authReady: true })
          }
        })().finally(() => { syncInFlight = null })
        return syncInFlight
      },
      initialize: () => {
        if (authListenerSubscription) {
          console.log('Auth Store already initialized, skipping...')
          if (!get().authReady) set({ authReady: true })
          return () => {}
        }

        console.log('Initializing Auth Store...')
        void get().sync()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'INITIAL_SESSION') return
          setTimeout(() => {
            void (async () => {
              console.log('Auth state change event:', event)
              if (event === 'SIGNED_OUT') {
                set({ user: null, authReady: true })
              } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
                if (session?.user) {
                  const result = await getOrCreateProfile(session.user)
                  await applyProfileResult(result, set, get)
                }
              }
              // TOKEN_REFRESHED -> no action needed
            })()
          }, 0)
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
      onRehydrateStorage: () => (state) => {
        // no optimistic authReady
      },
      partialize: (state) => ({
        user: state.user,
        biometricsEnabled: state.biometricsEnabled
      })
    }
  )
)
