import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

export const GuardPortal: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'control' | 'alerts' | 'history'>('control')

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.3s ease' }}>

      {/* AppBar Premium */}
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(15, 85, 81, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>security</span>
          </div>
          <div>
            <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '20px', color: 'var(--primary-color)', fontWeight: 700, margin: 0 }}>Portal Vigilante</h1>
            <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-sub)', letterSpacing: '1px', fontWeight: 800 }}>SEGURIDAD ACTIVA</p>
          </div>
        </div>
      </header>

      <main style={{ paddingTop: '100px', paddingLeft: '20px', paddingRight: '20px', width: '100%', maxWidth: '600px', boxSizing: 'border-box' }}>

        {/* Welcome Section */}
        <section style={{ marginBottom: '32px' }}>
           <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '32px', color: 'var(--primary-color)', margin: '0 0 5px 0' }}>Control de Accesos</h2>
           <p style={{ fontSize: '14px', color: 'var(--text-sub)', margin: 0 }}>Supervise los ingresos y gestione alertas de seguridad en tiempo real.</p>
        </section>

        {activeTab === 'control' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s ease' }}>
             <button style={qrBtnStyle}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>qr_code_scanner</span>
                ESCANEAR CÓDIGO QR
             </button>

             <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                   <span className="material-symbols-outlined" style={{ color: 'var(--primary-color)' }}>person_add</span>
                   <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Registro Manual</h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                   <Field label="Nombre Visitante" placeholder="Nombre completo" />
                   <Field label="Documento" placeholder="ID / Pasaporte" />
                   <Field label="Destino" placeholder="Casa / Apto" />
                   <button style={primaryBtnStyle}>Registrar Ingreso</button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', animation: 'fadeIn 0.5s ease' }}>
             <h3 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ color: '#ba1a1a' }}>warning</span> Alertas de Seguridad
             </h3>
             <div style={{ ...cardStyle, backgroundColor: 'rgba(186, 26, 26, 0.05)', borderColor: 'rgba(186, 26, 26, 0.2)' }}>
                <AlertItem text="Vehículo no identificado en zona norte." time="15 min" />
                <div style={{ height: '1px', backgroundColor: 'rgba(186, 26, 26, 0.1)', margin: '10px 0' }}></div>
                <AlertItem text="Portón B con falla de cierre." time="1 hora" />
             </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'fadeIn 0.5s ease' }}>
             <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px' }}>Últimos Movimientos</h3>
             <HistoryItem name="Ricardo Mendoza" house="Casa 14-22" time="14:20" type="Invitado" />
             <HistoryItem name="PedidosYa (Moto)" house="Casa 14-05" time="14:05" type="Delivery" />
             <HistoryItem name="Servicio Eléctrico" house="Áreas Comunes" time="13:45" type="Servicio" />
          </div>
        )}
      </main>

      {/* Bottom Nav Premium - ICONS ONLY */}
      <nav style={bottomNavStyle}>
        <NavIcon icon="qr_code_scanner" active={activeTab === 'control'} onClick={() => setActiveTab('control')} />
        <NavIcon icon="warning" active={activeTab === 'alerts'} onClick={() => setActiveTab('alerts')} />
        <NavIcon icon="history" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
        <NavIcon icon="person" active={false} onClick={() => navigate('/profile')} />
      </nav>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

const Field = ({ label, placeholder }: any) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <input placeholder={placeholder} style={inputStyle} />
  </div>
)

const AlertItem = ({ text, time }: any) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
     <span style={{ fontSize: '14px', fontWeight: 600, color: '#ba1a1a' }}>{text}</span>
     <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>{time}</span>
  </div>
)

const HistoryItem = ({ name, house, time, type }: any) => (
  <div style={{ ...cardStyle, padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
     <div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>{name}</p>
        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-sub)' }}>{house} • {time}</p>
     </div>
     <span style={{ fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', backgroundColor: 'var(--icon-bg)', color: 'var(--primary-color)' }}>{type.toUpperCase()}</span>
  </div>
)

const NavIcon = ({ icon, active, onClick }: any) => (
  <div onClick={onClick} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ backgroundColor: active ? 'rgba(137, 209, 202, 0.2)' : 'transparent', padding: '12px 28px', borderRadius: '20px' }}>
      <span className="material-symbols-outlined" style={{ color: active ? 'var(--primary-color)' : 'var(--text-sub)', fontSize: '30px', fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
    </div>
  </div>
)

const headerStyle = { position: 'fixed' as any, top: 0, width: '100%', height: '74px', backgroundColor: 'var(--header-bg)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }
const cardStyle = { backgroundColor: 'var(--card-bg)', padding: '25px', borderRadius: '24px', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' as any }
const inputStyle = { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)', outline: 'none' }
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '8px', textTransform: 'uppercase' as any }
const primaryBtnStyle = { width: '100%', padding: '18px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 700, cursor: 'pointer' }
const qrBtnStyle = { width: '100%', padding: '20px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', boxShadow: '0 8px 20px rgba(15,85,81,0.2)', fontSize: '15px' }
const bottomNavStyle = { position: 'fixed' as any, bottom: 0, width: '100%', height: '85px', backgroundColor: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 1000 }
