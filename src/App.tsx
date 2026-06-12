// Creado por Jesús Pirela.
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './layouts/Main'
import { Welcome } from './features/auth/Welcome'
import { AuthSplash } from './features/auth/AuthSplash'
import { Login } from './features/auth/Login'
import { Register } from './features/auth/Register'
import { ResDash } from './features/dash/ResDash'
import { Profile } from './features/prof/Profile'
import { Account } from './features/prof/Account'
import { Appearance } from './features/prof/Appearance'
import { Privacy } from './features/prof/Privacy'
import { Notifications } from './features/prof/Notifications'
import { InviteFriend } from './features/prof/InviteFriend'
import { Support } from './features/prof/Support'
import { HelpCenter } from './features/prof/HelpCenter'
import { LegalDocument } from './features/prof/LegalDocument'
import { Admin } from './features/admin/Admin'
import { Payroll } from './features/admin/Payroll'
import { GuardPortal } from './features/guard/GuardPortal'
import { Payments } from './features/res/Payments'
import { Requests } from './features/res/Requests'
import { Guests } from './features/res/Guests'
import { Reservations } from './features/res/Reservations'
import { Incidents } from './features/res/Incidents'
import { useAuthStore, UserRole } from './store/useAuthStore'
import { useCurrencyStore } from './store/useCurrencyStore'
import { useThemeStore } from './store/useThemeStore'
import { useEffect } from 'react'

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
    fetchRate()
  }, [fetchRate])

  useEffect(() => {
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
        <Route path="/" element={!user ? <Welcome /> : <RoleRedirect role={user.role} />} />
        <Route path="/auth" element={!user ? <AuthSplash /> : <RoleRedirect role={user.role} />} />
        <Route path="/login" element={!user ? <Login /> : <RoleRedirect role={user.role} />} />
        <Route path="/register" element={!user ? <Register /> : <RoleRedirect role={user.role} />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['resident']}><ResDash /></ProtectedRoute>
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

          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['resident', 'admin', 'guard']}><Profile /></ProtectedRoute>
          } />
          <Route path="/profile/account" element={
            <ProtectedRoute allowedRoles={['resident', 'admin', 'guard']}><Account /></ProtectedRoute>
          } />
          <Route path="/profile/privacy" element={
            <ProtectedRoute allowedRoles={['resident', 'admin', 'guard']}><Privacy /></ProtectedRoute>
          } />
          <Route path="/profile/appearance" element={
            <ProtectedRoute allowedRoles={['resident', 'admin', 'guard']}><Appearance /></ProtectedRoute>
          } />
          <Route path="/profile/notifications" element={
            <ProtectedRoute allowedRoles={['resident', 'admin', 'guard']}><Notifications /></ProtectedRoute>
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

        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}><Admin /></ProtectedRoute>
        } />
        <Route path="/admin/payroll" element={
          <ProtectedRoute allowedRoles={['admin']}><Payroll /></ProtectedRoute>
        } />
        <Route path="/guard" element={
          <ProtectedRoute allowedRoles={['guard']}><GuardPortal /></ProtectedRoute>
        } />

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
