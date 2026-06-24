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
      const currentVersionCode = parseInt(info.build);

      // 2. Consultar el JSON en el servidor
      const UPDATE_URL = import.meta.env.VITE_UPDATE_JSON_URL || 'https://app-condominio.vercel.app/version.json';

      const response = await fetch(`${UPDATE_URL}?t=${Date.now()}`);
      if (!response.ok) return;

      const latest: VersionInfo = await response.json();

      // 3. Comparar versiones
      if (latest.versionCode > currentVersionCode) {
        setUpdateInfo(latest);
        setIsUpdateAvailable(true);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  useEffect(() => {
    checkUpdates();
  }, []);

  const performUpdate = async () => {
    if (updateInfo) {
      await Browser.open({ url: updateInfo.url });
    }
  };

  return { isUpdateAvailable, updateInfo, performUpdate };
};
