import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../../components/Logo'

export const AuthSplash: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#FAF8F5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      boxSizing: 'border-box',
      fontFamily: "'Inter', sans-serif",
      overflowX: 'hidden'
    }}>
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '450px',
        gap: '24px',
        textAlign: 'center'
      }}>
        {/* 1. Official Logo at the Top */}
        <Logo height={90} style={{ justifyContent: 'center', marginBottom: '10px' }} />

        {/* 2. Illustration Image (Building) */}
        <div style={{
          width: '100%',
          aspectRatio: '16 / 9',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '24px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border-color)'
        }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcbvZDDo0T_0wDyT_PYJVGqDNBAxtIjBv3bSGWh6KNk9DSCLk_AKpN4FRiFbvq1bPZsgDk3D47671D39xbXII1TlEwqdq8EFpoMSDawb9yFTSDfnFNAO-XIpU_bwLHfIKmN8t-GaILN6SOhDYG9jlk-h6MwgnZ-8OtBcVrNs2T-THiJqffrqRTV0IVIIbVYK7F7ptnVXarj-GvBf0ksJDk5v5--SYsMx8W_xusghrDluU7FelQzuyubB9KtRwW7UbOxN-lyaGuAf4"
            alt="Caminos View"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }}
          />
        </div>

        {/* 3. Welcome Text */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: "'EB Garamond', serif",
            color: 'var(--primary-color)',
            fontSize: '42px',
            letterSpacing: '0.05em',
            margin: '10px 0 12px 0',
            fontWeight: 700,
            lineHeight: 1.1
          }}>BIENVENIDO</h1>
          <div style={{ width: '40px', height: '3px', backgroundColor: 'var(--accent-gold)', margin: '0 auto 15px', borderRadius: '2px' }}></div>
          <p style={{ color: 'var(--text-sub)', fontSize: '16px', maxWidth: '320px', margin: '0 auto', lineHeight: '1.6', fontWeight: 500 }}>
            Excelencia y seguridad en el corazón de su comunidad.
          </p>
        </div>

        {/* 4. Action Buttons */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '20px',
              backgroundColor: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              boxShadow: '0 8px 20px rgba(15,85,81,0.2)'
            }}
          >INGRESAR / INICIAR SESIÓN</button>

          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '20px',
              backgroundColor: 'transparent',
              color: 'var(--accent-gold)',
              border: '2px solid var(--accent-gold)',
              borderRadius: '16px',
              fontWeight: 700,
              fontSize: '15px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >SOLICITAR ACCESO</button>
        </div>

        {/* 5. Social Login Section */}
        <div style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '15px 0', gap: '15px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#bfc8c7', opacity: 0.5 }}></div>
            <span style={{ fontSize: '11px', color: '#6f7978', fontWeight: 600, letterSpacing: '1px' }}>O CONTINUAR CON</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#bfc8c7', opacity: 0.5 }}></div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
             <SocialBtn icon="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" />
             <SocialBtn icon="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" />
             <SocialBtn icon="https://upload.wikimedia.org/wikipedia/en/0/04/Facebook_f_logo_%282021%29.svg" />
          </div>
        </div>

        {/* 6. Footer Version */}
        <div style={{ color: '#6f7978', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', opacity: 0.5, marginTop: '10px' }}>
          V 2.4.0 • MANAGEMENT SUITE
        </div>
      </main>
    </div>
  )
}

const SocialBtn = ({ icon }: any) => (
  <button style={{ width: '54px', height: '54px', borderRadius: '50%', border: '1px solid #bfc8c7', backgroundColor: 'white', padding: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
    <img src={icon} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="social" />
  </button>
)
