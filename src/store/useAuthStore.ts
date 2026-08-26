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
    const id = await Device.getId()
    const info = await Device.getInfo()

    let deviceName = `${info.manufacturer || ''} ${info.model || info.platform}`.trim()

    if (info.platform === 'web') {
      const parser = new UAParser(window.navigator.userAgent)
      deviceName = `${parser.getBrowser().name || 'Navegador'} en ${parser.getOS().name || 'Web'}`
    }

    // Usar rpc_register_session con control de errores absoluto
    const { error } = await supabase.rpc('rpc_register_session', {
      p_device_name: deviceName || 'Dispositivo desconocido',
      p_device_id: id.identifier,
      p_platform: info.platform,
    })

    if (error) console.warn('RPC register_session error:', error.message)
  } catch (err) {
    // Nunca dejar que este error suba hasta cerrar la app
    console.error('Safe device registration failed:', err)
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

async function getOrCreateProfile(authUser: any): Promise<UserProfile | null> {
  try {
    const userEmail = authUser.email?.toLowerCase().trim()

    // 1. Buscar perfil existente por ID o por Email
    // Usamos .or() para intentar encontrar el perfil por cualquiera de los dos campos.
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, avatar_url, residential_cluster, house_number, etapa')
      .or(`id.eq.${authUser.id},email.eq.${userEmail}`)
      .maybeSingle()

    if (profile && !profileError) {
      // Si el ID de Auth no coincide con el ID del perfil (ej. primer login con Google),
      // intentamos actualizar el ID del perfil para vincularlos permanentemente.
      if (profile.id !== authUser.id) {
        console.log(`Vinculando perfil existente (${profile.email}) con nuevo ID de Auth: ${authUser.id}`)
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ id: authUser.id })
          .eq('email', userEmail)

        if (updateError) {
          console.warn('No se pudo vincular el ID del perfil automáticamente debido a RLS. El usuario podrá entrar pero el ID seguirá desincronizado.', updateError.message)
        }
      }
      return profile as UserProfile
    }

    // 2. Si no se encontró en la tabla 'profiles', revisar si está en la 'whitelist' (fallback)
    // Nota: Esto permite que usuarios de Google OAuth que están en la lista de invitados
    // pero no tienen perfil en la DB puedan entrar.
    const state = useAuthStore.getState()
    const whitelistedUser = state.whitelist?.find(u =>
      (u.email || '').toString().toLowerCase().trim() === userEmail
    )

    if (whitelistedUser) {
      console.log('Usuario encontrado en whitelist, creando perfil inicial...')
      const fullName = (whitelistedUser.name || 'Usuario').toString()
      const nameParts = fullName.split(' ')

      const newProfile: UserProfile = {
        id: authUser.id,
        email: userEmail,
        first_name: nameParts[0] || 'Usuario',
        last_name: nameParts.slice(1).join(' ') || '',
        role: (whitelistedUser.role === 'ADMINISTRADOR' ? 'admin' : (whitelistedUser.role === 'VIGILANTE' ? 'guard' : 'resident')),
        residential_cluster: whitelistedUser.conjunto || whitelistedUser.residential_cluster,
        house_number: whitelistedUser.house_number,
        etapa: whitelistedUser.etapa
      }

      // Intentar insertar en la DB (esto puede fallar si no hay permisos de insert)
      const { error: insertError } = await supabase.from('profiles').insert([newProfile])
      if (insertError) console.error('Error al persistir perfil desde whitelist:', insertError.message)

      return newProfile
    }

    // 3. Si no existe el perfil ni en DB ni en Whitelist, rechazar
    const errorMsg = `Acceso denegado: El correo ${userEmail} no está registrado en el sistema de residentes.`
    console.warn(errorMsg)
    alert(errorMsg)

    await supabase.auth.signOut()
    return null
  } catch (err) {
    console.error('Error in getOrCreateProfile:', err)
    return null
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

        // 1. Actualizar localmente para feedback inmediato
        set((state) => ({
          user: state.user ? { ...state.user, avatar_url: url } : null
        }))

        // 2. Persistir en la base de datos de Supabase
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
          // 1. Notificar a Supabase
          await supabase.auth.signOut()

          // 2. Limpiar suscripción si existe
          if (authListenerSubscription) {
            authListenerSubscription.unsubscribe()
            authListenerSubscription = null
          }

          // 3. Limpiar almacenamiento de Capacitor explicitly
          await Preferences.clear()

          // 4. Limpiar almacenamiento local (Web fallback)
          localStorage.clear()
          sessionStorage.clear()

        } catch (err) {
          console.error('Error during thorough signOut:', err)
        } finally {
          // 5. Resetear estado de la memoria
          set({
            user: null,
            authReady: true,
            biometricsEnabled: false,
            mfaRequired: false
          })
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
            const profile = await getOrCreateProfile(session.user)

            if (profile) {
              const mfaNeeded = await checkMfaStatus()
              set({ user: profile, authReady: true, mfaRequired: mfaNeeded })
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
              const profile = await getOrCreateProfile(session.user)

              if (profile) {
                const mfaNeeded = await checkMfaStatus()
                set({ user: profile, authReady: true, mfaRequired: mfaNeeded })
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
