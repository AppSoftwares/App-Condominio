import React from 'react'
import { useNavigate } from 'react-router-dom'

export const Guests: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', fontFamily: "'Inter', sans-serif", color: '#1B1C1A', paddingBottom: '100px' }}>
      <header style={{ position: 'fixed', top: 0, width: '100%', height: '64px', backgroundColor: 'white', borderBottom: '1px solid #bfc8c7', display: 'flex', alignItems: 'center', padding: '0 20px', zIndex: 100, boxSizing: 'border-box' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '18px', marginLeft: '15px', color: '#0f5551', fontWeight: 700 }}>Acceso de Invitados</h1>
      </header>

      <main style={{ paddingTop: '84px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '20px', padding: '24px', marginBottom: '30px' }}>
           <h3 style={{ fontSize: '20px', color: '#0f5551', marginBottom: '20px', fontWeight: 700 }}>Autorizar Nuevo Invitado</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                 <label style={labelStyle}>Nombre del Invitado</label>
                 <input placeholder="Nombre completo" style={inputStyle} />
              </div>
              <div>
                 <label style={labelStyle}>Documento ID</label>
                 <input placeholder="Cédula o Pasaporte" style={inputStyle} />
              </div>
              <button style={{ width: '100%', padding: '16px', backgroundColor: '#2f6d69', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Generar Pase QR</button>
           </div>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '15px' }}>Invitados Recientes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
           <GuestCard name="Maria Garcia" status="Activo" date="Hoy, 2:00 PM" />
           <GuestCard name="Ricardo Mendoza" status="Finalizado" date="Ayer, 10:00 AM" />
        </div>
      </main>
    </div>
  )
}

const GuestCard = ({ name, status, date }: any) => (
  <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '12px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
     <div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>{name}</p>
        <p style={{ margin: 0, fontSize: '12px', color: '#6f7978' }}>{date}</p>
     </div>
     <span style={{ fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', backgroundColor: status === 'Activo' ? '#d3e8d0' : '#efeeeb', color: status === 'Activo' ? '#0e1f10' : '#6f7978' }}>{status.toUpperCase()}</span>
  </div>
)

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 700, color: '#3d503e', marginBottom: '8px', textTransform: 'uppercase' as const }
const inputStyle = { width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #bfc8c7', fontSize: '15px', boxSizing: 'border-box' as const, outline: 'none' }
