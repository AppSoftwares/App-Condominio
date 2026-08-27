import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Layout } from '../layouts/Main'
import { AuthSplash } from '../../features/auth/pages/AuthSplash'
import { Login } from '../../features/auth/pages/Login'
import { Register } from '../../features/auth/pages/Register'
import { ResetPassword } from '../../features/auth/pages/ResetPassword'
import { MfaChallenge } from '../../features/auth/pages/MfaChallenge'
import { useAuthStore, UserRole } from '../store/useAuthStore'
import { ScrollToTop } from '../../shared/components/ScrollToTop'

const ResDash = lazy(() => import('../../features/dash/pages/ResDash').then(m => ({ default: m.ResDash })))
const Profile = lazy(() => import('../../features/prof/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const Account = lazy(() => import('../../features/prof/pages/AccountPage').then(m => ({ default: m.AccountPage })))
const Appearance = lazy(() => import('../../features/prof/pages/AppearancePage').then(m => ({ default: m.AppearancePage })))
const Privacy = lazy(() => import('../../features/prof/pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })))
const Notifications = lazy(() => import('../../features/prof/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
const InviteFriend = lazy(() => import('../../features/prof/pages/InviteFriendPage').then(m => ({ default: m.InviteFriendPage })))
const Support = lazy(() => import('../../features/prof/pages/SupportPage').then(m => ({ default: m.SupportPage })))
const HelpCenter = lazy(() => import('../../features/prof/pages/HelpCenterPage').then(m => ({ default: m.HelpCenterPage })))
const LegalDocument = lazy(() => import('../../features/prof/pages/LegalDocumentPage').then(m => ({ default: m.LegalDocumentPage })))
const EmergencyLines = lazy(() => import('../../features/prof/pages/EmergencyLinesPage').then(m => ({ default: m.EmergencyLinesPage })))
const Admin = lazy(() => import('../../features/admin/pages/AdminPage').then(m => ({ default: m.AdminPage })))
const IncidentsAdmin = lazy(() => import('../../features/admin/pages/IncidentsAdmin').then(m => ({ default: m.IncidentsAdmin })))
const Payroll = lazy(() => import('../../features/admin/pages/PayrollPage').then(m => ({ default: m.PayrollPage })))
const GuardPortal = lazy(() => import('../../features/guard/pages/GuardPortalPage').then(m => ({ default: m.GuardPortalPage })))
const Payments = lazy(() => import('../../features/payments/pages/PaymentsPage').then(m => ({ default: m.PaymentsPage })))
const Requests = lazy(() => import('../../features/requests/pages/RequestsPage').then(m => ({ default: m.RequestsPage })))
const Guests = lazy(() => import('../../features/guests/pages/GuestsPage').then(m => ({ default: m.GuestsPage })))
const Reservations = lazy(() => import('../../features/reservations/pages/ReservationsPage').then(m => ({ default: m.ReservationsPage })))
const Incidents = lazy(() => import('../../features/incidents/pages/IncidentsPage').then(m => ({ default: m.IncidentsPage })))
const PackageLocker = lazy(() => import('../../features/packages/pages/PackageLockerPage').then(m => ({ default: m.PackageLockerPage })))

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

const RoleRedirect = ({ role }: { role: string }) => {
  if (role === 'admin' || role === 'superadmin') return <Navigate to="/admin" />
  if (role === 'guard') return <Navigate to="/guard" />
  return <Navigate to="/dashboard" />
}

export const AppRouter = () => {
  const user = useAuthStore(state => state.user)
  const authReady = useAuthStore(state => state.authReady)
  const mfaRequired = useAuthStore(state => state.mfaRequired)
  const setMfaRequired = useAuthStore(state => state.setMfaRequired)

  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>}>
      <ScrollToTop />
      {mfaRequired ? (
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
          <Route path="/reset-password" element={<ResetPassword />} />

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
  )
}
