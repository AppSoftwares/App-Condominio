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
      whitelist: [
        {
          id: '11f36bf3-d939-4844-bd48-84cb151b8f55',
          name: 'JESÚS ADMIN',
          email: 'admin@caminos.com',
          password: 'JESUS.ADMIN.CAMINOS',
          role: 'superadmin',
          conjunto: 'LAS HUERTAS',
          house_number: 'ADMIN-01',
          etapa: 'I'
        },
        {
          id: '7386a821-2d6d-4add-b923-db6aa3974bc0',
          name: 'JESÚS ADMIN',
          email: 'admin@huertas.com',
          password: 'JESUS.ADMIN.HUERTAS',
          role: 'admin',
          conjunto: 'LAS HUERTAS',
          house_number: 'ADMIN-02',
          etapa: 'III ETAPA'
        },
        {
          id: 'c0abf806-8d6d-4836-b738-5fa9c0351c0a',
          name: 'CARLOS PIRELA',
          email: 'ofi.pirela@gmail.com',
          password: 'CARLOS.HUERTAS.123',
          role: 'resident',
          conjunto: 'LAS HUERTAS',
          house_number: '14-28',
          etapa: 'III ETAPA'
        },
        {
          id: 'f9075e77-2e22-4c9f-9109-4f2f7d82f0df',
          name: 'JESÚS PIRELA',
          email: 'jess.pirela@gmail.com',
          password: 'JESUS.HUERTAS.123',
          role: 'resident',
          conjunto: 'LAS HUERTAS',
          house_number: '14-28',
          etapa: 'III ETAPA'
        },
        {
          id: 'a4b19db7-6a38-4803-b33e-b6e0908ab909',
          name: 'JESÚS VIGILANTE',
          email: 'vigilante@huertas.com',
          password: 'JESUS.VIGILANTE.HUERTAS',
          role: 'guard',
          conjunto: 'LAS HUERTAS',
          house_number: 'CASETA',
          etapa: 'III ETAPA'
        },
        {
          id: 'e29b14c5-55e1-4b10-8b1e-4c5e14b10b1e',
          name: 'JUAN PERÉZ',
          email: 'PRUEBA@HUERTAS.COM',
          password: 'PRUEBA.HUERTAS.123',
          role: 'RESIDENTE',
          conjunto: 'LAS HUERTAS',
          house_number: '14-100',
          etapa: 'III ETAPA'
        }
      ],
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
