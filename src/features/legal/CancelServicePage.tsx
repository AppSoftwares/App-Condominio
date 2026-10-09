import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldAlert } from 'lucide-react'
import { useAuthStore } from '../../app/store/useAuthStore'
import { supabase } from '../../shared/lib/supabase'
import { ConsentCheckbox } from './ConsentCheckbox'

export const CancelServicePage: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [confirmed, setConfirmed] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isAdminOrSuper = user?.role === 'admin' || user?.role === 'superadmin'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAdminOrSuper) return alert('Acceso restringido a administradores.')
    if (!confirmed) return alert('Debes confirmar la solicitud de cancelación.')
    if (!user) return alert('No hay sesión activa.')

    setLoading(true)
    try {
      const { error } = await supabase.from('data_requests').insert({
        user_id: user.id,
        request_type: 'service_cancellation',
        contact_email: user.email,
        reason: reason || 'Solicitud de cancelación del servicio de suscripción del condominio'
      })
      if (error) throw error
      setSubmitted(true)
    } catch (err: any) {
      alert('Error al enviar la solicitud: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', paddingBottom: '60px' }}>
      <header style={{ height: '64px', backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 20px', position: 'relative', justifyContent: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ position: 'absolute', left: '20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <ArrowLeft size={24} color="var(--primary-color)" />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--primary-color)' }}>Cancelar Suscripción del Condominio</h1>
      </header>

      <main style={{ maxWidth: '500px', margin: '30px auto', padding: '0 20px' }}>
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '28px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: 'var(--accent-gold)' }}>
            <ShieldAlert size={32} />
            <h2 style={{ fontSize: '20px', margin: 0, fontWeight: 700 }}>Proceso de Cancelación</h2>
          </div>

          <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-sub)', marginBottom: '15px' }}>
            Conforme a los Términos y Condiciones (§10), la cancelación de la suscripción del condominio requiere un aviso previo de <strong>30 días</strong>.
          </p>
          <ul style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-sub)', paddingLeft: '20px', marginBottom: '25px' }}>
            <li>Tendrás 30 días para exportar todos tus datos y respaldos en CSV/Excel.</li>
            <li>La purga y desactivación definitiva de los servidores ocurrirá a los 60 días.</li>
          </ul>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(39,174,96,0.1)', borderRadius: '16px', color: 'var(--success-color)' }}>
              <p style={{ fontWeight: 700, margin: '0 0 8px 0' }}>Solicitud de cancelación registrada</p>
              <p style={{ fontSize: '13px', margin: 0 }}>Nos pondremos en contacto vía correo electrónico para confirmar la fecha efectiva de baja.</p>
              <button onClick={() => navigate('/profile')} style={{ marginTop: '20px', padding: '12px 24px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Volver al Perfil</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '8px' }}>Motivo de la cancelación</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Explícanos brevemente el motivo..."
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)', height: '90px', resize: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <ConsentCheckbox id="cancel-confirm" checked={confirmed} onChange={setConfirmed} required>
                  Comprendo los plazos de aviso previo y la política de retención y eliminación de datos del servicio.
                </ConsentCheckbox>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => navigate(-1)} style={{ flex: 1, padding: '16px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', color: 'var(--text-color)' }}>Volver</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '16px', background: '#ba1a1a', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>{loading ? 'Enviando...' : 'Solicitar cancelación'}</button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
