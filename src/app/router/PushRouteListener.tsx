import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'

const ROUTE_WHITELIST = ['/requests', '/dashboard', '/payments', '/incidents', '/admin']

export const PushRouteListener: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return

    const checkLaunchNotification = async () => {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications')
        const delivered = await PushNotifications.getDeliveredNotifications()
        // Check if app was launched via push notification action
        if (delivered && delivered.notifications && delivered.notifications.length > 0) {
          // Process latest notification data if available
          const latest = delivered.notifications[delivered.notifications.length - 1]
          if (latest && latest.data && latest.data.route) {
            let targetRoute = latest.data.route
            if (latest.data.announcement_id) {
              targetRoute = `${targetRoute}?announcement=${latest.data.announcement_id}`
            }
            const baseRoute = latest.data.route.split('?')[0]
            if (ROUTE_WHITELIST.includes(baseRoute)) {
              navigate(targetRoute)
            }
          }
        }
      } catch (err) {
        console.error('Error comprobando notificaciones de inicio:', err)
      }
    }

    checkLaunchNotification()
  }, [navigate])

  return null
}
