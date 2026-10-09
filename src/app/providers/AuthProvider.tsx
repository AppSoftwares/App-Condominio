import React, { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { FullScreenLoader } from '../../shared/components/FullScreenLoader'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialize = useAuthStore((s) => s.initialize)
  const authReady = useAuthStore((s) => s.authReady)
  const user = useAuthStore((s) => s.user)

  useEffect(() => initialize(), [initialize])

  if (!authReady && !user) return <FullScreenLoader label="Verificando sesion..." />
  return <>{children}</>
}
