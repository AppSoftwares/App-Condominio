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
    const resetScroll = () => {
      if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
      }
      window.scrollTo(0, 0);
    };

    // Resetear inmediatamente
    resetScroll();

    // Resetear después de un breve delay por si el renderizado tarda
    const timeout = setTimeout(resetScroll, 100);

    return () => clearTimeout(timeout);
  }, [location.pathname, location.search])

  if (!user) return <Outlet />

  const isHome = ['/dashboard', '/admin', '/guard'].includes(location.pathname)

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
      {/* Shared Header with Back Button */}
      {!isHome && (
        <header style={{
          width: '100%',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          backgroundColor: 'var(--bg-color)',
          borderBottom: '1px solid var(--border-color)',
          zIndex: 1100,
          position: 'sticky',
          top: 0,
          marginTop: 'env(safe-area-inset-top)'
        }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary-color)',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              padding: '10px 0'
            }}
          >
            <MdArrowBackIosNew size={20} />
            <span style={{ marginLeft: '5px', fontWeight: 600 }}>Volver</span>
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
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingBottom: '20px'
        }}
      >
        <div style={{ width: '100%', maxWidth: '1200px' }}>
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
            <NavIcon
              icon={location.pathname.startsWith('/profile') ? MdPerson : MdOutlinePerson}
              active={location.pathname.startsWith('/profile')}
              onClick={() => navigate('/profile')}
              badge={isUpdateAvailable}
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
            {user.role === 'superadmin' && (
              <NavIcon
                icon={location.pathname === '/admin' && new URLSearchParams(location.search).get('tab') === 'security' ? MdBusiness : MdOutlineBusiness}
                active={location.pathname === '/admin' && new URLSearchParams(location.search).get('tab') === 'security'}
                onClick={() => navigate('/admin?tab=security')}
              />
            )}
            <NavIcon
              icon={location.pathname.startsWith('/profile') ? MdPerson : MdOutlinePerson}
              active={location.pathname.startsWith('/profile')}
              onClick={() => navigate('/profile')}
              badge={isUpdateAvailable}
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
            <NavIcon
              icon={location.pathname.startsWith('/profile') ? MdPerson : MdOutlinePerson}
              active={location.pathname.startsWith('/profile')}
                onClick={() => navigate('/profile')}
                badge={isUpdateAvailable}
            />
          </>
        )}
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
      <Icon size={26} />
    </div>
    {badge && (
      <div style={{ position: 'absolute', right: '18%', top: '6px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }} />
    )}
  </div>
)
