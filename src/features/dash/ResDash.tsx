import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MdOutlinePayments,
  MdOutlineErrorOutline,
  MdOutlineGroups,
  MdOutlineVpnKey,
  MdOutlineCalendarToday,
  MdOutlineInventory2,
  MdOutlineImage
} from 'react-icons/md'
import { useAuthStore } from '../../store/useAuthStore'
import { supabase } from '../../lib/supabase'
import logoPremium from '../../assets/logo_premium.png'

export const ResDash: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = React.useState<any[]>([])
  const [totalDebt, setTotalDebt] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Announcements
        const { data: annData } = await supabase
          .from('announcements')
          .select('*')
          .order('fecha_creacion', { ascending: false })
          .limit(3)

        setAnnouncements(annData || [])

        // Fetch Total Debt logic
        const { data: debtData } = await supabase
          .from('debts')
          .select('monto_pendiente')
          .eq('residente_id', user?.id)
          .eq('pagada', false)

        // Fetch Condo Settings
        const { data: settings } = await supabase
          .from('condo_settings')
          .select('*')
          .eq('id', 1)
          .single()

        if (debtData && debtData.length > 0) {
          const total = debtData.reduce((acc, d) => acc + Number(d.monto_pendiente), 0)
          setTotalDebt(total)
        } else if (settings) {
          // If no specific debt entries, calculate based on monthly settings
          const today = new Date()
          const currentDay = today.getDate()
          const isProntoPago = currentDay <= settings.dias_pronto_pago
          const montoACobrar = isProntoPago ? settings.monto_pronto_pago_usd : settings.cuota_mensual_usd
          setTotalDebt(Number(montoACobrar))
        }

      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [user?.id])

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.3s ease' }}>

      {/* AppBar Premium */}
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center', width: '100%' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '2px solid var(--accent-gold)', flexShrink: 0 }}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '20px', color: 'var(--primary-color)', fontWeight: 700, margin: 0 }}>Condominio</h1>
        </div>
      </header>

      <main style={mainContentStyle}>

        {/* Welcome Section */}
        <section style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '38px', color: 'var(--primary-color)', margin: '0 0 8px 0', lineHeight: 1.1 }}>¡Bienvenido, {user?.first_name || 'Residente'}!</h2>
          <p style={{ fontSize: '15px', color: 'var(--text-sub)', margin: 0, fontWeight: 500 }}>Conjunto {user?.residential_cluster || 'Punta de Piedra'}, Casa {user?.house_number || 'N/A'}</p>
          <div style={{ width: '40px', height: '3px', backgroundColor: 'var(--accent-gold)', margin: '15px auto 0', borderRadius: '2px' }}></div>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Status Card */}
          <div style={{ ...cardStyle, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '1px' }}>Estado de Cuenta</span>
              <span style={{ backgroundColor: totalDebt > 0 ? '#ba1a1a' : 'var(--accent-gold)', color: 'white', padding: '5px 15px', borderRadius: '20px', fontSize: '10px', fontWeight: 800 }}>
                {totalDebt > 0 ? 'PENDIENTE' : 'AL DÍA'}
              </span>
            </div>
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: '48px', color: 'var(--primary-color)', margin: '0 0 5px 0', fontWeight: 800 }}>
                ${totalDebt.toFixed(2)}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-sub)', fontWeight: 600 }}>Saldo actual a pagar</p>
            </div>
            <button onClick={() => navigate('/payments')} style={primaryBtnStyle}>
              {totalDebt > 0 ? 'Pagar Ahora' : 'Ver Detalles'}
            </button>
          </div>

          {/* Quick Actions Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <ActionBtn icon={MdOutlinePayments} label="Pagos" onClick={() => navigate('/payments')} />
            <ActionBtn icon={MdOutlineInventory2} label="Casillero" onClick={() => navigate('/packages')} />
            <ActionBtn icon={MdOutlineGroups} label="Comunidad" onClick={() => navigate('/requests')} />
            <ActionBtn icon={MdOutlineVpnKey} label="Invitados" onClick={() => navigate('/guests')} />
            <ActionBtn icon={MdOutlineCalendarToday} label="Reservas" onClick={() => navigate('/reservations')} />
            <ActionBtn icon={MdOutlineErrorOutline} label="Incidencias" onClick={() => navigate('/incidents')} />
          </div>

          {/* News Section */}
          <section style={{ marginTop: '10px' }}>
            <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: '28px', color: 'var(--text-color)', marginBottom: '20px', textAlign: 'center' }}>Noticias y Avisos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-sub)' }}>Cargando avisos...</p>
              ) : announcements.length > 0 ? (
                announcements.map(ann => (
                  <NewsItem
                    key={ann.id}
                    title={ann.titulo}
                    desc={ann.mensaje}
                    tag={ann.tipo}
                    color={ann.tipo === 'mantenimiento' ? '#ffdea6' : '#d3e8d0'}
                  />
                ))
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-sub)' }}>No hay avisos recientes.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

const ActionBtn = ({ icon: Icon, label, onClick }: any) => (
  <div onClick={onClick} style={{ backgroundColor: 'var(--icon-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.3s ease' }}>
    <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', flexShrink: 0 }}>
      <Icon size={28} style={{ display: 'block' }} />
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
        <MdOutlineImage size={40} style={{ color: 'var(--text-sub)', opacity: 0.2 }} />
      )}
    </div>
    <div style={{ padding: '20px' }}>
      <span style={{ backgroundColor: color, color: '#1B1C1A', fontSize: '10px', padding: '4px 12px', borderRadius: '8px', fontWeight: 800 }}>{tag.toUpperCase()}</span>
      <h4 style={{ margin: '12px 0 6px 0', fontSize: '18px', fontWeight: 700, color: 'var(--text-color)' }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-sub)', lineHeight: '1.5' }}>{desc}</p>
    </div>
  </div>
)

const headerStyle = { position: 'fixed' as any, top: 0, width: '100%', height: '74px', backgroundColor: 'var(--header-bg)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, paddingTop: 'env(safe-area-inset-top)' }
const mainContentStyle = { paddingTop: 'calc(100px + env(safe-area-inset-top))', paddingLeft: '20px', paddingRight: '20px', width: '100%', maxWidth: '500px', margin: '0 auto', boxSizing: 'border-box' as any }
const cardStyle = { backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '28px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }
const primaryBtnStyle = { width: '100%', padding: '18px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(15,85,81,0.15)' }
