import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';

interface VersionInfo {
  versionCode: number;
  versionName: string;
  url: string;
  releaseNotes?: string;
}

export const useUpdateCheck = () => {
  const [updateInfo, setUpdateInfo] = useState<VersionInfo | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

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
      }
    } catch (error) {
      console.error('Error al verificar actualizaciones:', error);
    }
  };

  useEffect(() => {
    // Verificar al montar el hook (inicio de app)
    checkUpdates();
  }, []);

  const performUpdate = async () => {
    if (updateInfo) {
      // Abrir el link directo del APK en GitHub
      await Browser.open({
        url: updateInfo.url,
        windowName: '_system' // Fuerza apertura en navegador del sistema
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
