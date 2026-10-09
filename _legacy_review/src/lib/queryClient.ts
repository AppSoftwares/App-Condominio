import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,       // 1 minuto
      refetchOnWindowFocus: false, // evita refetch agresivo en app móvil
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
})
