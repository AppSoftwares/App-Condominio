import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../../components/Logo'

export const Splash: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      height: '100vh', width: '100vw', backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
    }}>
       {/* Background Decoration */}
       <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', backgroundColor: 'var(--icon-bg)', zIndex: 0, border: '2px solid var(--accent-gold)', opacity: 0.3 }}></div>
       <div style={{ position: 'absolute', bottom: '-50px', left: '-50px', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'var(--icon-bg)', zIndex: 0, border: '2px solid var(--accent-gold)', opacity: 0.3 }}></div>

       <main style={{ zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', textAlign: 'center' }}>
          <Logo height={100} style={{ marginBottom: '40px' }} />

          <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '38px', color: 'var(--primary-color)', margin: '0 0 10px 0', fontWeight: 700 }}>Caminos de la Lagunita</h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'var(--text-sub)', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '60px' }}>Exclusividad y Seguridad</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '300px' }}>
             <button
              onClick={() => navigate('/login')}
              style={{
                padding: '18px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(15,85,81,0.2)'
              }}
             >
                INICIAR SESIÓN
             </button>
             <button
              onClick={() => navigate('/register')}
              style={{
                padding: '18px', backgroundColor: 'transparent', color: 'var(--primary-color)', border: '2px solid var(--primary-color)', borderRadius: '15px', fontWeight: 700, fontSize: '16px', cursor: 'pointer'
              }}
             >
                SOLICITAR ACCESO
             </button>
          </div>
       </main>

       <footer style={{ position: 'absolute', bottom: '40px', fontSize: '11px', color: 'var(--text-sub)', letterSpacing: '2px' }}>
          HERITAGE RESIDENTIAL SYSTEM • 2024
       </footer>
    </div>
  )
}
