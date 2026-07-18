// Creado por Jesús Pirela.
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuthStore, UserRole } from '../../store/useAuthStore'
import { sanitizeString, isValidEmail } from '../../utils/security'
import icono from '../../assets/icono.png'
import { supabase } from '../../lib/supabase'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { setUser, whitelist } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isForgot, setIsForgot] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const cleanEmail = sanitizeString(email).trim().toLowerCase()
    const cleanPassword = password.trim()

    // 1. Intentar validación con Whitelist (Excel de la imagen)
    const localUser = whitelist.find(u =>
      u.email.toLowerCase().trim() === cleanEmail &&
      u.password.toLowerCase().trim() === cleanPassword.toLowerCase()
    )

    if (localUser) {
      let role: UserRole = 'resident'

      if (localUser.email.toLowerCase().trim() === 'admin@caminos.com') {
        role = 'superadmin'
      } else if (localUser.role === 'ADMINISTRADOR') {
        role = 'admin'
      } else if (localUser.role === 'VIGILANTE') {
        role = 'guard'
      }

      setUser({
        id: localUser.id,
        email: localUser.email,
        first_name: localUser.name.split(' ')[0],
        last_name: localUser.name.split(' ')[1] || '',
        role,
        residential_cluster: localUser.conjunto,
        house_number: localUser.house_number,
        etapa: localUser.etapa
      })

      if (role === 'superadmin' || role === 'admin') navigate('/admin')
      else if (role === 'guard') navigate('/guard')
      else navigate('/dashboard')

      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      })

      if (error) throw error

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()

        if (profileError) throw profileError

        if (!profile) {
          await supabase.auth.signOut()
          alert(`Cuenta sin perfil: El usuario (${data.user.email}) existe pero no tiene un perfil vinculado. Por favor, regístrese nuevamente o contacte a soporte.`)
          setLoading(false)
          return
        }

        setUser({
          id: data.user.id,
          email: data.user.email || '',
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: profile.role as UserRole,
          residential_cluster: profile.residential_cluster,
          house_number: profile.house_number
        })

        if (profile.role === 'admin' || profile.role === 'superadmin') navigate('/admin')
        else if (profile.role === 'guard') navigate('/guard')
        else navigate('/dashboard')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      const msg = error.message || 'Error al iniciar sesión. Verifique sus credenciales.'
      if (msg.includes('Load failed')) {
        alert('Error de conexión (Load failed). Por favor, verifique su internet o intente nuevamente.')
      } else {
        alert(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) {
      alert('Por favor, ingrese un correo electrónico válido.')
      return
    }

    setLoading(true)
    try {
      const cleanEmail = sanitizeString(email).toLowerCase().trim()

      // Para recuperación de contraseña en producción, el redirectTo debe ser la URL pública.
      // Si aún no tienes dominio, se recomienda usar la URL de Vercel/Netlify.
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/login`,
      })

      if (error) throw error
      alert('Se ha enviado un enlace de recuperación a su correo. Revise su bandeja de entrada (y spam).')
      setResetSent(true)
      setIsForgot(false)
    } catch (error: any) {
      alert('Error: ' + (error.message || 'No se pudo enviar el enlace. Verifique que el correo esté registrado.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100%', overflowX: 'hidden', backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'env(safe-area-inset-top) 24px env(safe-area-inset-bottom) 24px', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif"
    }}>
       <header style={{ position: 'fixed', top: 0, left: 0, width: '100%', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/auth')}
            style={{ position: 'absolute', left: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}
          >
            <ArrowLeft size={24} color="#0f5551" />
          </button>
       </header>

       <main style={{ width: '100%', maxWidth: '450px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '32px', padding: '32px', boxSizing: 'border-box', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <img src={icono} alt="Logo" style={{ width: '100px', height: 'auto', marginBottom: '16px' }} />
            <h1 style={{ fontSize: '28px', color: 'var(--primary-color)', margin: '0 0 8px 0', fontFamily: "'EB Garamond', serif", fontWeight: 700 }}>
              {isForgot ? 'Recuperar' : t('auth.login')}
            </h1>
            <p style={{ color: 'var(--text-sub)', fontSize: '15px', margin: 0 }}>
              {isForgot ? 'Ingresa tu correo' : 'Ingresa tus credenciales'}
            </p>
          </div>

          {!isForgot ? (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div style={{ textAlign: 'left' }}>
                  <label style={labelStyle}>{t('auth.email')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="ejemplo@correo.com"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    style={inputStyle}
                  />
               </div>

               <div style={{ textAlign: 'left' }}>
                  <label style={labelStyle}>{t('auth.password')}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      style={{ ...inputStyle, paddingRight: '50px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-color)',
                        padding: '8px',
                        zIndex: 10
                      }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
               </div>

               <button type="submit" disabled={loading} style={primaryBtnStyle}>
                  {loading ? t('common.loading') : t('auth.login')}
               </button>

               <button
                  type="button"
                  onClick={() => setIsForgot(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-color)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
            </form>
          ) : (
            /* Forgot password UI unchanged */
            <div style={{ textAlign: 'center' }}>
                <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="su@email.com"
                    autoCorrect="off"
                    spellCheck="false"
                    style={inputStyle}
                  />
                  <button type="submit" disabled={loading} style={primaryBtnStyle}>Enviar Enlace</button>
                  <button type="button" onClick={() => setIsForgot(false)} style={{ background: 'none', border: 'none' }}>Volver</button>
                </form>
            </div>
          )}
       </main>
    </div>
  )
}

const labelStyle = { display: 'block' as const, fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '8px' }
const inputStyle = { width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', fontSize: '16px', boxSizing: 'border-box' as const, outline: 'none', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)' }
const primaryBtnStyle = { width: '100%', padding: '18px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 700, fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(15,85,81,0.2)' }
