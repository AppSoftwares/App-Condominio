import { create } from 'zustand'

interface CurrencyState {
  bcvRate: number
  isLoading: boolean
  error: string | null
  fetchRate: () => Promise<void>
}

// Tasa de respaldo en caso de que falle la API
const FALLBACK_RATE = 567.68

export const useCurrencyStore = create<CurrencyState>((set) => ({
  bcvRate: FALLBACK_RATE,
  isLoading: false,
  error: null,
  fetchRate: async () => {
    set({ isLoading: true, error: null })
    try {
      // Usamos una API pública para obtener la tasa oficial del BCV en Venezuela
      const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial')
      if (!response.ok) throw new Error('Error al obtener la tasa')

      const data = await response.json()
      // La API devuelve un objeto con la propiedad 'promedio'
      if (data && data.promedio) {
        set({ bcvRate: data.promedio, isLoading: false })
        console.log(`Tasa BCV actualizada automáticamente: ${data.promedio} Bs/$`)
      } else {
        throw new Error('Formato de datos inválido')
      }
    } catch (err) {
      console.error('No se pudo actualizar la tasa automáticamente, usando respaldo:', err)
      set({ error: 'No se pudo conectar con el BCV', isLoading: false })
    }
  }
}))
