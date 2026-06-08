import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Logo } from '../../components/Logo'

export const Welcome: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      height: '100vh', width: '100vw', backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px', boxSizing: 'border-box'
    }}>
       <div style={{ animation: 'fadeIn 1.5s ease', maxWidth: '400px', width: '100%' }}>
          <Logo height={140} style={{ marginBottom: '40px', justifyContent: 'center' }} />
          <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '42px', color: 'var(--primary-color)', margin: '0 0 15px 0', lineHeight: 1.1, fontWeight: 700 }}>Bienvenido a su Hogar</h1>
          <div style={{ width: '50px', height: '4px', backgroundColor: 'var(--accent-gold)', margin: '0 auto 25px', borderRadius: '2px' }}></div>
          <p style={{ color: 'var(--text-sub)', fontSize: '18px', margin: '0 auto 50px', lineHeight: '1.6', fontWeight: 500 }}>
            La plataforma exclusiva para residentes de Caminos de la Lagunita.
          </p>
          <button
            onClick={() => navigate('/auth')}
            style={{ width: '100%', padding: '20px 40px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 700, fontSize: '18px', cursor: 'pointer', boxShadow: '0 12px 25px rgba(15,85,81,0.2)' }}
          >
            Comenzar Experiencia
          </button>
       </div>
    </div>
  )
}
