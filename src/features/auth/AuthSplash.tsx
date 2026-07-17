import React from 'react'
import { useNavigate } from 'react-router-dom'
import icono from '../../assets/icono.png'

import { version } from '../../../package.json'

const APP_VERSION = version

export const AuthSplash: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      height: '100vh',
      width: '100%',
      backgroundColor: 'var(--bg-color)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'calc(40px + env(safe-area-inset-top)) 24px calc(40px + env(safe-area-inset-bottom))',
      boxSizing: 'border-box',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background elements to fill space gracefully */}
      <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'rgba(18, 184, 163, 0.05)', zIndex: 0 }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '250px', height: '250px', borderRadius: '50%', backgroundColor: 'rgba(120, 89, 25, 0.05)', zIndex: 0 }}></div>

      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '400px',
        gap: '20px',
        textAlign: 'center',
        zIndex: 1,
        flex: 1,
        justifyContent: 'center'
      }}>
        <img src={icono} alt="Logo" style={{ width: '140px', height: 'auto', marginBottom: '8px' }} />
        <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: 'rgba(15,85,81,0.72)', letterSpacing: '0.14em' }}>
          versión {APP_VERSION}
        </p>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontFamily: "'EB Garamond', serif",
            color: 'var(--primary-color)',
            fontSize: '28px',
            margin: '0 0 12px 0',
            fontWeight: 700,
            lineHeight: 1.2
          }}>Tu condominio en su versión más inteligente.</h1>
          <div style={{ width: '40px', height: '3px', backgroundColor: 'var(--accent-gold)', margin: '0 auto 16px', borderRadius: '2px' }}></div>
          <p style={{ color: 'var(--text-sub)', fontSize: '15px', margin: '0 auto', lineHeight: '1.5', fontWeight: 500 }}>
            La plataforma integral que simplifica la administración, los pagos y la convivencia en cualquier conjunto, residencia o edificio.
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '18px',
              backgroundImage: 'linear-gradient(135deg, #12b8a3 0%, #0f5551 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              letterSpacing: '0.5px',
              boxShadow: '0 8px 20px rgba(15,85,81,0.2)'
            }}
          >INGRESAR / INICIAR SESIÓN</button>

          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '18px',
              backgroundColor: 'transparent',
              color: 'var(--accent-gold)',
              border: '2px solid var(--accent-gold)',
              borderRadius: '16px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              letterSpacing: '0.5px'
            }}
          >SOLICITAR ACCESO</button>
        </div>
      </main>
    </div>
  )
}
