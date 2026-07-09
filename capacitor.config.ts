import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.caminos.lagunita',
  appName: 'Condominio',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#ffffffff",
      showSpinner: false,
      androidScaleType: "CENTER_CROP"
    }
  }
};

export default config;
