// Creado por Jesús Pirela.
import { BrowserRouter as Router } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ErrorBoundary } from './shared/components/ErrorBoundary'
import { useAuthStore } from './app/store/useAuthStore'
import { usePushNotifications } from './shared/hooks/usePushNotifications'
import { useCurrencyStore } from './app/store/useCurrencyStore'
import { useThemeStore } from './app/store/useThemeStore'
import { useUpdateCheck } from './shared/hooks/useUpdateCheck'
import { UpdateModal } from './shared/components/UpdateModal'
import { App as CapApp } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'
import { isBiometricEnabled, verifyBiometric } from './shared/lib/biometrics'
import { supabase } from './shared/lib/supabase'
import { AppProviders } from './app/providers/AppProviders'
import { AppRouter } from './app/router/AppRouter'

function App() {
  const user = useAuthStore(state => state.user)
  const authReady = useAuthStore(state => state.authReady)
  const initializeAuth = useAuthStore(state => state.initialize)
  const syncAuth = useAuthStore(state => state.sync)
  const fetchRate = useCurrencyStore(state => state.fetchRate)
  const isDarkMode = useThemeStore(state => state.isDarkMode)

  const [isLocked, setIsLocked] = useState(false)

  // Inicializar Notificaciones Push
  usePushNotifications(user?.id)

  const { isUpdateAvailable, updateInfo, performUpdate } = useUpdateCheck()
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  useEffect(() => {
    const checkLock = async () => {
      if (user) {
        const enabled = await isBiometricEnabled()
        if (enabled) {
          setIsLocked(true)
          const success = await verifyBiometric()
          if (success) setIsLocked(false)
        }
      }
    }
    checkLock()
  }, [user])

  useEffect(() => {
    const backButtonListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      const path = window.location.pathname;
      if (path === '/dashboard' || path === '/admin' || path === '/guard' || path === '/login' || path === '/') {
        CapApp.exitApp();
      } else if (!canGoBack) {
        CapApp.exitApp();
      } else {
        window.history.back();
      }
    });

    const appStateListener = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        syncAuth().catch(() => {});
      }
    });

    const urlOpenListener = CapApp.addListener('appUrlOpen', async (event: any) => {
      if (event.url.includes('login-callback') || event.url.includes('access_token=')) {
        const hash = event.url.split('#')[1];
        if (hash) {
          const params = new URLSearchParams(hash);
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');

          if (access_token && refresh_token) {
            await supabase.auth.setSession({
              access_token,
              refresh_token
            });
            await syncAuth();
          }
        }
      }
    });

    return () => {
      backButtonListener.then(l => l.remove());
      appStateListener.then(l => l.remove());
      urlOpenListener.then(l => l.remove());
    };
  }, [syncAuth]);

  useEffect(() => {
    if (isUpdateAvailable) {
      setShowUpdateModal(true)
    }
  }, [isUpdateAvailable])

  useEffect(() => {
    return initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    const hideSplash = async () => {
      try {
        await SplashScreen.hide()
      } catch (e) {
        // Ignorar si falla
      }
    }

    if (authReady) {
      hideSplash()
    } else {
      const timer = setTimeout(hideSplash, 3000)
      return () => clearTimeout(timer)
    }
  }, [authReady])

  useEffect(() => {
    fetchRate()
  }, [fetchRate])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark-mode')
    }
  }, [isDarkMode])

  return (
    <ErrorBoundary>
      <AppProviders>
        <Router>
          {updateInfo && (
            <UpdateModal
              isOpen={showUpdateModal}
              versionName={updateInfo.versionName}
              onUpdate={performUpdate}
              onClose={() => setShowUpdateModal(false)}
            />
          )}
          {isLocked ? (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', padding: '20px', textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--primary-color)', marginBottom: '20px' }}>lock</span>
                <h2 style={{ fontFamily: "'Cinzel', serif", marginBottom: '10px' }}>App Bloqueada</h2>
                <p style={{ color: 'var(--text-sub)', marginBottom: '30px' }}>Usa tu huella o Face ID para continuar</p>
                <button
                    onClick={async () => {
                        const success = await verifyBiometric()
                        if (success) setIsLocked(false)
                    }}
                    style={{ padding: '15px 30px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                    Desbloquear
                </button>
            </div>
          ) : (
            <AppRouter />
          )}
        </Router>
      </AppProviders>
    </ErrorBoundary>
  )
}

export default App
