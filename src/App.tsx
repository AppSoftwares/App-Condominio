// Creado por Jesús Pirela.
import { BrowserRouter as Router } from 'react-router-dom'
import { useEffect, useState, useRef, useCallback } from 'react'
import { ErrorBoundary } from './shared/components/ErrorBoundary'
import { useAuthStore } from './app/store/useAuthStore'
import { usePushNotifications } from './shared/hooks/usePushNotifications'
import { useCurrencyStore } from './app/store/useCurrencyStore'
import { useThemeStore } from './app/store/useThemeStore'
import { useUpdateCheck } from './shared/hooks/useUpdateCheck'
import { UpdateModal } from './shared/components/UpdateModal'
import { App as CapApp } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'
import { Capacitor } from '@capacitor/core'
import { isBiometricEnabled, verifyBiometric } from './shared/lib/biometrics'
import { flushQueue } from './shared/lib/offlineQueue'
import { AppProviders } from './app/providers/AppProviders'
import { AuthProvider } from './app/providers/AuthProvider'
import { AppRouter } from './app/router/AppRouter'
import { FullScreenLoader } from './shared/components/FullScreenLoader'
import { bootstrapApp, BootResult, FALLBACK_BOOT } from './app/bootstrap/bootstrapApp'
import { CookieConsentBanner } from './features/legal/CookieConsentBanner'
import { ConsentGate } from './features/legal/ConsentGate'
import { initSentryIfConsented } from './shared/lib/sentry'
import { useConsentStore } from './features/legal/useConsentStore'

const OfflineBanner: React.FC<{ reason?: string; onRetry?: () => void }> = ({ reason, onRetry }) => (
  <div role="status" aria-live="polite" style={{
    background: 'var(--card-bg)', color: 'var(--text-color)', padding: '8px 16px',
    borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', fontSize: 13, zIndex: 1100
  }}>
    <span>Sin conexión estable ({reason || 'degradada'}). Algunos datos pueden estar desactualizados.</span>
    {onRetry && <button type="button" onClick={onRetry} style={{ padding: '4px 8px', cursor: 'pointer' }}>Reintentar</button>}
  </div>
)

function App() {
  const user = useAuthStore(state => state.user)
  const syncAuth = useAuthStore(state => state.sync)
  const fetchRate = useCurrencyStore(state => state.fetchRate)
  const isDarkMode = useThemeStore(state => state.isDarkMode)

  const [boot, setBoot] = useState<BootResult | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const lastBackgroundAtRef = useRef<number>(0)

  // Carga secundaria diferida (condicionada a boot !== null)
  useEffect(() => {
    if (!boot) return
    fetchRate()
    flushQueue().catch(() => {})
  }, [boot])

  // Suscribirse a cambios de consentimiento para Sentry
  useEffect(() => {
    const unsub = useConsentStore.subscribe((state) => {
      if (state.diagnostics) {
        initSentryIfConsented()
      } else {
        import('@sentry/react').then(Sentry => {
          if (typeof Sentry.close === 'function') Sentry.close()
        }).catch(() => {})
      }
    })
    return unsub
  }, [])

  usePushNotifications(boot && user ? user.id : undefined)

  const { isUpdateAvailable, updateInfo, performUpdate } = useUpdateCheck({
    enabled: !!boot,
    initialDelayMs: 3000
  })
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  const nextPaint = () => new Promise<void>((r) => setTimeout(r, 50))

  const handleBoot = useCallback(async () => {
    let result: BootResult = FALLBACK_BOOT
    try {
      result = await bootstrapApp()
      await initSentryIfConsented()
    } catch (err) {
      console.warn('[boot] fallo inesperado', (err as Error)?.name)
    } finally {
      setBoot(result)
      setIsLocked(result.locked)
      await nextPaint()
      await SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {})
    }
  }, [])

  useEffect(() => {
    handleBoot()
  }, [handleBoot])

  // Re-bloquear al volver de segundo plano si pasaron > 60s
  useEffect(() => {
    const appStateListener = CapApp.addListener('appStateChange', async ({ isActive }) => {
      if (!isActive) {
        lastBackgroundAtRef.current = Date.now()
      } else {
        syncAuth().catch(() => {})
        const elapsed = Date.now() - lastBackgroundAtRef.current
        const bioEnabled = await isBiometricEnabled().catch(() => false)
        if (bioEnabled && user && elapsed > 60_000) {
          setIsLocked(true)
          await verifyBiometric().then(success => {
            if (success) setIsLocked(false)
          }).catch(() => {})
        }
      }
    })

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

    return () => {
      appStateListener.then(l => l.remove()).catch(() => {})
      backButtonListener.then(l => l.remove()).catch(() => {})
    }
  }, [syncAuth, user])

  useEffect(() => {
    if (isUpdateAvailable) {
      setShowUpdateModal(true)
    }
  }, [isUpdateAvailable])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark-mode')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark-mode')
    }
  }, [isDarkMode])

  if (!boot) {
    return Capacitor.isNativePlatform() ? null : <FullScreenLoader label="Iniciando..." />
  }

  return (
    <ErrorBoundary>
      <AppProviders>
        <AuthProvider>
          <Router>
            <CookieConsentBanner />
            <ConsentGate>
              {boot.status === 'degraded' && <OfflineBanner reason={boot.reason} onRetry={() => handleBoot()} />}
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
                        type="button"
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
            </ConsentGate>
          </Router>
        </AuthProvider>
      </AppProviders>
    </ErrorBoundary>
  )
}

export default App
