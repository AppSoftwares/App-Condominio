import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.caminos.lagunita',
  appName: 'Condominio',
  webDir: 'dist',
  server: {
    allowNavigation: ['*.supabase.co', 'accounts.google.com', 'app-condominio.vercel.app'],
  },
  ios: {
    contentInset: 'never',
    backgroundColor: '#FAF8F5'
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#0f5551",
      showSpinner: false,
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
