import React, { useState, useEffect } from 'react'
import { supabase } from '../../../shared/lib/supabase'
import { RESIDENTIAL_CLUSTERS } from '../../../config/clusters'
import { buildAnnouncementText, buildPushPreview, AnnouncementTemplateInput } from '../../../shared/utils/announcementTemplates'
import { MdOutlineCampaign, MdSend, MdPhoneAndroid, MdHistory, MdDelete } from 'react-icons/md'

interface AnnouncementComposerProps {
  cluster: string
  isSuperAdmin: boolean
}

export const AnnouncementComposer: React.FC<AnnouncementComposerProps> = ({ cluster, isSuperAdmin }) => {
  const [tipo, setTipo] = useState<'general' | 'asamblea' | 'urgente' | 'mantenimiento' | 'finanzas'>('general')
  const [targetCluster, setTargetCluster] = useState<string>(cluster || 'general')
  const [titulo, setTitulo] = useState('')
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [lugar, setLugar] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [notaImportante, setNotaImportante] = useState('')
  const [contacto, setContacto] = useState('')

  const [sendPush, setSendPush] = useState(true)
  const [loading, setLoading] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [history, setHistory] = useState<any[]>([])

  const templateInput: AnnouncementTemplateInput = {
    tipo,
    titulo,
    fecha,
    hora,
    lugar,
    mensaje,
    notaImportante,
    contacto
  }

  const generatedMessage = buildAnnouncementText(templateInput)
  const pushPreview = buildPushPreview(templateInput)

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('fecha_creacion', { ascending: false })
        .limit(10)

      if (!error && data) {
        setHistory(data)
      }
    } catch (err) {
      console.error('Error fetching announcements history:', err)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [])

  const handleTestNotification = async () => {
    if (!titulo || !mensaje) {
      alert('Por favor complete al menos el título y el mensaje para probar la notificación.')
      return
    }

    setTestLoading(true)
    try {
      const { error } = await supabase.rpc('rpc_publish_announcement', {
        p_titulo: titulo,
        p_mensaje: generatedMessage,
        p_tipo: tipo,
        p_cluster: targetCluster === 'general' ? null : targetCluster,
        p_push_title: pushPreview.title,
        p_push_body: pushPreview.body,
        p_metadata: { template: tipo, fecha, hora, lugar },
        p_send_push: true,
        p_test_only: true
      })

      if (error) throw error
      alert('¡Notificación de prueba enviada a su dispositivo!')
    } catch (err: any) {
      alert('Error al enviar prueba: ' + (err.message || err))
    } finally {
      setTestLoading(false)
    }
  }

  const handlePublish = async () => {
    if (!titulo || !mensaje) {
      alert('El título y el mensaje son obligatorios.')
      return
    }

    if (!window.confirm(`¿Está seguro de publicar el comunicado "${titulo}" y enviar notificaciones push a la comunidad?`)) {
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase.rpc('rpc_publish_announcement', {
        p_titulo: titulo,
        p_mensaje: generatedMessage,
        p_tipo: tipo,
        p_cluster: targetCluster === 'general' ? null : targetCluster,
        p_push_title: pushPreview.title,
        p_push_body: pushPreview.body,
        p_metadata: { template: tipo, fecha, hora, lugar },
        p_send_push: sendPush,
        p_test_only: false
      })

      if (error) throw error

      const res = data as any
      alert(`¡Comunicado publicado con éxito! Push enviados a ${res?.push_recipients || 0} residentes.`)

      // Reset form
      setTitulo('')
      setMensaje('')
      setFecha('')
      setHora('')
      setLugar('')
      setNotaImportante('')
      setContacto('')
      fetchHistory()
    } catch (err: any) {
      alert('Error al publicar comunicado: ' + (err.message || err))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Desea eliminar este comunicado?')) return
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', id)
      if (error) throw error
      fetchHistory()
    } catch (err: any) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
      {/* Formulario Editor */}
      <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <MdOutlineCampaign size={28} style={{ color: 'var(--primary-color)' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>Redactor de Comunicados & Push</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Tipo de Comunicado</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as any)}
              style={inputStyle}
            >
              <option value="general">📢 General / Informativo</option>
              <option value="asamblea">🏛️ Convocatoria a Asamblea</option>
              <option value="urgente">🚨 Aviso Urgente</option>
              <option value="mantenimiento">🔧 Mantenimiento Programado</option>
              <option value="finanzas">💳 Finanzas / Cuotas</option>
            </select>
          </div>

          {isSuperAdmin && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Conjunto Residencial Destino</label>
              <select
                value={targetCluster}
                onChange={(e) => setTargetCluster(e.target.value)}
                style={inputStyle}
              >
                <option value="general">🌐 Todos los conjuntos (General)</option>
                {Object.entries(RESIDENTIAL_CLUSTERS).map(([etapa, conjuntos]) => (
                  <optgroup key={etapa} label={etapa}>
                    {conjuntos.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Título del Comunicado</label>
            <input
              type="text"
              placeholder="Ej. Mantenimiento de bomba de agua principal"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              style={inputStyle}
              maxLength={150}
            />
          </div>

          {(tipo === 'asamblea' || tipo === 'mantenimiento' || tipo === 'finanzas') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Fecha</label>
                <input
                  type="text"
                  placeholder="Ej. 15 de Octubre, 2026"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Hora</label>
                <input
                  type="text"
                  placeholder="Ej. 09:00 AM"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {(tipo === 'asamblea' || tipo === 'mantenimiento') && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Lugar / Zona</label>
              <input
                type="text"
                placeholder="Ej. Salón de Usos Múltiples / Torre B"
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
                style={inputStyle}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Mensaje Principal</label>
            <textarea
              rows={5}
              placeholder="Escriba los detalles del comunicado..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              style={{ ...inputStyle, resize: 'vertical' }}
              maxLength={2000}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Nota Importante / Advertencia (Opcional)</label>
            <input
              type="text"
              placeholder="Ej. Asistencia puntual obligatoria"
              value={notaImportante}
              onChange={(e) => setNotaImportante(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Contacto / Teléfono / Email (Opcional)</label>
            <input
              type="text"
              placeholder="Ej. administracion@caminos.com"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <input
              type="checkbox"
              id="sendPushCheck"
              checked={sendPush}
              onChange={(e) => setSendPush(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
            />
            <label htmlFor="sendPushCheck" style={{ fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Enviar notificación Push inmediata a los residentes
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '15px' }}>
            <button
              onClick={handleTestNotification}
              disabled={testLoading}
              style={{ ...secondaryBtnStyle, flex: 1 }}
            >
              <MdPhoneAndroid size={18} /> {testLoading ? 'Enviando...' : 'Probar en mi Móvil'}
            </button>
            <button
              onClick={handlePublish}
              disabled={loading}
              style={{ ...primaryBtnStyle, flex: 1 }}
            >
              <MdSend size={18} /> {loading ? 'Publicando...' : 'Publicar Comunicado'}
            </button>
          </div>
        </div>
      </div>

      {/* Previsualización en Vivo & Historial */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '15px', color: 'var(--primary-color)' }}>📱 Vista Previa Notificación Push</h4>
          <div style={{ backgroundColor: '#1e1e1e', color: 'white', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.7, marginBottom: '4px' }}>
              <span>CaminosApp • Ahora</span>
              <span>🔔</span>
            </div>
            <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '14px' }}>{pushPreview.title || 'Título de Notificación'}</p>
            <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>{pushPreview.body || 'Cuerpo del mensaje push...'}</p>
          </div>

          <h4 style={{ fontSize: '16px', fontWeight: 700, marginTop: '25px', marginBottom: '15px', color: 'var(--primary-color)' }}>📄 Vista Previa Comunicado (Comunidad)</h4>
          <div style={{ backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', whiteSpace: 'pre-wrap', fontSize: '13px', lineHeight: '1.6' }}>
            <strong>{titulo || '[Título del Comunicado]'}</strong>
            <div style={{ margin: '10px 0', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              {generatedMessage || 'El contenido formateado aparecerá aquí...'}
            </div>
          </div>
        </div>

        {/* Historial Reciente */}
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <MdHistory size={22} style={{ color: 'var(--primary-color)' }} />
            <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Comunicados Recientes</h4>
          </div>

          {history.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-sub)', textAlign: 'center' }}>No hay comunicados publicados aún.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
              {history.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', backgroundColor: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ overflow: 'hidden', paddingRight: '10px' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.titulo}</p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-sub)' }}>
                      {new Date(item.fecha_creacion).toLocaleDateString()} • {item.push_recipients || 0} push
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{ background: 'none', border: 'none', color: '#ba1a1a', cursor: 'pointer', padding: '6px' }}
                    title="Eliminar comunicado"
                  >
                    <MdDelete size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const inputStyle = { width: '100%', padding: '12px 16px', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-color)', fontSize: '14px', boxSizing: 'border-box' as any }
const primaryBtnStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }
const secondaryBtnStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', backgroundColor: 'var(--icon-bg)', color: 'var(--primary-color)', border: '1px solid var(--border-color)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }
