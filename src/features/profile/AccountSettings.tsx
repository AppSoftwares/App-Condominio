import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

export const AccountSettings: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [email, setEmail] = useState(user?.email || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleUpdateEmail = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      alert("Correo actualizado con éxito (Simulación)")
      setLoading(false)
    }, 1000)
  }

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) return alert("Las contraseñas no coinciden")
    setLoading(true)
    setTimeout(() => {
      alert("Contraseña cambiada con éxito (Simulación)")
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setLoading(false)
    }, 1000)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', fontFamily: "'Inter', sans-serif", color: '#1B1C1A', paddingBottom: '40px' }}>
      <header style={{
        position: 'fixed', top: 0, width: '100%', height: '64px', backgroundColor: '#FAF8F5',
        borderBottom: '1px solid #bfc8c7', display: 'flex', alignItems: 'center', padding: '0 20px',
        zIndex: 100, boxSizing: 'border-box'
      }}>
        <button
          onClick={() => navigate('/profile')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#1B1C1A' }}>arrow_back</span>
        </button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '18px', marginLeft: '15px', color: '#0f5551', fontWeight: 700, textTransform: 'uppercase' }}>Configuración de Cuenta</h1>
      </header>

      <main style={{ paddingTop: '84px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '500px', margin: '0 auto' }}>

        {/* Update Email Section */}
        <section style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '18px', color: '#0f5551', marginBottom: '20px', fontWeight: 700 }}>Actualizar Correo</h3>
          <form onSubmit={handleUpdateEmail} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Dirección de Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <button type="submit" disabled={loading} style={primaryBtnStyle}>Guardar Cambios</button>
          </form>
        </section>

        {/* Change Password Section */}
        <section style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '18px', color: '#0f5551', marginBottom: '20px', fontWeight: 700 }}>Cambiar Contraseña</h3>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={labelStyle}>Contraseña Actual</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                style={inputStyle}
                required
                placeholder="••••••••"
              />
            </div>
            <div>
              <label style={labelStyle}>Nueva Contraseña</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={inputStyle}
                required
                placeholder="Mín. 8 caracteres"
              />
            </div>
            <div>
              <label style={labelStyle}>Confirmar Nueva Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={inputStyle}
                required
                placeholder="Repita la nueva contraseña"
              />
            </div>
            <button type="submit" disabled={loading} style={primaryBtnStyle}>Actualizar Contraseña</button>
          </form>
        </section>

        <p style={{ textAlign: 'center', marginTop: '30px', fontSize: '12px', color: '#6f7978', lineHeight: '1.5' }}>
          Para proteger su privacidad, nunca comparta sus credenciales de acceso con terceros.
        </p>
      </main>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 700, color: '#3d503e', marginBottom: '8px', textTransform: 'uppercase' as const }
const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '10px', border: '1px solid #bfc8c7', fontSize: '15px', boxSizing: 'border-box' as const, outline: 'none' }
const primaryBtnStyle = { width: '100%', padding: '14px', backgroundColor: '#2f6d69', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '14px', marginTop: '5px' }
