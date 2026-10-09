import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '../../app/store/useAuthStore'
import { supabase } from '../../shared/lib/supabase'
import { ConsentCheckbox } from './ConsentCheckbox'

export const DeleteAccountPage: React.FC = () => {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const [understood, setUnderstood] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!understood) return alert('Debes confirmar que entiendes que esta acción es irreversible.')
    if (!user) return alert('No hay sesión activa.')

    setLoading(true)
    try {
      const { error } = await supabase.from('data_requests').insert({
        user_id: user.id,
        request_type: 'account_deletion',
        contact_email: user.email,
        reason: reason || 'Solicitud de eliminación de cuenta por parte del usuario'
      })

      if (error) throw error

      await supabase.from('profiles').update({ deletion_requested_at: new Date().toISOString() }).eq('id', user.id)

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
        <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: 'var(--primary-color)' }}>Eliminar Cuenta</h1>
      </header>

      <main style={{ maxWidth: '500px', margin: '30px auto', padding: '0 20px' }}>
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '28px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: '#ba1a1a' }}>
            <AlertTriangle size={32} />
            <h2 style={{ fontSize: '20px', margin: 0, fontWeight: 700 }}>Acción Irreversible</h2>
          </div>

          <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-sub)', marginBottom: '20px' }}>
            De conformidad con nuestra Política de Privacidad, al solicitar la eliminación de tu cuenta se borrarán tus datos personales de contacto, avatar, tokens de notificaciones y sesiones activas en un plazo máximo de <strong>30 días</strong>.
          </p>
          <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-sub)', marginBottom: '25px' }}>
            Nota: Por obligación legal fiscal y contable, los comprobantes de pago y registros de asambleas se conservarán anonimizados por un período de <strong>5 años</strong>.
          </p>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(39,174,96,0.1)', borderRadius: '16px', color: 'var(--success-color)' }}>
              <p style={{ fontWeight: 700, margin: '0 0 8px 0' }}>Solicitud recibida con éxito</p>
              <p style={{ fontSize: '13px', margin: 0 }}>Te hemos enviado un acuse de recibo. Procesaremos tu solicitud en &lt;= 72 h.</p>
              <button onClick={() => navigate('/profile')} style={{ marginTop: '20px', padding: '12px 24px', background: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>Volver al Perfil</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '8px' }}>Motivo (Opcional)</label>
                <textarea
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="¿Por qué deseas eliminar tu cuenta?"
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)', height: '90px', resize: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <ConsentCheckbox id="del-confirm" checked={understood} onChange={setUnderstood} required>
                  Entiendo que esta acción es irreversible y conlleva la pérdida de acceso al sistema del condominio.
                </ConsentCheckbox>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => navigate(-1)} style={{ flex: 1, padding: '16px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', color: 'var(--text-color)' }}>Cancelar</button>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '16px', background: '#ba1a1a', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>{loading ? 'Enviando...' : 'Solicitar eliminación'}</button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
