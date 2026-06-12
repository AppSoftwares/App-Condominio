import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const Notifications: React.FC = () => {
  const navigate = useNavigate()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [volume, setVolume] = useState(70)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', fontFamily: "'Inter', sans-serif", color: '#1B1C1A', paddingBottom: '40px' }}>
      <header style={{
        position: 'fixed', top: 0, width: '100%', height: '64px', backgroundColor: '#FAF8F5',
        borderBottom: '1px solid #bfc8c7', display: 'flex', alignItems: 'center', padding: '0 20px',
        zIndex: 100, boxSizing: 'border-box'
      }}>
        <button
          onClick={() => navigate('/profile')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#1B1C1A' }}>arrow_back</span>
        </button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '18px', marginLeft: '15px', color: '#0f5551', fontWeight: 700, textTransform: 'uppercase' }}>Notificaciones y Sonido</h1>
      </header>

      <main style={{ paddingTop: '84px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '500px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <p style={{ color: '#3f4947', fontSize: '14px', marginBottom: '30px', textAlign: 'center' }}>Gestiona cómo quieres recibir las alertas de tu comunidad.</p>

        {/* Global Notifications Toggle */}
        <section style={sectionCardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ ...iconBoxStyle, backgroundColor: '#B0EEE9' }}>
                <span className="material-symbols-outlined" style={{ color: '#00201e' }}>{notificationsEnabled ? 'notifications_active' : 'notifications_off'}</span>
              </div>
              <div>
                <span style={labelMainStyle}>Permitir Notificaciones</span>
                <span style={labelSubStyle}>Alertas de pagos y comunidad</span>
              </div>
            </div>
            <ToggleSwitch active={notificationsEnabled} onToggle={() => setNotificationsEnabled(!notificationsEnabled)} />
          </div>
        </section>

        {/* Sound Controls Section */}
        <section style={{ ...sectionCardStyle, opacity: notificationsEnabled ? 1 : 0.5, pointerEvents: notificationsEnabled ? 'auto' : 'none', transition: 'all 0.3s ease' }}>
          <h3 style={sectionTitleStyle}>Ajustes de Sonido</h3>

          {/* Sound Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ ...iconBoxStyle, backgroundColor: '#D3E8D0' }}>
                <span className="material-symbols-outlined" style={{ color: '#0e1f10' }}>{soundEnabled && volume > 0 ? 'volume_up' : 'volume_off'}</span>
              </div>
              <div>
                <span style={labelMainStyle}>Sonido de Alerta</span>
                <span style={labelSubStyle}>{soundEnabled ? 'Activado' : 'Silenciado'}</span>
              </div>
            </div>
            <ToggleSwitch active={soundEnabled} onToggle={() => setSoundEnabled(!soundEnabled)} />
          </div>

          {/* Volume Slider */}
          <div style={{ padding: '0 5px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
               <span style={{ fontSize: '12px', fontWeight: 700, color: '#3f4947' }}>Volumen del Tono</span>
               <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f5551' }}>{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              style={{
                width: '100%',
                height: '6px',
                appearance: 'none',
                backgroundColor: '#efeeeb',
                borderRadius: '3px',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', opacity: 0.5 }}>
               <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>volume_mute</span>
               <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>volume_up</span>
            </div>
          </div>
        </section>

        {/* Tip Section */}
        <div style={{ backgroundColor: 'rgba(15,85,81,0.05)', borderRadius: '12px', padding: '15px', marginTop: '30px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
           <span className="material-symbols-outlined" style={{ color: '#0f5551', fontSize: '20px' }}>info</span>
           <p style={{ margin: 0, fontSize: '12px', color: '#0f5551', lineHeight: '1.4' }}>
             Recomendamos mantener las notificaciones activas para no perderse avisos críticos de seguridad o vencimientos de pagos.
           </p>
        </div>
      </main>
    </div>
  )
}

const ToggleSwitch = ({ active, onToggle }: any) => (
  <div
    onClick={onToggle}
    style={{
      width: '50px', height: '28px', backgroundColor: active ? '#2f6d69' : '#bfc8c7',
      borderRadius: '14px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease'
    }}
  >
    <div style={{
      width: '22px', height: '22px', backgroundColor: 'white', borderRadius: '50%',
      position: 'absolute', top: '3px', left: active ? '25px' : '3px',
      transition: 'left 0.3s ease', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }} />
  </div>
)

const sectionCardStyle = { backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', marginBottom: '20px' }
const iconBoxStyle = { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const labelMainStyle = { fontWeight: 700, fontSize: '16px', color: '#1B1C1A', display: 'block' }
const labelSubStyle = { fontSize: '12px', color: '#6f7978' }
const sectionTitleStyle = { fontSize: '12px', fontWeight: 800, color: '#785919', textTransform: 'uppercase' as const, letterSpacing: '1px', marginBottom: '20px', borderBottom: '1px solid #efeeeb', paddingBottom: '10px' }
