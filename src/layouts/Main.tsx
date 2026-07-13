import React from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  MdOutlineHome,
  MdOutlineGroups,
  MdOutlineAccountBalanceWallet,
  MdOutlineBarChart,
  MdOutlinePerson,
  MdOutlineQrCodeScanner,
  MdOutlineWarningAmber,
  MdOutlineHistory,
  MdHome,
  MdGroups,
  MdAccountBalanceWallet,
  MdBarChart,
  MdPerson,
  MdQrCodeScanner,
  MdWarning,
  MdHistory,
  MdArrowBackIosNew,
  MdOutlineBusiness,
  MdPeople,
  MdOutlinePeople,
  MdHowToVote,
  MdOutlineHowToVote,
  MdPayments,
  MdOutlinePayments,
  MdBusiness,
  MdReceiptLong,
  MdOutlineReceiptLong
} from 'react-icons/md'
import { useAuthStore } from '../store/useAuthStore'
import { useUpdateStore } from '../store/useUpdateStore'

export const Layout: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const isUpdateAvailable = useUpdateStore(state => state.isUpdateAvailable)
  const contentRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo(0, 0)
    }
  }, [location.pathname, location.search])

  if (!user) return <Outlet />

  const isHome = ['/dashboard', '/admin', '/guard'].includes(location.pathname)

  return (
    <div style={{
      height: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-color)',
      overflow: 'hidden'
    }}>
      {/* Shared Header with Back Button */}
      {!isHome && (
        <header style={{
          width: '100%',
          height: 'calc(60px + env(safe-area-inset-top))',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '0 20px 15px',
          backgroundColor: 'var(--bg-color)',
          borderBottom: '1px solid var(--border-color)',
          zIndex: 1100,
          boxSizing: 'border-box'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <MdArrowBackIosNew size={22} />
            <span style={{ marginLeft: '8px', fontWeight: 700, fontSize: '16px' }}>Volver</span>
          </button>
        </header>
      )}

      {/* Content Container */}
      <div
        ref={contentRef}
        style={{
          flex: 1,
          width: '100%',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div style={{ width: '100%', maxWidth: '100%', margin: '0 auto' }}>
            <Outlet />
        </div>
      </div>

      {/* Fixed Bottom Navigation Bar */}
      <nav style={{
        width: '100%',
        height: 'calc(65px + env(safe-area-inset-bottom))',
        backgroundColor: 'var(--card-bg)',
        borderTop: '1px solid var(--border-color)',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        paddingTop: '12px',
        zIndex: 1000,
        boxShadow: '0 -2px 20px rgba(0,0,0,0.08)',
        boxSizing: 'border-box'
      }}>
        {user.role === 'guard' ? (
          <>
            <NavIcon
              icon={location.pathname === '/guard' && (!new URLSearchParams(location.search).get('tab') || new URLSearchParams(location.search).get('tab') === 'control') ? MdQrCodeScanner : MdOutlineQrCodeScanner}
              active={location.pathname === '/guard' && (!new URLSearchParams(location.search).get('tab') || new URLSearchParams(location.search).get('tab') === 'control')}
              onClick={() => navigate('/guard?tab=control')}
            />
            <NavIcon
              icon={location.pathname === '/guard' && new URLSearchParams(location.search).get('tab') === 'alerts' ? MdWarning : MdOutlineWarningAmber}
              active={location.pathname === '/guard' && new URLSearchParams(location.search).get('tab') === 'alerts'}
              onClick={() => navigate('/guard?tab=alerts')}
            />
            <NavIcon
              icon={location.pathname === '/guard' && new URLSearchParams(location.search).get('tab') === 'history' ? MdHistory : MdOutlineHistory}
              active={location.pathname === '/guard' && new URLSearchParams(location.search).get('tab') === 'history'}
              onClick={() => navigate('/guard?tab=history')}
            />
          </>
        ) : (user.role === 'admin' || user.role === 'superadmin') ? (
          <>
            <NavIcon
              icon={location.pathname === '/admin' && (!new URLSearchParams(location.search).get('tab') || new URLSearchParams(location.search).get('tab') === 'finance') ? MdHome : MdOutlineHome}
              active={location.pathname === '/admin' && (!new URLSearchParams(location.search).get('tab') || new URLSearchParams(location.search).get('tab') === 'finance')}
              onClick={() => navigate('/admin?tab=finance')}
            />
            <NavIcon
              icon={location.pathname === '/admin' && new URLSearchParams(location.search).get('tab') === 'users' ? MdPeople : MdOutlinePeople}
              active={location.pathname === '/admin' && new URLSearchParams(location.search).get('tab') === 'users'}
              onClick={() => navigate('/admin?tab=users')}
            />
            <NavIcon
              icon={location.pathname === '/admin' && new URLSearchParams(location.search).get('tab') === 'payments' ? MdReceiptLong : MdOutlineReceiptLong}
              active={location.pathname === '/admin' && new URLSearchParams(location.search).get('tab') === 'payments'}
              onClick={() => navigate('/admin?tab=payments')}
            />
            <NavIcon
              icon={location.pathname === '/admin/payroll' ? MdPayments : MdOutlinePayments}
              active={location.pathname === '/admin/payroll'}
              onClick={() => navigate('/admin/payroll')}
            />
          </>
        ) : (
          <>
            <NavIcon
              icon={location.pathname === '/dashboard' ? MdHome : MdOutlineHome}
              active={location.pathname === '/dashboard'}
              onClick={() => navigate('/dashboard')}
            />
            <NavIcon
              icon={location.pathname === '/requests' ? MdGroups : MdOutlineGroups}
              active={location.pathname === '/requests'}
              onClick={() => navigate('/requests')}
            />
            <NavIcon
              icon={location.pathname === '/payments' ? MdAccountBalanceWallet : MdOutlineAccountBalanceWallet}
              active={location.pathname === '/payments'}
              onClick={() => navigate('/payments')}
            />
            <NavIcon
              icon={location.pathname === '/incidents' ? MdBarChart : MdOutlineBarChart}
              active={location.pathname === '/incidents'}
              onClick={() => navigate('/incidents')}
            />
          </>
        )}
        <NavIcon
          icon={location.pathname.startsWith('/profile') ? MdPerson : MdOutlinePerson}
          active={location.pathname.startsWith('/profile')}
          onClick={() => navigate('/profile')}
          badge={isUpdateAvailable}
        />
      </nav>
    </div>
  )
}


const NavIcon = ({ icon: Icon, active, onClick, badge }: any) => (
  <div
    onClick={onClick}
    style={{
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: active ? 'var(--primary-color)' : 'var(--text-sub)',
      transition: 'all 0.2s ease',
      flex: 1,
      position: 'relative'
    }}
  >
    <div style={{
      backgroundColor: active ? 'rgba(15, 85, 81, 0.1)' : 'transparent',
      padding: '8px 16px',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Icon size={26} />
    </div>
    {badge && (
      <div style={{ position: 'absolute', right: '25%', top: '2px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid var(--card-bg)' }} />
    )}
  </div>
)
