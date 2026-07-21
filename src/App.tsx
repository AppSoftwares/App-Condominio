// Creado por Jesús Pirela.
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense, useEffect, useState } from 'react'
import { Layout } from './layouts/Main'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthSplash } from './features/auth/AuthSplash'
import { Login } from './features/auth/Login'
import { Register } from './features/auth/Register'
import { MfaChallenge } from './features/auth/MfaChallenge'

const ResDash = lazy(() => import('./features/dash/ResDash').then(m => ({ default: m.ResDash })))
const Profile = lazy(() => import('./features/prof/Profile').then(m => ({ default: m.Profile })))
const Account = lazy(() => import('./features/prof/Account').then(m => ({ default: m.Account })))
const Appearance = lazy(() => import('./features/prof/Appearance').then(m => ({ default: m.Appearance })))
const Privacy = lazy(() => import('./features/prof/Privacy').then(m => ({ default: m.Privacy })))
const Notifications = lazy(() => import('./features/prof/Notifications').then(m => ({ default: m.Notifications })))
const InviteFriend = lazy(() => import('./features/prof/InviteFriend').then(m => ({ default: m.InviteFriend })))
const Support = lazy(() => import('./features/prof/Support').then(m => ({ default: m.Support })))
const HelpCenter = lazy(() => import('./features/prof/HelpCenter').then(m => ({ default: m.HelpCenter })))
const LegalDocument = lazy(() => import('./features/prof/LegalDocument').then(m => ({ default: m.LegalDocument })))
const EmergencyLines = lazy(() => import('./features/prof/EmergencyLines').then(m => ({ default: m.EmergencyLines })))
const Admin = lazy(() => import('./features/admin/Admin').then(m => ({ default: m.Admin })))
const IncidentsAdmin = lazy(() => import('./features/admin/IncidentsAdmin').then(m => ({ default: m.IncidentsAdmin })))
const Payroll = lazy(() => import('./features/admin/Payroll').then(m => ({ default: m.Payroll })))
const GuardPortal = lazy(() => import('./features/guard/GuardPortal').then(m => ({ default: m.GuardPortal })))
const Payments = lazy(() => import('./features/res/Payments').then(m => ({ default: m.Payments })))
const Requests = lazy(() => import('./features/res/Requests').then(m => ({ default: m.Requests })))
const Guests = lazy(() => import('./features/res/Guests').then(m => ({ default: m.Guests })))
const Reservations = lazy(() => import('./features/res/Reservations').then(m => ({ default: m.Reservations })))
const Incidents = lazy(() => import('./features/res/Incidents').then(m => ({ default: m.Incidents })))
const PackageLocker = lazy(() => import('./features/res/PackageLocker').then(m => ({ default: m.PackageLocker })))
import { useAuthStore, UserRole } from './store/useAuthStore'
import { usePushNotifications } from './hooks/usePushNotifications'
import { useCurrencyStore } from './store/useCurrencyStore'
import { useThemeStore } from './store/useThemeStore'
import { ScrollToTop } from './components/ScrollToTop'
import { useUpdateCheck } from './hooks/useUpdateCheck'
import { UpdateModal } from './components/UpdateModal'
import { App as CapApp } from '@capacitor/app'
import { SplashScreen } from '@capacitor/splash-screen'
import { isBiometricEnabled, verifyBiometric } from './lib/biometrics'

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: UserRole[] }) => {
  const user = useAuthStore(state => state.user)

  if (!user) return <Navigate to="/login" />
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'admin' || user.role === 'superadmin') return <Navigate to="/admin" />
    if (user.role === 'guard') return <Navigate to="/guard" />
    return <Navigate to="/dashboard" />
  }

  return <>{children}</>
}

