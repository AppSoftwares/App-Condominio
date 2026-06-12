import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const Support: React.FC = () => {
  const navigate = useNavigate()
  const [type, setStep] = useState<'help' | 'feedback' | 'claim' | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      alert("Su mensaje ha sido enviado al equipo de soporte. Le contactaremos pronto.")
      setLoading(false)
      setMessage('')
      setStep(null)
    }, 1500)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', fontFamily: "'Inter', sans-serif", color: '#1B1C1A', paddingBottom: '40px' }}>
      <header style={{
        position: 'fixed', top: 0, width: '100%', height: '64px', backgroundColor: '#FAF8F5',
        borderBottom: '1px solid #bfc8c7', display: 'flex', alignItems: 'center', padding: '0 20px',
        zIndex: 100, boxSizing: 'border-box'
      }}>
        <button
          onClick={() => type ? setStep(null) : navigate('/profile')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#1B1C1A' }}>arrow_back</span>
        </button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '18px', marginLeft: '15px', color: '#0f5551', fontWeight: 700, textTransform: 'uppercase' }}>Soporte y Ayuda</h1>
      </header>

      <main style={{ paddingTop: '84px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '500px', margin: '0 auto' }}>

        {!type ? (
          <>
            <p style={{ color: '#3f4947', fontSize: '14px', marginBottom: '30px', textAlign: 'center' }}>¿En qué podemos ayudarte hoy?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <SupportOption
                icon="help_outline"
                label="Centro de Ayuda"
                desc="Preguntas frecuentes y tutoriales"
                color="#d3e8d0"
                onClick={() => navigate('/profile/help')}
              />
              <SupportOption
                icon="chat_bubble_outline"
                label="Enviar Comentario"
                desc="Sugerencias para mejorar la app"
                color="#ffdea6"
                onClick={() => setStep('feedback')}
              />
              <SupportOption
                icon="report_gmailerrorred"
                label="Realizar un Reclamo"
                desc="Reportar fallas técnicas o de servicio"
                color="#ffdad6"
                onClick={() => setStep('claim')}
              />
            </div>

            <div style={{ marginTop: '40px', textAlign: 'center', padding: '20px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #bfc8c7' }}>
               <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f5551', marginBottom: '10px' }}>Contacto Directo</p>
               <p style={{ fontSize: '13px', color: '#3f4947', marginBottom: '15px' }}>Lunes a Viernes: 8:00 AM - 5:00 PM</p>
               <button style={{ backgroundColor: '#2f6d69', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Llamar a Administración</button>
            </div>
          </>
        ) : (
          <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '20px', color: '#0f5551', marginBottom: '10px', fontWeight: 700 }}>
              {type === 'help' ? 'Ayuda' : type === 'feedback' ? 'Comentario' : 'Reclamo'}
            </h3>
            <p style={{ fontSize: '13px', color: '#3f4947', marginBottom: '24px' }}>Escriba los detalles a continuación y le responderemos a la brevedad.</p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#3d503e', marginBottom: '8px', textTransform: 'uppercase' }}>Mensaje</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Escriba aquí..."
                    style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #bfc8c7', fontSize: '15px', height: '150px', resize: 'none', boxSizing: 'border-box' }}
                  />
               </div>
               <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: '#2f6d69', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }}>
                  {loading ? 'Enviando...' : 'Enviar Mensaje'}
               </button>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}

const SupportOption = ({ icon, label, desc, color, onClick }: any) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '15px', padding: '20px',
      backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '16px',
      cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'transform 0.2s'
    }}
  >
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#1B1C1A' }}>{icon}</span>
    </div>
    <div style={{ flex: 1 }}>
       <span style={{ fontWeight: 700, fontSize: '16px', color: '#1B1C1A', display: 'block' }}>{label}</span>
       <span style={{ fontSize: '12px', color: '#6f7978' }}>{desc}</span>
    </div>
    <span className="material-symbols-outlined" style={{ color: '#bfc8c7' }}>chevron_right</span>
  </button>
)
