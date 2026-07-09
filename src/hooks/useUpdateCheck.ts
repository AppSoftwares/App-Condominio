import { useEffect, useState, useRef } from 'react';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { useUpdateStore } from '../store/useUpdateStore'

interface VersionInfo {
  versionCode: number;
  versionName: string;
  url: string;
  releaseNotes?: string;
}

export const useUpdateCheck = () => {
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const intervalRef = useRef<number | null>(null)

  const checkUpdates = async () => {
    try {
      // 1. Obtener info de la app actual
      const info = await App.getInfo();
      // En Android, 'build' suele ser el versionCode
      const currentVersionCode = parseInt(info.build);

      console.log('Versión actual (build):', currentVersionCode);

      // 2. Consultar el JSON en el servidor (Vercel)
      // Agregamos un timestamp para evitar caché del navegador/servidor
      const UPDATE_URL = import.meta.env.VITE_UPDATE_JSON_URL || 'https://app-condominio.vercel.app/version.json';

      const response = await fetch(`${UPDATE_URL}?t=${Date.now()}`, {
        cache: 'no-store'
      });

      if (!response.ok) {
        console.warn('No se pudo obtener el archivo de versiones');
        return;
      }

      const latest: VersionInfo = await response.json();
      console.log('Última versión disponible:', latest.versionCode);

      // 3. Comparar versiones
      if (latest.versionCode > currentVersionCode) {
        setUpdateInfo(latest);
        setIsUpdateAvailable(true);
        // Centraliza la notificación y el badge
        try { await notifyUser(latest) } catch (e) { console.warn('notifyUser fallo', e) }
      }
    } catch (error) {
      console.error('Error al verificar actualizaciones:', error);
    }
  };

  // Notifica al usuario según plataforma: LocalNotifications (Capacitor),
  // o Notification API en web, y siempre actualiza el store para el badge.
  const notifyUser = async (latest: VersionInfo) => {
    try { useUpdateStore.getState().setAvailable(true, latest.versionName) } catch (e) {}

    // 1) Intentar LocalNotifications (iOS/Android)
    try {
      // Use a runtime dynamic import via Function to avoid Vite/Rollup resolving
      const dynamicImport: any = new Function('s', 'return import(s)')
      const { LocalNotifications } = await dynamicImport('@capacitor/local-notifications')
      const perm = await LocalNotifications.checkPermissions()
      if (perm.display === 'granted') {
        await LocalNotifications.schedule({ notifications: [{ title: 'Actualización disponible', body: `Versión ${latest.versionName} disponible.`, id: Date.now() % 100000 }] })
        return
      } else if (perm.display === 'prompt') {
        const req = await LocalNotifications.requestPermissions()
        if (req.display === 'granted') {
          await LocalNotifications.schedule({ notifications: [{ title: 'Actualización disponible', body: `Versión ${latest.versionName} disponible.`, id: Date.now() % 100000 }] })
          return
        }
      }
    } catch (err) {
      // plugin no disponible en web o fallo
    }

    // 2) Fallback web: Notification API
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Actualización disponible', { body: `Versión ${latest.versionName} disponible.`, tag: 'app-update' })
          return
        } else if (Notification.permission === 'default') {
          const p = await Notification.requestPermission()
          if (p === 'granted') {
            new Notification('Actualización disponible', { body: `Versión ${latest.versionName} disponible.`, tag: 'app-update' })
            return
          }
        }
      }
    } catch (err) {
      // ignore
    }

    // 3) In-app toast fallback
    try {
      if (typeof document !== 'undefined') {
        const id = 'app-update-toast'
        if (!document.getElementById(id)) {
          const el = document.createElement('div')
          el.id = id
          el.style.position = 'fixed'
          el.style.left = '50%'
          el.style.transform = 'translateX(-50%)'
          el.style.bottom = '90px'
          el.style.background = 'linear-gradient(90deg, rgba(18,184,163,0.95), rgba(15,85,81,0.95))'
          el.style.color = 'white'
          el.style.padding = '12px 18px'
          el.style.borderRadius = '14px'
          el.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)'
          el.style.zIndex = '99999'
          el.style.fontWeight = '700'
          el.innerText = `Versión ${latest.versionName} disponible — toca para actualizar`
          el.onclick = () => { performUpdate().catch(()=>{}); el.remove() }
          document.body.appendChild(el)
          setTimeout(() => { el.remove() }, 8000)
        }
      }
    } catch (err) {
      // final fallback
      console.log('Update available:', latest.versionName)
    }
  }

  // Interval (ms) to periodically check for updates. Can be overridden with env var.
  const DEFAULT_INTERVAL_MS = Number(import.meta.env.VITE_UPDATE_CHECK_INTERVAL_MS) || 15 * 60 * 1000 // 15 minutes

  useEffect(() => {
    // Verificar al montar el hook (inicio de app)
    checkUpdates();

    // Periodic polling
    try {
      intervalRef.current = window.setInterval(() => {
        checkUpdates();
      }, DEFAULT_INTERVAL_MS) as unknown as number
    } catch (err) {
      console.warn('No se pudo iniciar el intervalo de actualización automático', err)
    }

    // Re-check when app resumes (foreground)
    const appListenerPromise = App.addListener('appStateChange', (state) => {
      if (state.isActive) {
        checkUpdates();
      }
    });

    // Re-check when network comes back online
    const onOnline = () => checkUpdates();
    window.addEventListener('online', onOnline);

    return () => {
      // Cleanup
      if (intervalRef.current) {
        clearInterval(intervalRef.current as number)
        intervalRef.current = null
      }
      try { appListenerPromise.then(l => l.remove()).catch(()=>{}) } catch (e) {}
      window.removeEventListener('online', onOnline);
    }
  }, []);

  const performUpdate = async () => {
    if (updateInfo) {
      // Detectar plataforma para elegir el link correcto
      const { platform } = await App.getInfo();
      let downloadUrl = updateInfo.url;

      if (platform === 'android' && (updateInfo as any).url_android) {
        downloadUrl = (updateInfo as any).url_android;
      } else if (platform === 'ios' && (updateInfo as any).url_ios) {
        downloadUrl = (updateInfo as any).url_ios;
      }

      await Browser.open({
        url: downloadUrl,
        windowName: '_system'
      });
    }
  };

  return {
    isUpdateAvailable,
    updateInfo,
    performUpdate,
    checkUpdates // Permite re-verificar si es necesario
  };
};
