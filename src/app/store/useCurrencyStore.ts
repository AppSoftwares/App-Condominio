import { create } from 'zustand'
import { Preferences } from '@capacitor/preferences'

interface CurrencyState {
  bcvRate: number
  rateUpdatedAt: string | null
  rateSource: 'live' | 'cached' | 'fallback'
  isLoading: boolean
  error: string | null
  fetchRate: () => Promise<void>
}

const FALLBACK_RATE = 567.68

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  bcvRate: FALLBACK_RATE,
  rateUpdatedAt: null,
  rateSource: 'fallback',
  isLoading: false,
  error: null,
  fetchRate: async () => {
    set({ isLoading: true, error: null })
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 6000)

    try {
      const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      if (!response.ok) throw new Error('Error al obtener la tasa')

      const data = await response.json()
      if (data && data.promedio) {
        const rate = Number(data.promedio)
        const updatedAt = new Date().toISOString()
        set({ bcvRate: rate, rateUpdatedAt: updatedAt, rateSource: 'live', isLoading: false })
        await Preferences.set({ key: 'bcv_rate_cache', value: JSON.stringify({ rate, updatedAt }) })
      } else {
        throw new Error('Formato de datos inválido')
      }
    } catch (err) {
      clearTimeout(timeoutId)
      console.warn('Fallo al obtener tasa live, buscando caché local...', err)
      try {
        const { value } = await Preferences.get({ key: 'bcv_rate_cache' })
        if (value) {
          const cached = JSON.parse(value)
          set({ bcvRate: cached.rate, rateUpdatedAt: cached.updatedAt, rateSource: 'cached', isLoading: false })
          return
        }
      } catch (cacheErr) {
        console.warn('Error leyendo caché de tasa:', cacheErr)
      }
      set({ error: 'No se pudo conectar con el BCV', rateSource: 'fallback', isLoading: false })
    }
  }
}))
