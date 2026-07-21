import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { MdErrorOutline, MdCheckCircle, MdPending, MdUpdate } from 'react-icons/md'

export const IncidentsAdmin: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIncidents()
  }, [])

  const fetchIncidents = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('incidents')
      .select('*, profiles(first_name, last_name, house_number)')
      .order('created_at', { ascending: false })

    if (error) console.error('Error fetching incidents:', error)
    else setIncidents(data || [])
    setLoading(false)
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('incidents')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) alert('Error al actualizar: ' + error.message)
    else {
      alert('Estatus actualizado')
      fetchIncidents()
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '32px', color: 'var(--primary-color)', marginBottom: '30px', textAlign: 'center' }}>Gestión de Incidencias</h2>

      {loading ? (
        <p style={{ textAlign: 'center' }}>Cargando incidencias...</p>
      ) : incidents.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-sub)' }}>No hay incidencias reportadas.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {incidents.map(inc => (
            <div key={inc.id} style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                 <div>
                    <span style={{ ...tagStyle, backgroundColor: getStatusColor(inc.status) }}>{inc.status.toUpperCase()}</span>
                    <h3 style={{ margin: '10px 0 5px 0', fontSize: '18px' }}>{inc.category}</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-sub)' }}>Reportado por: {inc.profiles?.first_name} {inc.profiles?.last_name} • Casa {inc.profiles?.house_number}</p>
                 </div>
                 <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-sub)' }}>{new Date(inc.created_at).toLocaleDateString()}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-sub)' }}>{new Date(inc.created_at).toLocaleTimeString()}</p>
                 </div>
              </div>

              <div style={{ backgroundColor: 'var(--icon-bg)', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
                 <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{inc.description}</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                 <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-gold)' }}>CAMBIAR ESTATUS:</span>
                 <select
                    value={inc.status}
                    onChange={(e) => handleUpdateStatus(inc.id, e.target.value)}
                    style={selectStyle}
                 >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En revisión">En revisión</option>
                    <option value="Resuelto">Resuelto</option>
                 </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Pendiente': return 'rgba(186, 26, 26, 0.1)';
        case 'En revisión': return 'rgba(198, 160, 89, 0.1)';
        case 'Resuelto': return 'rgba(39, 174, 96, 0.1)';
        default: return '#eee';
    }
}

const cardStyle = { backgroundColor: 'var(--card-bg)', padding: '25px', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }
const tagStyle = { padding: '4px 12px', borderRadius: '8px', fontSize: '10px', fontWeight: 800, color: 'var(--primary-color)' }
const selectStyle = { padding: '8px 12px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', fontSize: '13px', outline: 'none' }
