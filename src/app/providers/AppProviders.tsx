import React from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '../../shared/lib/queryClient'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import '../../shared/i18n'
import '../styles/index.css'

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        {children}
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </React.StrictMode>
  )
}
