import { useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const ROUTE_WHITELIST = ['/requests', '/dashboard', '/payments', '/incidents', '/admin']

export const usePushNotifications = (userId: string | undefined) => {
  const navigate = useNavigate()

  useEffect(() => {
    if (!userId || !Capacitor.isNativePlatform()) return

    let isMounted = true
    let registrationListener: any
    let registrationErrorListener: any
    let receivedListener: any
    let actionListener: any

    const initPush = async () => {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications')

        // Crear canal de notificación por defecto en Android
        if (Capacitor.getPlatform() === 'android') {
          await PushNotifications.createChannel({
            id: 'default',
            name: 'Notificaciones Generales',
            description: 'Canal principal para avisos y comunicados de CaminosApp',
            importance: 5,
            visibility: 1,
            vibration: true
          })
        }

        let permStatus = await PushNotifications.checkPermissions()
        if (permStatus.receive === 'prompt') {
          permStatus = await PushNotifications.requestPermissions()
        }

        if (permStatus.receive !== 'granted') return

        await PushNotifications.register()

        if (!isMounted) return

        registrationListener = await PushNotifications.addListener('registration', async (token) => {
          console.log('Push token recibido:', token.value)
          const { error } = await supabase
            .from('profiles')
            .update({
              fcm_token: token.value,
              last_token_update: new Date().toISOString()
            })
            .eq('id', userId)

          if (error) console.error('Error guardando token FCM:', error)
        })

        registrationErrorListener = await PushNotifications.addListener('registrationError', (err) => {
          console.error('Error en registro Push:', err.error)
        })

        receivedListener = await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Notificación push recibida en primer plano:', notification)
          // Mostrar banner in-app o toast
          if (notification.title && notification.body) {
            showInAppBanner(notification.title, notification.body)
          }
        })

        actionListener = await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Acción sobre notificación push:', notification)
          const data = notification.notification.data
          if (data && data.route) {
            let targetRoute = data.route
            if (data.announcement_id) {
              targetRoute = `${targetRoute}?announcement=${data.announcement_id}`
            }

            // Validar whitelist
            const baseRoute = data.route.split('?')[0]
            if (ROUTE_WHITELIST.includes(baseRoute)) {
              navigate(targetRoute)
            } else {
              console.warn('Ruta de push no autorizada en whitelist:', baseRoute)
            }
          }
        })
      } catch (error) {
        console.warn('Push Notifications no soportadas en este entorno:', error)
      }
    }

    initPush()

    return () => {
      isMounted = false
      if (registrationListener) registrationListener.remove()
      if (registrationErrorListener) registrationErrorListener.remove()
      if (receivedListener) receivedListener.remove()
      if (actionListener) actionListener.remove()
    }
  }, [userId, navigate])
}

function showInAppBanner(title: string, body: string) {
  const banner = document.createElement('div')
  banner.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    right: 20px;
    background: var(--card-bg, #ffffff);
    color: var(--text-color, #1f2937);
    border: 1px solid var(--border-color, #e5e7eb);
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    z-index: 99999;
    animation: slideDown 0.3s ease;
  `
  banner.innerHTML = `
    <div style="font-weight: 700; font-size: 14px; color: var(--primary-color); margin-bottom: 4px;">${title}</div>
    <div style="font-size: 13px; opacity: 0.9;">${body}</div>
  `
  document.body.appendChild(banner)
  setTimeout(() => {
    banner.style.opacity = '0'
    banner.style.transition = 'opacity 0.3s ease'
    setTimeout(() => banner.remove(), 300)
  }, 4000)
}
