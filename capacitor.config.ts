import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.caminos.lagunita',
  appName: 'Condominio',
  webDir: 'dist',
  server: {
    iosScheme: 'https',
    hostname: 'app-condominio.vercel.app',
    allowNavigation: ["*"]
  },
  ios: {
    contentInset: 'never',
    backgroundColor: '#FAF8F5'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#0f5551",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
