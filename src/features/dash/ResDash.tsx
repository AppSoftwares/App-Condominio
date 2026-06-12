import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import logoPremium from '../../assets/logo_premium.png'

export const ResDash: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.3s ease' }}>

      {/* AppBar Premium */}
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center', width: '100%' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid var(--accent-gold)', flexShrink: 0 }}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '20px', color: 'var(--primary-color)', fontWeight: 700, margin: 0 }}>Caminos de la Lagunita</h1>
        </div>
      </header>

      <main style={mainContentStyle}>

        {/* Welcome Section */}
        <section style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '38px', color: 'var(--primary-color)', margin: '0 0 8px 0', lineHeight: 1.1 }}>¡Bienvenido, {user?.first_name || 'Residente'}!</h2>
          <p style={{ fontSize: '15px', color: 'var(--text-sub)', margin: 0, fontWeight: 500 }}>Conjunto {user?.residential_cluster || 'Punta de Piedra'}, Casa {user?.house_number || '11-45'}</p>
          <div style={{ width: '40px', height: '3px', backgroundColor: 'var(--accent-gold)', margin: '15px auto 0', borderRadius: '2px' }}></div>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Hero Image Card */}
          <div style={{
            backgroundColor: 'var(--primary-color)',
            borderRadius: '28px',
            height: '220px',
            width: '100%',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-color)'
          }}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPwdp7uHsqU1vRZWPz2cgSezTBACQTT0Gy8BQ6Q6if0vf2CFTpdQTkcjAkPwWtFVXNuaOR4GEc-EotjUx7KvjV3hkiHEJjhqKow1-rev1tmlseP7VhH8yxef2qcJOuWC8WV1ICHTO2FIflVEH_ikuYhzv8Wxe3tdX39ad5eCxaHovyjWNn_yD38hop_ZO3Y_rmmgFX889FXiT4gDoBYlWLlInRq3EPb1EHZuCSd3gGGmU1Qo2eedVhDVZ1NWVuSvsW8mMn0x3gAPg"
              alt="Caminos de la Lagunita"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, mixBlendMode: 'overlay' as any }}
            />
            <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '20px' }}>
              <img
                src={logoPremium}
                alt="Caminos de la Lagunita Logo"
                style={{ width: '100px', marginBottom: '10px' }}
              />
              <p style={{ color: 'white', fontFamily: "'EB Garamond', serif", fontSize: '20px', fontStyle: 'italic', margin: 0 }}>Excelencia en Convivencia</p>
            </div>
          </div>

          {/* Status Card */}
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '1px' }}>Estado de Cuenta</span>
              <span style={{ backgroundColor: 'var(--accent-gold)', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '10px', fontWeight: 800 }}>PENDIENTE</span>
            </div>
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: '48px', color: 'var(--primary-color)', margin: '0 0 5px 0', fontWeight: 800 }}>$20.00</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-sub)', fontWeight: 600 }}>Próximo Vencimiento: 15 Oct, 2024</p>
            </div>
            <button onClick={() => navigate('/payments')} style={primaryBtnStyle}>Pagar Ahora</button>
          </div>

          {/* Quick Actions Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <ActionBtn icon="payments" label="Pagos" onClick={() => navigate('/payments')} />
            <ActionBtn icon="report" label="Incidencias" onClick={() => navigate('/incidents')} />
            <ActionBtn icon="how_to_vote" label="Comunidad" onClick={() => navigate('/requests')} />
            <ActionBtn icon="vpn_key" label="Invitados" onClick={() => navigate('/guests')} />
            <ActionBtn icon="calendar_today" label="Reservas" onClick={() => navigate('/reservations')} />
            <ActionBtn icon="gavel" label="Normas" onClick={() => navigate('/incidents')} />
          </div>

          {/* News Section */}
          <section style={{ marginTop: '10px' }}>
            <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: '28px', color: 'var(--text-color)', marginBottom: '20px', textAlign: 'center' }}>Noticias y Avisos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <NewsItem
                title="Mantenimiento de áreas"
                desc="Poda anual de jardines este jueves."
                tag="Mantenimiento"
                color="#ffdea6"
                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDV5ujmAXc75G7me1ghXNk55ejrYKDXN4b5RB7a88XD9PHnQCY2B74mLFqZPTmGObfnp6vC3L6yigqNeBzbWdMR1EfHU3XhsKbESuFaeP_-QbYx4xMKnveOLJIoyPkW-DDy0at3Y7I9f55R_o1cVKZAO2UKDKmwYYsfDT9eACxiVFBbLidsl0LqOclYsLZz5rmS-eMGb9T8wYys9mLJ7Dr-LDSJGpZfO3oJWhuNs_HlXEXwm9xw-bES3yjwe6yFmDU8T0Z1DVRacmY"
              />
              <NewsItem
                title="Asamblea Propietarios"
                desc="Sábado a las 10:00 AM en salón social."
                tag="Comunidad"
                color="#d3e8d0"
                imageUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuDUDpOFYJfmpqnUXdQflzQKTjUirjdWcNb4elw2H-U3jp2vQSd_vYtyNVIwOdlQ_3YGyCupYhgggNgOVSCN96iNLwU1Sw0j1xJb4klTMS7nNRCESPlEeI6y-xHVKnDvlBAYYgIAKNGQqzmx0lW0lON_n5DDZAYoAC4g6hqf1WwyToMIlgKyB3b1Ky_wk6HnNVMiJVbgjGjthw5DCkJ9qf9dE2MtxKMzC4C9B7O43aLg9R9otYyogmsoN6ef6-QsPD4qBUl4J0CvHbw"
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

const ActionBtn = ({ icon, label, onClick }: any) => (
  <div onClick={onClick} style={{ backgroundColor: 'var(--icon-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.3s ease' }}>
    <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', flexShrink: 0 }}>
      <span className="material-symbols-outlined" style={{ fontSize: '28px', display: 'block', width: '28px', height: '28px' }}>{icon}</span>
    </div>
    <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-color)' }}>{label}</span>
  </div>
)

const NewsItem = ({ title, desc, tag, color, imageUrl }: any) => (
  <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', overflow: 'hidden', transition: 'all 0.3s ease' }}>
    <div style={{ height: '140px', backgroundColor: 'var(--icon-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {imageUrl ? (
        <img src={imageUrl} alt={title} style={{ width: '100%', height: '100%', objectCover: 'cover' } as any} />
      ) : (
        <span className="material-symbols-outlined" style={{ fontSize: '40px', color: 'var(--text-sub)', opacity: 0.2 }}>image</span>
      )}
    </div>
    <div style={{ padding: '20px' }}>
      <span style={{ backgroundColor: color, color: '#1B1C1A', fontSize: '10px', padding: '4px 12px', borderRadius: '8px', fontWeight: 800 }}>{tag.toUpperCase()}</span>
      <h4 style={{ margin: '12px 0 6px 0', fontSize: '18px', fontWeight: 700, color: 'var(--text-color)' }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-sub)', lineHeight: '1.5' }}>{desc}</p>
    </div>
  </div>
)

const headerStyle = { position: 'fixed' as any, top: 0, width: '100%', height: '74px', backgroundColor: 'var(--header-bg)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }
const mainContentStyle = { paddingTop: '100px', paddingLeft: '20px', paddingRight: '20px', width: '100%', maxWidth: '500px', margin: '0 auto', boxSizing: 'border-box' as any }
const cardStyle = { backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '28px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }
const primaryBtnStyle = { width: '100%', padding: '18px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(15,85,81,0.15)' }
