import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// CONFIGURACIÓN DE CACHE (TanStack Query)
export const QUERY_CONFIG = {
  roles: { staleTime: 5 * 60 * 1000, refetchOnFocus: false },
  lessons: { staleTime: 10 * 60 * 1000, refetchOnFocus: false },
  userProfile: { staleTime: 5 * 60 * 1000, refetchOnFocus: false },
  subscriptions: { staleTime: 1 * 60 * 1000, refetchOnFocus: true },
  leaderboard: { staleTime: 30 * 1000, refetchOnFocus: true, refetchInterval: 60 * 1000 },
  communityPosts: { staleTime: 0, refetchOnFocus: true, refetchInterval: 30 * 1000 },
  userProgress: { staleTime: 0, refetchOnFocus: true },
  streak: { staleTime: 0, refetchOnFocus: true },
}
