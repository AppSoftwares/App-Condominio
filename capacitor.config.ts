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
      launchShowDuration: 0,
      backgroundColor: "#ffffffff",
      showSpinner: false,
      androidScaleType: "CENTER_CROP"
    }
  }
};

export default config;
