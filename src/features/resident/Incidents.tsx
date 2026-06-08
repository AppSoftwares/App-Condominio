import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { useCommunityStore, Incident } from '../../store/useCommunityStore'

export const Incidents: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { incidents, addIncident } = useCommunityStore()

  const [activeTab, setActiveTab] = useState<'rules' | 'report'>('rules')
  const [category, setCategory] = useState('Ruidos / Música')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!location || !description) return alert('Por favor complete todos los campos.')

    setIsSubmitting(true)
    setTimeout(() => {
      const newIncident: Incident = {
        id: Date.now().toString(),
        category,
        location,
        description,
        date: 'Recién publicado',
        status: 'Pendiente',
        houseNumber: user?.house_number || 'UNKNOWN'
      }
      addIncident(newIncident)
      setIsSubmitting(false)
      alert('Reporte enviado con éxito. La administración revisará su caso.')
      setLocation('')
      setDescription('')
      setActiveTab('report')
    }, 1200)
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '600px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '20px', color: 'var(--primary-color)', fontWeight: 700, margin: 0 }}>
            {activeTab === 'rules' ? 'Normas de Convivencia' : 'Reportar Incidente'}
          </h1>
        </div>
      </header>

      <main style={{ paddingTop: '100px', paddingLeft: '20px', paddingRight: '20px', width: '100%', maxWidth: '600px', boxSizing: 'border-box' }}>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', backgroundColor: 'var(--icon-bg)', padding: '5px', borderRadius: '16px' }}>
          <button
            onClick={() => setActiveTab('rules')}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '14px',
              backgroundColor: activeTab === 'rules' ? 'var(--card-bg)' : 'transparent',
              color: activeTab === 'rules' ? 'var(--primary-color)' : 'var(--text-sub)',
              boxShadow: activeTab === 'rules' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer', transition: 'all 0.3s ease'
            }}
          >
            Ver Normas
          </button>
          <button
            onClick={() => setActiveTab('report')}
            style={{
              flex: 1, padding: '12px', borderRadius: '12px', border: 'none', fontWeight: 700, fontSize: '14px',
              backgroundColor: activeTab === 'report' ? 'var(--card-bg)' : 'transparent',
              color: activeTab === 'report' ? 'var(--primary-color)' : 'var(--text-sub)',
              boxShadow: activeTab === 'report' ? '0 4px 10px rgba(0,0,0,0.05)' : 'none',
              cursor: 'pointer', transition: 'all 0.3s ease'
            }}
          >
            Reportar
          </button>
        </div>

        {activeTab === 'rules' ? (
          <section style={{ animation: 'fadeIn 0.4s ease' }}>
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '32px', color: 'var(--primary-color)', margin: '0 0 10px 0' }}>Manual de Convivencia</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-sub)', margin: 0 }}>Resumen de las normas principales del conjunto.</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <RuleCard
                icon="volume_off"
                title="Ruidos Molestos"
                desc="Prohibido exceder 50dB entre las 10:00 PM y las 8:00 AM. Los eventos sociales en casas requieren aviso previo a la administración."
                color="rgba(15, 85, 81, 0.1)"
              />
              <RuleCard
                icon="pets"
                title="Mascotas"
                desc="Uso obligatorio de correa en áreas comunes. Los dueños deben recoger los desechos de inmediato. Se prohíben mascotas en el área de piscina."
                color="rgba(198, 160, 89, 0.1)"
              />
              <RuleCard
                icon="deck"
                title="Áreas Comunes"
                desc="Horario de piscina y canchas: 7:00 AM a 9:00 PM. No se permiten envases de vidrio ni consumo excesivo de alcohol en estas áreas."
                color="rgba(61, 80, 62, 0.1)"
              />
              <RuleCard
                icon="directions_car"
                title="Estacionamiento"
                desc="Respetar los puestos asignados. Los visitantes solo pueden estacionar en las áreas marcadas para tal fin."
                color="rgba(15, 85, 81, 0.1)"
              />
            </div>

            <button style={{ ...primaryBtnStyle, marginTop: '30px', backgroundColor: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}>
              Descargar Manual PDF Completo
            </button>
          </section>
        ) : (
          <div style={{ animation: 'fadeIn 0.4s ease' }}>
            <form onSubmit={handleSubmit} style={cardStyle}>
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={inputStyle}
                >
                  <option>Ruidos / Música</option>
                  <option>Mascotas / Desechos</option>
                  <option>Estacionamiento</option>
                  <option>Infraestructura</option>
                  <option>Seguridad</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Número de Casa</label>
                <input
                  type="text"
                  placeholder="Ej: 14-73"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={labelStyle}>Descripción del Incidente</label>
                <textarea
                  placeholder="Describa brevemente lo sucedido..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ ...inputStyle, height: '100px', resize: 'none' }}
                />
              </div>

              <button type="submit" disabled={isSubmitting} style={primaryBtnStyle}>
                {isSubmitting ? 'Enviando...' : 'Enviar Reporte'}
              </button>
            </form>

            <div style={{ marginTop: '40px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>Alertas Recientes</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {incidents.map(inc => (
                <div key={inc.id} style={incidentCardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={incTagStyle}>{inc.category}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>{inc.date}</span>
                  </div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '15px', fontWeight: 700 }}>{inc.location}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-sub)', fontStyle: 'italic' }}>"{inc.description}"</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

const RuleCard = ({ icon, title, desc, color }: any) => (
  <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '20px', display: 'flex', gap: '15px' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span className="material-symbols-outlined" style={{ color: 'var(--primary-color)' }}>{icon}</span>
    </div>
    <div>
      <h4 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 700 }}>{title}</h4>
      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-sub)', lineHeight: '1.4' }}>{desc}</p>
    </div>
  </div>
)

const headerStyle = { position: 'fixed' as any, top: 0, width: '100%', height: '64px', backgroundColor: 'var(--header-bg)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }
const cardStyle = { backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '25px', width: '100%', boxSizing: 'border-box' as any }
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '8px', textTransform: 'uppercase' as any }
const inputStyle = { width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)', fontSize: '14px', outline: 'none' }
const primaryBtnStyle = { width: '100%', padding: '16px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }
const incidentCardStyle = { backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '15px' }
const incTagStyle = { backgroundColor: 'rgba(198, 160, 89, 0.1)', color: '#785919', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' as any }
