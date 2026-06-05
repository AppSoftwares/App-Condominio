import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export const MainLayout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  if (!user) return <Outlet />

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#FAF8F5' }}>
      {/* Scrollable Content Container with Padding for Bottom Nav */}
      <div style={{
        flex: 1,
        paddingBottom: '100px', // Space for the fixed bottom nav
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}>
        <Outlet />
      </div>

      {/* Bottom Navigation Bar - FIXED ON ALL SCREENS */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        height: '80px',
        backgroundColor: 'white',
        borderTop: '1px solid #bfc8c7',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.02)'
      }}>
        <NavIcon
          icon="home"
          label="Inicio"
          active={location.pathname === '/dashboard'}
          onClick={() => navigate('/dashboard')}
        />
        <NavIcon
          icon="rebase_edit"
          label="Solicitudes"
          active={location.pathname === '/requests'}
          onClick={() => navigate('/requests')}
        />
        <NavIcon
          icon="payments"
          label="Pagos"
          active={location.pathname === '/payments'}
          onClick={() => navigate('/payments')}
        />
        <NavIcon
          icon="person"
          label="Perfil"
          active={location.pathname.startsWith('/profile')}
          onClick={() => navigate('/profile')}
        />
      </nav>
    </div>
  )
}

const NavIcon = ({ icon, label, active, onClick }: any) => (
  <div
    onClick={onClick}
    style={{
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      color: active ? '#271900' : '#6f7978',
      transition: 'all 0.3s ease',
      width: '70px',
      overflow: 'hidden'
    }}
  >
    <div style={{
      backgroundColor: active ? '#ffdea6' : 'transparent',
      padding: '4px 16px',
      borderRadius: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <span className="material-symbols-outlined" style={{
        fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
        fontSize: '24px'
      }}>
        {icon}
      </span>
    </div>
    <span style={{ fontSize: '10px', fontWeight: active ? 700 : 500, whiteSpace: 'nowrap' }}>{label}</span>
  </div>
)
