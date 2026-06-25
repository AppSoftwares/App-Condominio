import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export const GuardPortal: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'control'

  const [isScanning, setIsScanning] = useState(false)

  if (isScanning) {
    return (
      <div style={{ flex: 1, backgroundColor: '#000', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
        <div style={{ width: 250, height: 250, border: '2px solid var(--primary-color)', borderRadius: '20px', position: 'relative', marginBottom: '40px' }}>
          <div style={{ width: '100%', height: '2px', backgroundColor: 'var(--primary-color)', position: 'absolute', top: '50%', boxShadow: '0 0 10px var(--primary-color)', animation: 'scan 2s infinite linear' }}></div>
        </div>
        <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', marginBottom: '40px', textAlign: 'center' }}>APUNTE AL CÓDIGO QR</p>
        <button
          onClick={() => { alert('Invitado validado con éxito.'); setIsScanning(false); }}
          style={primaryBtnStyle}
        >
          SIMULAR ESCANEO
        </button>
        <button onClick={() => setIsScanning(false)} style={{ position: 'absolute', top: '50px', right: '30px', background: 'none', border: 'none', color: 'white' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>close</span>
        </button>
        <style>{`
          @keyframes scan { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px',
      paddingTop: '94px',
      paddingBottom: '120px',
      boxSizing: 'border-box'
    }}>
      {/* Portada / Header Interno */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '30px', backgroundColor: 'var(--card-bg)', padding: '15px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(15, 85, 81, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>security</span>
          </div>
          <div style={{ textAlign: 'left' }}>
            <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '18px', color: 'var(--primary-color)', fontWeight: 700, margin: 0 }}>Portal Vigilante</h1>
            <p style={{ margin: 0, fontSize: '9px', color: 'var(--text-sub)', letterSpacing: '1px', fontWeight: 800 }}>SEGURIDAD ACTIVA</p>
          </div>
      </div>

      <section style={{ marginBottom: '32px', textAlign: 'center' }}>
         <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '34px', color: 'var(--primary-color)', margin: '0 0 10px 0', lineHeight: 1.1 }}>
           {activeTab === 'control' && 'Control de Accesos'}
           {activeTab === 'alerts' && 'Alertas'}
           {activeTab === 'history' && 'Historial'}
         </h2>
         <p style={{ fontSize: '16px', color: 'var(--text-sub)', margin: '0 auto', maxWidth: '90%', lineHeight: '1.5' }}>
           {activeTab === 'control' && 'Supervise los ingresos y gestione alertas de seguridad en tiempo real.'}
           {activeTab === 'alerts' && 'Gestione incidencias y reportes de seguridad.'}
           {activeTab === 'history' && 'Registro de los últimos movimientos en la urbanización.'}
         </p>
      </section>

      {activeTab === 'control' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', animation: 'fadeIn 0.5s ease' }}>
           <button onClick={() => setIsScanning(true)} style={qrBtnStyle}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>qr_code_scanner</span>
              ESCANEAR CÓDIGO QR
           </button>

           <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '25px' }}>
                 <span className="material-symbols-outlined" style={{ color: 'var(--primary-color)', fontSize: '28px' }}>person_add</span>
                 <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, fontFamily: "'EB Garamond', serif" }}>Registro Manual</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                 <Field label="Nombre Visitante" placeholder="Nombre completo" />
                 <Field label="Documento" placeholder="ID / Pasaporte" />
                 <Field label="Destino" placeholder="Casa / Apto" />
                 <button style={{ ...primaryBtnStyle, marginTop: '10px' }}>Registrar Ingreso</button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s ease' }}>
           <div style={{ ...cardStyle, backgroundColor: 'rgba(15, 85, 81, 0.05)', borderColor: 'rgba(15, 85, 81, 0.1)' }}>
              <p style={{ textAlign: 'center', color: 'var(--text-sub)', margin: 0 }}>No hay alertas activas en este momento.</p>
           </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', animation: 'fadeIn 0.5s ease' }}>
           <div style={cardStyle}>
              <p style={{ textAlign: 'center', color: 'var(--text-sub)', margin: 0 }}>No hay registros de ingreso recientes.</p>
           </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

const Field = ({ label, placeholder }: any) => (
  <div style={{ textAlign: 'left' }}>
    <label style={labelStyle}>{label}</label>
    <input placeholder={placeholder} style={inputStyle} />
  </div>
)

const AlertItem = ({ text, time }: any) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
     <span style={{ fontSize: '15px', fontWeight: 600, color: '#ba1a1a', textAlign: 'left', flex: 1, paddingRight: '10px' }}>{text}</span>
     <span style={{ fontSize: '12px', color: 'var(--text-sub)', whiteSpace: 'nowrap' }}>{time}</span>
  </div>
)

const HistoryItem = ({ name, house, time, type }: any) => (
  <div style={{ ...cardStyle, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
     <div style={{ textAlign: 'left' }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>{name}</p>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-sub)' }}>{house} • {time}</p>
     </div>
     <span style={{ fontSize: '10px', fontWeight: 800, padding: '5px 12px', borderRadius: '10px', backgroundColor: 'var(--icon-bg)', color: 'var(--primary-color)', letterSpacing: '0.5px' }}>{type.toUpperCase()}</span>
  </div>
)

const cardStyle = { backgroundColor: 'var(--card-bg)', padding: '25px', borderRadius: '28px', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' as any, boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }
const inputStyle = { width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)', outline: 'none', fontSize: '16px' }
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '10px', textTransform: 'uppercase' as any, letterSpacing: '0.5px' }
const primaryBtnStyle = { width: '100%', padding: '20px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 700, cursor: 'pointer', fontSize: '16px' }
const qrBtnStyle = { width: '100%', padding: '22px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '22px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', boxShadow: '0 10px 25px rgba(15,85,81,0.25)', fontSize: '16px' }
