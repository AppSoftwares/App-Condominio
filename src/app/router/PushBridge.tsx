import React from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { usePushNotifications } from '../../shared/hooks/usePushNotifications'

// Vive DENTRO de <Router>: el hook usa useNavigate() y no puede llamarse desde App().
export const PushBridge: React.FC = () => {
  const userId = useAuthStore((s) => s.user?.id)
  usePushNotifications(userId)
  return null
}
