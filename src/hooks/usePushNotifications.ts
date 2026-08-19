import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabase';

export const usePushNotifications = (userId: string | undefined) => {
  useEffect(() => {
    // Solo intentar si es un dispositivo nativo y hay usuario
    if (userId && Capacitor.isNativePlatform()) {
      initPush();
    }
  }, [userId]);

  const initPush = async () => {
    try {
      // Importación dinámica para que Vite no se rompa en la web
      const { PushNotifications } = await import('@capacitor/push-notifications');

      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') return;

      await PushNotifications.register();

      await PushNotifications.addListener('registration', async (token) => {
        console.log('Push token:', token.value);
        // Aseguramos que el token se guarde siempre, incluso si ya existe
        const { error } = await supabase
          .from('profiles')
          .update({
            expo_push_token: token.value,
            last_token_update: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) console.error('Error guardando token en Supabase:', error);
      });

      await PushNotifications.addListener('registrationError', (err) => {
        console.error('Error en registro Push:', err.error);
      });

      await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push recibida:', notification);
        // Podríamos disparar una notificación local o actualizar un estado global
      });

      await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push acción realizada:', notification.actionId);
        // Redirigir según el tipo de notificación
      });
    } catch (error) {
      console.warn('Capacitor Push Notifications no disponibles en este entorno');
    }
  };
};
