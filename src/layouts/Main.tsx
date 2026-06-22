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
      height: '100%',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      backgroundColor: 'var(--bg-color)',
      margin: '0 auto'
    }}>
      {/* Content Container */}
      <div style={{
        flex: 1,
        width: '100%',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingBottom: '20px'
      }}>
        <div style={{ width: '100%', maxWidth: '500px' }}>
            <Outlet />
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <nav style={{
        width: '100%',
        height: '75px',
        backgroundColor: 'var(--card-bg)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
        boxShadow: '0 -2px 15px rgba(0,0,0,0.05)',
        flexShrink: 0,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}>
        {user.role === 'guard' ? (
          <>
            <NavIcon
              icon="qr_code_scanner"
              active={location.pathname === '/guard' && (!new URLSearchParams(location.search).get('tab') || new URLSearchParams(location.search).get('tab') === 'control')}
              onClick={() => navigate('/guard?tab=control')}
            />
            <NavIcon
              icon="warning"
              active={location.pathname === '/guard' && new URLSearchParams(location.search).get('tab') === 'alerts'}
              onClick={() => navigate('/guard?tab=alerts')}
            />
            <NavIcon
              icon="history"
              active={location.pathname === '/guard' && new URLSearchParams(location.search).get('tab') === 'history'}
              onClick={() => navigate('/guard?tab=history')}
            />
            <NavIcon
              icon="person"
              active={location.pathname.startsWith('/profile')}
              onClick={() => navigate('/profile')}
            />
          </>
        ) : (
          <>
            <NavIcon
              icon="home"
              active={location.pathname === '/dashboard' || location.pathname === '/admin'}
              onClick={() => navigate((user.role === 'admin' || user.role === 'superadmin') ? '/admin' : '/dashboard')}
            />
            <NavIcon
              icon="account_tree"
              active={location.pathname === '/requests'}
              onClick={() => navigate('/requests')}
            />
            <NavIcon
              icon="account_balance_wallet"
              active={location.pathname === '/payments' || location.pathname === '/admin/payroll'}
              onClick={() => navigate((user.role === 'admin' || user.role === 'superadmin') ? '/admin/payroll' : '/payments')}
            />
            <NavIcon
              icon="bar_chart"
              active={location.pathname === '/incidents'}
              onClick={() => navigate('/incidents')}
            />
            <NavIcon
              icon="person"
              active={location.pathname.startsWith('/profile')}
              onClick={() => navigate('/profile')}
            />
          </>
        )}
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
      justifyContent: 'center',
      color: active ? 'var(--primary-color)' : 'var(--text-sub)',
      transition: 'all 0.3s ease',
      flex: 1,
      height: '100%'
    }}
  >
    <div style={{
      backgroundColor: active ? 'rgba(137, 209, 202, 0.2)' : 'transparent',
      padding: '8px 16px',
      borderRadius: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <span className="material-symbols-outlined" style={{
        fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0",
        fontSize: '26px'
      }}>
        {icon}
      </span>
    </div>
  </div>
)
