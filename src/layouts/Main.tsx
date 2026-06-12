import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/useAuthStore'

export const Layout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  if (!user) return <Outlet />

  return (
    <div style={{
      minHeight: '100dvh',
      width: '100%',
      overflowX: 'hidden',
      position: 'relative',
      backgroundColor: 'var(--bg-color)',
      transition: 'background-color 0.3s ease'
    }}>
      {/* Content Container */}
      <div style={{
        paddingBottom: '80px', // Matches Nav height
        WebkitOverflowScrolling: 'touch',
        width: '100%',
        overflowX: 'hidden'
      }}>
        <Outlet />
      </div>

      {/* Bottom Navigation Bar - FIXED ON ALL SCREENS */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        width: '100%',
        height: '80px',
        backgroundColor: 'var(--card-bg)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
        transition: 'all 0.3s ease'
      }}>
        <NavIcon
          icon="home"
          active={location.pathname === '/dashboard'}
          onClick={() => navigate('/dashboard')}
        />
        <NavIcon
          icon="rebase_edit"
          active={location.pathname === '/requests'}
          onClick={() => navigate('/requests')}
        />
        <NavIcon
          icon="payments"
          active={location.pathname === '/payments'}
          onClick={() => navigate('/payments')}
        />
        <NavIcon
          icon="person"
          active={location.pathname.startsWith('/profile')}
          onClick={() => navigate('/profile')}
        />
      </nav>
    </div>
  )
}

const NavIcon = ({ icon, active, onClick }: any) => (
  <div
    onClick={onClick}
    style={{
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      color: active ? 'var(--primary-color)' : 'var(--text-sub)',
      transition: 'all 0.3s ease',
      width: '70px',
      overflow: 'hidden'
    }}
  >
    <div style={{
      backgroundColor: active ? 'rgba(137, 209, 202, 0.15)' : 'transparent',
      padding: '8px 20px',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <span className="material-symbols-outlined" style={{
        fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
        fontSize: '28px'
      }}>
        {icon}
      </span>
    </div>
  </div>
)