function App() {
  const user = useAuthStore(state => state.user)
  const authReady = useAuthStore(state => state.authReady)
  const mfaRequired = useAuthStore(state => state.mfaRequired)
  const setMfaRequired = useAuthStore(state => state.setMfaRequired)
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
    // Manejar eventos de la app
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
        // Re-sincronizar sesión al volver a la app
        syncAuth().catch(() => {});
      }
    });

    return () => {
      backButtonListener.then(l => l.remove());
      appStateListener.then(l => l.remove());
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
      <Router>
        <ScrollToTop />
        {updateInfo && (
          <UpdateModal
            isOpen={showUpdateModal}
            versionName={updateInfo.versionName}
            onUpdate={performUpdate}
            onClose={() => setShowUpdateModal(false)}
          />
        )}
        <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>}>
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
          ) : mfaRequired ? (
            <MfaChallenge onVerified={() => setMfaRequired(false)} />
          ) : !authReady && !user ? (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p>Iniciando sesión...</p>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={!user ? <AuthSplash /> : <RoleRedirect role={user.role} />} />
              <Route path="/auth" element={!user ? <AuthSplash /> : <RoleRedirect role={user.role} />} />
              <Route path="/login" element={!user ? <Login /> : <RoleRedirect role={user.role} />} />
              <Route path="/register" element={!user ? <Register /> : <RoleRedirect role={user.role} />} />

              <Route element={<Layout />}>
                <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["resident"]}><ResDash /></ProtectedRoute>} />
                <Route path="/payments" element={<ProtectedRoute allowedRoles={["resident"]}><Payments /></ProtectedRoute>} />
                <Route path="/requests" element={<ProtectedRoute allowedRoles={["resident"]}><Requests /></ProtectedRoute>} />
                <Route path="/guests" element={<ProtectedRoute allowedRoles={["resident"]}><Guests /></ProtectedRoute>} />
                <Route path="/reservations" element={<ProtectedRoute allowedRoles={["resident"]}><Reservations /></ProtectedRoute>} />
                <Route path="/incidents" element={<ProtectedRoute allowedRoles={["resident"]}><Incidents /></ProtectedRoute>} />
                <Route path="/packages" element={<ProtectedRoute allowedRoles={["resident"]}><PackageLocker /></ProtectedRoute>} />

                <Route path="/profile" element={<ProtectedRoute allowedRoles={["resident","admin","guard","superadmin"]}><Profile /></ProtectedRoute>} />
                <Route path="/profile/account" element={<ProtectedRoute allowedRoles={["resident","admin","guard","superadmin"]}><Account /></ProtectedRoute>} />
                <Route path="/profile/privacy" element={<ProtectedRoute allowedRoles={["resident","admin","guard","superadmin"]}><Privacy /></ProtectedRoute>} />
                <Route path="/profile/appearance" element={<ProtectedRoute allowedRoles={["resident","admin","guard","superadmin"]}><Appearance /></ProtectedRoute>} />
                <Route path="/profile/notifications" element={<ProtectedRoute allowedRoles={["resident","admin","guard","superadmin"]}><Notifications /></ProtectedRoute>} />
                <Route path="/profile/invite" element={<ProtectedRoute allowedRoles={["resident","admin","guard","superadmin"]}><InviteFriend /></ProtectedRoute>} />
                <Route path="/profile/support" element={<ProtectedRoute allowedRoles={["resident","admin","guard","superadmin"]}><Support /></ProtectedRoute>} />
                <Route path="/profile/help" element={<ProtectedRoute allowedRoles={["resident","admin","guard","superadmin"]}><HelpCenter /></ProtectedRoute>} />
                <Route path="/profile/legal" element={<ProtectedRoute allowedRoles={["resident","admin","guard","superadmin"]}><LegalDocument /></ProtectedRoute>} />
                <Route path="/profile/emergency" element={<ProtectedRoute allowedRoles={["resident","admin","guard","superadmin"]}><EmergencyLines /></ProtectedRoute>} />

                <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin","superadmin"]}><Admin /></ProtectedRoute>} />
                <Route path="/admin/incidents" element={<ProtectedRoute allowedRoles={["admin","superadmin"]}><IncidentsAdmin /></ProtectedRoute>} />
                <Route path="/admin/payroll" element={<ProtectedRoute allowedRoles={["admin","superadmin"]}><Payroll /></ProtectedRoute>} />

                <Route path="/guard" element={<ProtectedRoute allowedRoles={["guard"]}><GuardPortal /></ProtectedRoute>} />
              </Route>

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </Suspense>
      </Router>
    </ErrorBoundary>
  )
}

const RoleRedirect = ({ role }: { role: string }) => {
  if (role === 'admin' || role === 'superadmin') return <Navigate to="/admin" />
  if (role === 'guard') return <Navigate to="/guard" />
  return <Navigate to="/dashboard" />
}

export default App
