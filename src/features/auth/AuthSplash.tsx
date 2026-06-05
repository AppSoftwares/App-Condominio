import React from 'react'
import { useNavigate } from 'react-router-dom'

export const AuthSplash: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      backgroundColor: '#FAF8F5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '60px 24px',
      boxSizing: 'border-box',
      fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '420px',
        zIndex: 10
      }}>
        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPwdp7uHsqU1vRZWPz2cgSezTBACQTT0Gy8BQ6Q6if0vf2CFTpdQTkcjAkPwWtFVXNuaOR4GEc-EotjUx7KvjV3hkiHEJjhqKow1-rev1tmlseP7VhH8yxef2qcJOuWC8WV1ICHTO2FIflVEH_ikuYhzv8Wxe3tdX39ad5eCxaHovyjWNn_yD38hop_ZO3Y_rmmgFX889FXiT4gDoBYlWLlInRq3EPb1EHZuCSd3gGGmU1Qo2eedVhDVZ1NWVuSvsW8mMn0x3gAPg"
            alt="Logo"
            style={{ width: '220px', marginBottom: '24px' }}
          />
          <h1 style={{
            fontFamily: "'Cinzel', serif",
            color: '#0f5551',
            fontSize: '32px',
            letterSpacing: '0.2em',
            margin: '0 0 10px 0',
            fontWeight: 700
          }}>BIENVENIDO</h1>
          <p style={{ color: '#3f4947', fontSize: '14px', opacity: 0.8, margin: 0 }}>
            Excelencia y seguridad en el corazón de su comunidad.
          </p>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '18px',
              backgroundColor: '#2f6d69',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(47, 109, 105, 0.2)'
            }}
          >INGRESAR / INICIAR SESIÓN</button>

          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '18px',
              backgroundColor: 'transparent',
              color: '#785919',
              border: '2px solid #785919',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >REGISTRARSE</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', width: '100%', margin: '30px 0', gap: '15px' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#bfc8c7' }}></div>
          <span style={{ fontSize: '11px', color: '#6f7978', fontWeight: 600 }}>O CONTINUAR CON</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#bfc8c7' }}></div>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
           <SocialBtn icon="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" />
           <SocialBtn icon="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" />
           <SocialBtn icon="https://upload.wikimedia.org/wikipedia/en/0/04/Facebook_f_logo_%282021%29.svg" />
        </div>
      </main>

      <div style={{ paddingBottom: '20px', color: '#6f7978', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em' }}>
        V 2.4.0 • MANAGEMENT SUITE
      </div>
    </div>
  )
}

const SocialBtn = ({ icon }: any) => (
  <button style={{ width: '60px', height: '60px', borderRadius: '50%', border: '1px solid #bfc8c7', backgroundColor: 'white', padding: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <img src={icon} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
  </button>
)
