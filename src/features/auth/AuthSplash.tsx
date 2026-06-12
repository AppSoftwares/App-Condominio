import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../../components/Logo'
import { supabase } from '../../lib/supabase'

export const AuthSplash: React.FC = () => {
  const navigate = useNavigate()

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      })
      if (error) throw error
    } catch (error: any) {
      alert(`Error al iniciar sesión con ${provider}: ${error.message}`)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
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

        {/* 6. Footer Version */}
        <div style={{ color: '#6f7978', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', opacity: 0.5, marginTop: '10px' }}>
          V 2.4.0 • SOFTWARE DE APLICACIONES JP
        </div>
      </main>
    </div>
  )
}

const SocialBtn = ({ icon, onClick }: any) => (
  <button
    onClick={onClick}
    style={{ width: '54px', height: '54px', borderRadius: '50%', border: '1px solid #bfc8c7', backgroundColor: 'white', padding: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
  >
    <img src={icon} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="social" />
  </button>
)
