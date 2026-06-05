import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

interface Alert {
  tag: string
  text: string
  time: string
  isPush?: boolean
}

export const Requests: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [alerts, setAlerts] = useState<Alert[]>([
    { tag: "Ruidos", text: "Exceso de ruido - Casa 14-05", time: "Hace 10 min" },
    { tag: "Mascotas", text: "Desechos en áreas comunes", time: "Hace 2 horas" }
  ])

  const [category, setCategory] = useState('Ruidos / Música')
  const [house, setHouse] = useState('')
  const [description, setDescription] = useState('')
  const [showPush, setShowPush] = useState(false)

  const handleSendReport = () => {
    if (!description) return alert("Por favor describa el incidente")

    // 1. Simular la lógica de Notificación PUSH a la casa afectada
    setShowPush(true)

    // 2. Documentar en Alertas de Comunidad (Estado Local)
    const newAlert: Alert = {
      tag: category.split(' / ')[0],
      text: `${category.split(' / ')[0]} - Casa ${house}`,
      time: "Ahora mismo",
      isPush: true
    }

    setAlerts([newAlert, ...alerts])

    // Limpiar formulario
    setDescription('')

    // Ocultar notificación visual después de 4 segundos
    setTimeout(() => setShowPush(false), 4000)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', fontFamily: "'Inter', sans-serif", color: '#1B1C1A', paddingBottom: '100px' }}>

      {/* Simulación de Notificación PUSH (Visual) */}
      {showPush && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
          width: '90%', maxWidth: '400px', backgroundColor: '#30312f', color: 'white',
          padding: '15px 20px', borderRadius: '12px', zIndex: 1000, display: 'flex',
          alignItems: 'center', gap: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          animation: 'slideDown 0.5s ease-out'
        }}>
          <div style={{ backgroundColor: '#ffdea6', borderRadius: '8px', padding: '8px', color: '#271900' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>notifications_active</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>PUSH: Alerta Enviada</p>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>Notificación enviada a la casa {house} para acción inmediata.</p>
          </div>
        </div>
      )}

      <header style={{ position: 'fixed', top: 0, width: '100%', height: '64px', backgroundColor: 'white', borderBottom: '1px solid #bfc8c7', display: 'flex', alignItems: 'center', padding: '0 20px', zIndex: 100, boxSizing: 'border-box' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '18px', marginLeft: '15px', color: '#0f5551', fontWeight: 700 }}>Reportes y Solicitudes</h1>
      </header>

      <main style={{ paddingTop: '84px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '20px', padding: '24px', marginBottom: '30px' }}>
          <h3 style={{ fontSize: '20px', color: '#0f5551', marginBottom: '8px', fontWeight: 700 }}>Nuevo Reporte</h3>
          <p style={{ fontSize: '12px', color: '#785919', marginBottom: '20px', fontWeight: 600 }}>Conjunto: {user?.residential_cluster || 'No configurado'}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                   <label style={labelStyle}>Categoría</label>
                   <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                      <option>Ruidos / Música</option>
                      <option>Mascotas / Desechos</option>
                      <option>Infraestructura</option>
                      <option>Seguridad</option>
                   </select>
                </div>
                <div>
                   <label style={labelStyle}>Número de Casa</label>
                   <input
                    placeholder="Ej: 14-31"
                    value={house}
                    onChange={(e) => setHouse(e.target.value)}
                    style={inputStyle}
                   />
                </div>
             </div>
             <div>
                <label style={labelStyle}>Descripción del Incidente</label>
                <textarea
                  placeholder="Describa brevemente lo sucedido..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ ...inputStyle, height: '120px', resize: 'none' }}
                />
             </div>
             <button
              onClick={handleSendReport}
              style={{ width: '100%', padding: '16px', backgroundColor: '#2f6d69', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
             >
               Enviar Reporte
             </button>
          </div>
        </div>

        {/* Recent Alerts */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Alertas de la Comunidad</h3>
          <span style={{ fontSize: '11px', color: '#6f7978', fontWeight: 600 }}>Historial Público</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
           {alerts.map((alert, index) => (
             <AlertItem key={index} tag={alert.tag} text={alert.text} time={alert.time} highlight={alert.isPush} />
           ))}
        </div>
      </main>

      <style>{`
        @keyframes slideDown {
          from { top: -100px; opacity: 0; }
          to { top: 20px; opacity: 1; }
        }
      `}</style>
    </div>
  )
}

const AlertItem = ({ tag, text, time, highlight }: any) => (
  <div style={{
    backgroundColor: 'white',
    border: highlight ? '2px solid #ffdea6' : '1px solid #bfc8c7',
    borderRadius: '12px',
    padding: '15px',
    boxShadow: highlight ? '0 4px 15px rgba(255,222,166,0.2)' : 'none',
    transition: 'all 0.3s ease'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
       <span style={{
         fontSize: '10px',
         fontWeight: 800,
         padding: '2px 8px',
         borderRadius: '4px',
         backgroundColor: tag === 'Ruidos' ? '#ffdad6' : '#d3e8d0',
         color: tag === 'Ruidos' ? '#ba1a1a' : '#0e1f10'
       }}>{tag.toUpperCase()}</span>
       <span style={{ fontSize: '11px', color: '#6f7978' }}>{time}</span>
    </div>
    <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{text}</p>
  </div>
)

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 700, color: '#3d503e', marginBottom: '8px', textTransform: 'uppercase' as const }
const inputStyle = { width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #bfc8c7', fontSize: '15px', boxSizing: 'border-box' as const, outline: 'none' }
