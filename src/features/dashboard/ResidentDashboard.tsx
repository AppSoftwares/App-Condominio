import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

export const ResidentDashboard: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', fontFamily: "'Inter', sans-serif", color: '#1B1C1A', paddingBottom: '100px' }}>
      {/* TopAppBar */}
      <header style={{ position: 'fixed', top: 0, width: '100%', height: '64px', backgroundColor: 'white', borderBottom: '1px solid #bfc8c7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 100, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2f6d69', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '20px', color: '#0f5551', fontWeight: 700, margin: 0 }}>Caminos de la Lagunita</h1>
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f5551' }}>
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main style={{ paddingTop: '84px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Section */}
        <section style={{ marginBottom: '32px' }}>
          <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '32px', color: '#0f5551', margin: '0 0 4px 0' }}>¡Bienvenido, {user?.first_name || 'Residente'}!</h2>
          <p style={{ fontSize: '14px', color: '#3f4947', margin: 0 }}>Conjunto {user?.residential_cluster || 'Punta de Piedra'}, Casa {user?.house_number || '11-45'}</p>
        </section>

        {/* Bento Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>

          {/* Status Card */}
          <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#3f4947', textTransform: 'uppercase' }}>Estado de Cuenta</span>
              <span style={{ backgroundColor: '#ffdea6', color: '#271900', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold' }}>PENDIENTE</span>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: '48px', color: '#0f5551', margin: '0 0 4px 0' }}>$20.00</h3>
              <p style={{ fontSize: '12px', color: '#3f4947' }}>Próximo Vencimiento: 15 Oct, 2024</p>
            </div>
            <button onClick={() => navigate('/payments')} style={{ width: '100%', padding: '16px', backgroundColor: '#0f5551', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Pagar Ahora</button>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <ActionBtn icon="payments" label="Pagos" onClick={() => navigate('/payments')} />
            <ActionBtn icon="rebase_edit" label="Solicitudes" onClick={() => navigate('/requests')} />
            <ActionBtn icon="vpn_key" label="Invitados" onClick={() => navigate('/guests')} />
            <ActionBtn icon="calendar_today" label="Reservas" onClick={() => navigate('/reservations')} />
          </div>

          {/* News Section */}
          <section>
            <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: '24px', color: '#1b1c1a', marginBottom: '16px' }}>Noticias</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <NewsItem title="Mantenimiento de áreas" desc="Poda anual de jardines este jueves." tag="Mantenimiento" color="#ffdea6" />
              <NewsItem title="Asamblea Propietarios" desc="Sábado a las 10:00 AM en salón social." tag="Comunidad" color="#d3e8d0" />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

const ActionBtn = ({ icon, label, onClick }: any) => (
  <div onClick={onClick} style={{ backgroundColor: '#f5f3f0', border: '1px solid #bfc8c7', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f5551' }}>
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <span style={{ fontSize: '13px', fontWeight: 600 }}>{label}</span>
  </div>
)

const NewsItem = ({ title, desc, tag, color }: any) => (
  <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '16px', overflow: 'hidden' }}>
    <div style={{ height: '100px', backgroundColor: '#eae8e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span className="material-symbols-outlined" style={{ fontSize: '40px', opacity: 0.2 }}>image</span>
    </div>
    <div style={{ padding: '15px' }}>
      <span style={{ backgroundColor: color, fontSize: '10px', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{tag}</span>
      <h4 style={{ margin: '8px 0 4px 0', fontSize: '16px', fontWeight: 600 }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '12px', color: '#3f4947' }}>{desc}</p>
    </div>
  </div>
)
