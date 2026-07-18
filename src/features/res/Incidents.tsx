import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MdArrowBack,
  MdVolumeOff,
  MdPets,
  MdDeck,
  MdDirectionsCar
} from 'react-icons/md'
import { jsPDF } from 'jspdf'
import { useAuthStore } from '../../store/useAuthStore'
import { useCommunityStore, Incident } from '../../store/useCommunityStore'
import { sanitizeString } from '../../utils/security'
import { supabase } from '../../lib/supabase'

export const Incidents: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { incidents, addIncident } = useCommunityStore()

  const [activeTab, setActiveTab] = useState<'rules' | 'report'>('rules')
  const [category, setCategory] = useState('Ruidos / Música')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)

  const handleDownloadManual = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const title = 'Manual de Convivencia'
    const rules = [
      {
        title: 'Ruidos Molestos',
        text: 'Prohibido exceder 50dB entre las 10:00 PM y las 8:00 AM. Los eventos sociales en casas requieren aviso previo a la administración.'
      },
      {
        title: 'Mascotas',
        text: 'Uso obligatorio de correa en áreas comunes. Los dueños deben recoger los desechos de inmediato. Se prohíben mascotas en el área de piscina.'
      },
      {
        title: 'Áreas Comunes',
        text: 'Horario de piscina y canchas: 7:00 AM a 9:00 PM. No se permiten envases de vidrio ni consumo excesivo de alcohol en estas áreas.'
      },
      {
        title: 'Estacionamiento',
        text: 'Respetar los puestos asignados. Los visitantes solo pueden estacionar en las áreas marcadas para tal fin.'
      }
    ]

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text(title, 40, 50)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')

    let currentY = 80
    rules.forEach((rule) => {
      doc.setFont('helvetica', 'bold')
      doc.text(rule.title, 40, currentY)
      currentY += 18
      doc.setFont('helvetica', 'normal')
      const split = doc.splitTextToSize(rule.text, 520)
      doc.text(split, 40, currentY)
      currentY += split.length * 14 + 18
      if (currentY > 740) {
        doc.addPage()
        currentY = 40
      }
    })

    try {
      doc.save('Manual_de_Convivencia.pdf')
    } catch (error) {
      console.error('Error al guardar el PDF:', error)
      alert('No se pudo descargar el PDF. Por favor intente de nuevo.')
    }
  }

  useEffect(() => {
    if (user?.id) {
      setSessionUserId(user.id)
    }

    const sync = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        setSessionUserId(data?.session?.user?.id ?? user?.id ?? null)
      } catch (err) {
        console.error('Error sincronizando sesión:', err)
        setSessionUserId(user?.id ?? null)
      }
    }

    sync()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUserId(session?.user?.id ?? user?.id ?? null)
    })

    return () => { try { sub?.subscription?.unsubscribe?.() } catch (e) {} }
  }, [user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!location || !description) return alert('Por favor complete todos los campos.')

    setIsSubmitting(true)
    try {
      // ensure authenticated session id for RLS
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      const authId = sessionData?.session?.user?.id ?? user?.id ?? sessionUserId
      if (!authId) throw new Error('No se detectó una sesión activa. Por favor inicie sesión nuevamente.')

      // Generate a PDF of the complaint before sending (or after success)
      const generateComplaintReceipt = () => {
        const doc = new jsPDF()
        doc.setFontSize(20)
        doc.text("Reporte de Incidencia / Queja", 105, 20, { align: 'center' })
        doc.setFontSize(12)
        doc.text(`Fecha: ${new Date().toLocaleString()}`, 20, 40)
        doc.text(`Categoría: ${category}`, 20, 60)
        doc.text(`Ubicación (Casa): ${location}`, 20, 80)
        doc.text("Descripción:", 20, 100)
        const splitText = doc.splitTextToSize(description, 170)
        doc.text(splitText, 20, 110)
        doc.save(`Reporte_Queja_${Date.now()}.pdf`)
      }

      const { error } = await supabase.rpc('rpc_insert_incident', {
        category: category,
        location: sanitizeString(location),
        description: sanitizeString(description)
      })

      if (error) throw error

      addIncident({
        id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `inc-${Date.now()}`,
        category,
        location,
        description,
        date: new Date().toLocaleDateString('es-VE'),
        status: 'Pendiente',
        houseNumber: location
      })

      alert('Reporte enviado con éxito. La administración revisará su caso.')
      try { generateComplaintReceipt() } catch(e) { console.error('Error generating PDF:', e) }
      setLocation('')
      setDescription('')
      setActiveTab('report')
    } catch (err: any) {
      alert('Error al enviar incidencia: ' + (err.message || 'Error desconocido'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <main style={{ paddingLeft: '20px', paddingRight: '20px', width: '100%', maxWidth: '600px', boxSizing: 'border-box', paddingTop: '10px' }}>

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
                icon={MdVolumeOff}
                title="Ruidos Molestos"
                desc="Prohibido exceder 50dB entre las 10:00 PM y las 8:00 AM. Los eventos sociales en casas requieren aviso previo a la administración."
                color="rgba(15, 85, 81, 0.1)"
              />
              <RuleCard
                icon={MdPets}
                title="Mascotas"
                desc="Uso obligatorio de correa en áreas comunes. Los dueños deben recoger los desechos de inmediato. Se prohíben mascotas en el área de piscina."
                color="rgba(198, 160, 89, 0.1)"
              />
              <RuleCard
                icon={MdDeck}
                title="Áreas Comunes"
                desc="Horario de piscina y canchas: 7:00 AM a 9:00 PM. No se permiten envases de vidrio ni consumo excesivo de alcohol en estas áreas."
                color="rgba(61, 80, 62, 0.1)"
              />
              <RuleCard
                icon={MdDirectionsCar}
                title="Estacionamiento"
                desc="Respetar los puestos asignados. Los visitantes solo pueden estacionar en las áreas marcadas para tal fin."
                color="rgba(15, 85, 81, 0.1)"
              />
            </div>

            <button onClick={handleDownloadManual} style={{ ...primaryBtnStyle, marginTop: '30px', backgroundColor: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}>
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
                  inputMode="tel"
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

              <button type="submit" disabled={isSubmitting} style={{ ...primaryBtnStyle, opacity: (isSubmitting) ? 0.7 : 1 }}>
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

const RuleCard = ({ icon: Icon, title, desc, color }: any) => (
  <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '20px', display: 'flex', gap: '15px' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={24} style={{ color: 'var(--primary-color)' }} />
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
const incTagStyle = { backgroundColor: 'rgba(198, 160, 89, 0.1)', color: 'var(--accent-gold)', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' as any }
