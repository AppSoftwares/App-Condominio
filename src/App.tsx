import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { Welcome } from './features/auth/Welcome'
import { AuthSplash } from './features/auth/AuthSplash'
import { Login } from './features/auth/Login'
import { Register } from './features/auth/Register'
import { ResidentDashboard } from './features/dashboard/ResidentDashboard'
import { Profile } from './features/profile/Profile'
import { AccountSettings } from './features/profile/AccountSettings'
import { AppearanceSettings } from './features/profile/AppearanceSettings'
import { PrivacySecurity } from './features/profile/PrivacySecurity'
import { NotificationSettings } from './features/profile/NotificationSettings'
import { InviteFriend } from './features/profile/InviteFriend'
import { Support } from './features/profile/Support'
import { HelpCenter } from './features/profile/HelpCenter'
import { LegalDocument } from './features/profile/LegalDocument'
import { AdminManagement } from './features/admin/AdminManagement'
import { PayrollManagement } from './features/admin/PayrollManagement'
import { GuardPortal } from './features/guard/GuardPortal'
import { Payments } from './features/resident/Payments'
import { Requests } from './features/resident/Requests'
import { Guests } from './features/resident/Guests'
import { Reservations } from './features/resident/Reservations'
import { Incidents } from './features/resident/Incidents'
import { useAuthStore, UserRole } from './store/useAuthStore'
import { useCurrencyStore } from './store/useCurrencyStore'
import { useThemeStore } from './store/useThemeStore'
import { useEffect } from 'react'

// SEGURIDAD: Componente para proteger rutas por rol
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: UserRole[] }) => {
  const user = useAuthStore(state => state.user)

  if (!user) return <Navigate to="/login" />
  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" />
    if (user.role === 'guard') return <Navigate to="/guard" />
    return <Navigate to="/dashboard" />
  }

  return <>{children}</>
}

function App() {
  const user = useAuthStore(state => state.user)
  const fetchRate = useCurrencyStore(state => state.fetchRate)
  const isDarkMode = useThemeStore(state => state.isDarkMode)

  useEffect(() => {
    // Actualizar tasa BCV al iniciar la app
    fetchRate()
  }, [fetchRate])

  useEffect(() => {
    // Aplicar clase de modo oscuro al body para estilos globales
    if (isDarkMode) {
      document.body.classList.add('dark-mode')
      document.body.style.backgroundColor = '#1B1C1A'
    } else {
      document.body.classList.remove('dark-mode')
      document.body.style.backgroundColor = '#FAF8F5'
    }
  }, [isDarkMode])

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={!user ? <Welcome /> : <RoleRedirect role={user.role} />} />
        <Route path="/auth" element={!user ? <AuthSplash /> : <RoleRedirect role={user.role} />} />
        <Route path="/login" element={!user ? <Login /> : <RoleRedirect role={user.role} />} />
        <Route path="/register" element={!user ? <Register /> : <RoleRedirect role={user.role} />} />

        {/* Protected App Routes with Persistent Bottom Nav */}
        <Route element={<MainLayout />}>
          {/* Resident Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['resident']}><ResidentDashboard /></ProtectedRoute>
          } />
          <Route path="/payments" element={
            <ProtectedRoute allowedRoles={['resident']}><Payments /></ProtectedRoute>
          } />
          <Route path="/requests" element={
            <ProtectedRoute allowedRoles={['resident']}><Requests /></ProtectedRoute>
          } />
          <Route path="/guests" element={
            <ProtectedRoute allowedRoles={['resident']}><Guests /></ProtectedRoute>
          } />
          <Route path="/reservations" element={
            <ProtectedRoute allowedRoles={['resident']}><Reservations /></ProtectedRoute>
          } />
          <Route path="/incidents" element={
            <ProtectedRoute allowedRoles={['resident']}><Incidents /></ProtectedRoute>
          } />

          {/* Profile Routes (Common) */}
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['resident', 'admin', 'guard']}><Profile /></ProtectedRoute>
          } />
          <Route path="/profile/account" element={
            <ProtectedRoute allowedRoles={['resident', 'admin', 'guard']}><AccountSettings /></ProtectedRoute>
          } />
          <Route path="/profile/privacy" element={
            <ProtectedRoute allowedRoles={['resident', 'admin', 'guard']}><PrivacySecurity /></ProtectedRoute>
          } />
          <Route path="/profile/appearance" element={
            <ProtectedRoute allowedRoles={['resident', 'admin', 'guard']}><AppearanceSettings /></ProtectedRoute>
          } />
          <Route path="/profile/notifications" element={
            <ProtectedRoute allowedRoles={['resident', 'admin', 'guard']}><NotificationSettings /></ProtectedRoute>
          } />
          <Route path="/profile/invite" element={
            <ProtectedRoute allowedRoles={['resident', 'admin', 'guard']}><InviteFriend /></ProtectedRoute>
          } />
          <Route path="/profile/support" element={
            <ProtectedRoute allowedRoles={['resident', 'admin', 'guard']}><Support /></ProtectedRoute>
          } />
          <Route path="/profile/help" element={
            <ProtectedRoute allowedRoles={['resident', 'admin', 'guard']}><HelpCenter /></ProtectedRoute>
          } />
          <Route path="/profile/legal" element={
            <ProtectedRoute allowedRoles={['resident', 'admin', 'guard']}><LegalDocument /></ProtectedRoute>
          } />
        </Route>

        {/* Independent Layout Sections */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}><AdminManagement /></ProtectedRoute>
        } />
        <Route path="/admin/payroll" element={
          <ProtectedRoute allowedRoles={['admin']}><PayrollManagement /></ProtectedRoute>
        } />
        <Route path="/guard" element={
          <ProtectedRoute allowedRoles={['guard']}><GuardPortal /></ProtectedRoute>
        } />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  )
}

const RoleRedirect = ({ role }: { role: string }) => {
  if (role === 'admin') return <Navigate to="/admin" />
  if (role === 'guard') return <Navigate to="/guard" />
  return <Navigate to="/dashboard" />
}

export default App
