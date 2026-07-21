import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { MdOutlineVisibility, MdOutlineVisibilityOff } from 'react-icons/md'
import { supabase } from '../../lib/supabase'

export const Account: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email === user?.email) return alert("Ingresa un correo distinto al actual")

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ email })
      if (error) throw error
      alert("Se ha enviado un enlace de confirmación a tu nuevo correo. Revisa tu bandeja de entrada.")
    } catch (err: any) {
      alert("Error al actualizar correo: " + (err.message || "Error desconocido"))
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) return alert("La nueva contraseña debe tener al menos 8 caracteres")
    if (newPassword !== confirmPassword) return alert("Las contraseñas no coinciden")

    setLoading(true)
    try {
      // Reautenticar con la contraseña actual antes de permitir el cambio
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      })

      if (reauthError) {
        alert("La contraseña actual es incorrecta")
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      alert("Contraseña actualizada con éxito")
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      alert("Error al actualizar contraseña: " + (err.message || "Error desconocido"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', paddingBottom: '40px' }}>
      <main style={{ paddingLeft: '20px', paddingRight: '20px', maxWidth: '500px', margin: '0 auto', paddingTop: '10px' }}>

        {/* Update Email Section */}
        <section style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--primary-color)', marginBottom: '20px', fontWeight: 700 }}>Actualizar Correo</h3>
          <form onSubmit={handleUpdateEmail} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Dirección de Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ ...inputStyle, backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)' }}
                required
              />
            </div>
            <button type="submit" disabled={loading} style={primaryBtnStyle}>Guardar Cambios</button>
          </form>
        </section>

        {/* Change Password Section */}
        <section style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '18px', color: 'var(--primary-color)', marginBottom: '20px', fontWeight: 700 }}>Cambiar Contraseña</h3>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ position: 'relative' }}>
              <label style={labelStyle}>Contraseña Actual</label>
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={{ ...inputStyle, backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)' }}
                required
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                style={eyeBtnStyle}
              >
                {showCurrent ? <MdOutlineVisibilityOff size={20} /> : <MdOutlineVisibility size={20} />}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <label style={labelStyle}>Nueva Contraseña</label>
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ ...inputStyle, backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)' }}
                required
                placeholder="Mín. 8 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={eyeBtnStyle}
              >
                {showNew ? <MdOutlineVisibilityOff size={20} /> : <MdOutlineVisibility size={20} />}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <label style={labelStyle}>Confirmar Nueva Contraseña</label>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ ...inputStyle, backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)' }}
                required
                placeholder="Repita la nueva contraseña"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={eyeBtnStyle}
              >
                {showConfirm ? <MdOutlineVisibilityOff size={20} /> : <MdOutlineVisibility size={20} />}
              </button>
            </div>
            <button type="submit" disabled={loading} style={primaryBtnStyle}>Actualizar Contraseña</button>
          </form>
        </section>

        <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '12px', color: 'var(--text-sub)', lineHeight: '1.5' }}>
          Para proteger su privacidad, nunca comparta sus credenciales de acceso con terceros.
        </p>
      </main>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '8px', textTransform: 'uppercase' as const }
const inputStyle = { width: '100%', padding: '12px 15px', paddingRight: '45px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '15px', boxSizing: 'border-box' as const, outline: 'none' }
const primaryBtnStyle = { width: '100%', padding: '14px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', marginTop: '5px' }
const eyeBtnStyle = { position: 'absolute' as const, right: '10px', bottom: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#6f7978', display: 'flex', alignItems: 'center', justifyContent: 'center' }
