import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

export const GuardPortal: React.FC = () => {
  const { user } = useAuthStore()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', fontFamily: "'Inter', sans-serif", color: '#1B1C1A', paddingBottom: '100px' }}>
      {/* TopAppBar */}
      <header style={{ position: 'fixed', top: 0, width: '100%', height: '64px', backgroundColor: 'white', borderBottom: '1px solid #bfc8c7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 100, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2f6d69', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="material-symbols-outlined">security</span>
          </div>
          <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '20px', color: '#0f5551', fontWeight: 700, margin: 0 }}>Portal Vigilante</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', border: '1px solid #bfc8c7', borderRadius: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34A853' }}></div>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>Acceso A</span>
           </div>
           <span className="material-symbols-outlined" style={{ color: '#0f5551' }}>notifications</span>
        </div>
      </header>

      <main style={{ paddingTop: '84px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Title Section */}
        <section style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#3d503e', textTransform: 'uppercase', letterSpacing: '2px', margin: '0 0 5px 0' }}>Control de Accesos</p>
            <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '32px', color: '#1B1C1A', margin: 0 }}>Vigilancia Hoy</h2>
          </div>
          <button style={{ backgroundColor: '#2f6d69', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(47,109,105,0.2)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>qr_code_scanner</span> Escanear QR
          </button>
        </section>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>

          {/* Form Card */}
          <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
               <span className="material-symbols-outlined" style={{ color: '#0f5551' }}>person_add</span>
               <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Registrar Visitante</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
               <Field label="Nombre del Visitante" placeholder="Nombre completo" />
               <Field label="Documento ID" placeholder="Cédula o Pasaporte" />
               <Field label="Destino" placeholder="Número de Casa / Villa" />
               <button style={{ width: '100%', padding: '16px', backgroundColor: '#0f5551', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', marginTop: '10px' }}>Confirmar Ingreso</button>
            </div>
          </div>

          {/* Alerts Card */}
          <div style={{ backgroundColor: '#ffdad6', border: '1px solid rgba(186,26,26,0.2)', borderRadius: '20px', padding: '20px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#93000a' }}>
                   <span className="material-symbols-outlined">warning</span>
                   <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, textTransform: 'uppercase' }}>Alertas de Seguridad</h3>
                </div>
                <span style={{ backgroundColor: '#93000a', color: 'white', fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>2 ACTIVAS</span>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <AlertItem text="Vehículo no identificado en zona norte." time="15 min" />
                <AlertItem text="Portón B con falla de cierre." time="1 hora" />
             </div>
          </div>

          {/* List Table */}
          <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '20px', overflow: 'hidden' }}>
             <div style={{ padding: '15px 24px', backgroundColor: '#f5f3f0', borderBottom: '1px solid #bfc8c7' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Últimos Ingresos</h3>
             </div>
             <Table rows={[
                { name: 'Ricardo Mendoza', house: 'Villa 22', time: '14:20', type: 'Invitado' },
                { name: 'PedidosYa (Moto)', house: 'Apt 4B', time: '14:05', type: 'Delivery' },
                { name: 'Servicio Eléctrico', house: 'Áreas Comunes', time: '13:45', type: 'Servicio' }
             ]} />
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav style={{ position: 'fixed', bottom: 0, width: '100%', height: '80px', backgroundColor: 'white', borderTop: '1px solid #bfc8c7', display: 'flex', justifyContent: 'space-around', alignItems: 'center', zIndex: 100 }}>
        <NavIcon icon="home" label="Inicio" active />
        <NavIcon icon="history" label="Historial" />
        <NavIcon icon="contact_emergency" label="Botón SOS" />
        <Link to="/profile" style={{ textDecoration: 'none' }}><NavIcon icon="person" label="Perfil" /></Link>
      </nav>
    </div>
  )
}

const Field = ({ label, placeholder }: any) => (
  <div>
    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#3d503e', marginBottom: '8px', textTransform: 'uppercase' }}>{label}</label>
    <input placeholder={placeholder} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #bfc8c7', outline: 'none', boxSizing: 'border-box' }} />
  </div>
)

const AlertItem = ({ text, time }: any) => (
  <div style={{ backgroundColor: 'rgba(255,255,255,0.5)', padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
     <span style={{ fontSize: '13px', fontWeight: 600, color: '#93000a' }}>{text}</span>
     <span style={{ fontSize: '11px', opacity: 0.7 }}>{time}</span>
  </div>
)

const Table = ({ rows }: any) => (
  <div style={{ overflowX: 'auto' }}>
     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
           {rows.map((r: any, i: number) => (
              <tr key={i} style={{ borderBottom: '1px solid #efeeeb' }}>
                 <td style={{ padding: '15px 24px' }}>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{r.name}</div>
                    <div style={{ fontSize: '11px', color: '#6f7978' }}>Destino: {r.house}</div>
                 </td>
                 <td style={{ padding: '15px 24px', fontSize: '12px', color: '#6f7978' }}>{r.time}</td>
                 <td style={{ padding: '15px 24px', textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '10px', backgroundColor: '#d3e8d0', color: '#3d503e' }}>{r.type.toUpperCase()}</span>
                 </td>
              </tr>
           ))}
        </tbody>
     </table>
  </div>
)

const NavIcon = ({ icon, label, active }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: active ? '#271900' : '#6f7978', backgroundColor: active ? '#fed488' : 'transparent', padding: active ? '8px 16px' : '0', borderRadius: '16px' }}>
    <span className="material-symbols-outlined" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
    <span style={{ fontSize: '10px', fontWeight: active ? 700 : 500 }}>{label}</span>
  </div>
)
