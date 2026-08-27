// Creado por Jesús Pirela.
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { FcGoogle } from 'react-icons/fc'
import { Browser } from '@capacitor/browser'
import { Capacitor } from '@capacitor/core'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore, UserRole } from '../../store/useAuthStore'
import { sanitizeString, isValidEmail } from '../../utils/security'
import icono from '../../assets/icono.png'
import { supabase } from '../../lib/supabase'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña obligatoria')
})

type LoginFormValues = z.infer<typeof loginSchema>

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido')
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { setUser, whitelist } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isForgot, setIsForgot] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const { register: registerLogin, handleSubmit: handleSubmitLogin, formState: { errors: loginErrors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema)
  })

  const { register: registerForgot, handleSubmit: handleSubmitForgot, formState: { errors: forgotErrors } } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const { sync: syncAuth } = useAuthStore()

  const iniciarGmail = async () => {
    setLoading(true)
    try {
      const isNative = Capacitor.isNativePlatform()
      // Usar la URL de producción para App Links / Universal Links
      // Esto permite que el SO detecte si debe abrir la App o el Navegador
      const redirectTo = 'https://app-condominio.vercel.app/login-callback'

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: isNative
        }
      })

      if (error) throw error

      if (isNative && data?.url) {
        await Browser.open({ url: data.url, windowName: '_self' })
      }
    } catch (error: any) {
      console.error('Google Auth Error:', error)
      alert('Error al iniciar con Google: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (values: LoginFormValues) => {
    setLoading(true)

    const cleanEmail = sanitizeString(values.email).trim().toLowerCase()
    const cleanPassword = values.password.trim()

    // 1. Intentar validación con Whitelist (Excel de la imagen)
    const localUser = whitelist.find(u =>
      (u.email || '').toString().toLowerCase().trim() === cleanEmail &&
      (u.password || '').toString().toLowerCase().trim() === cleanPassword.toLowerCase()
    )

    if (localUser) {
      let role: UserRole = 'resident'

      if (localUser.role === 'superadmin') {
        role = 'superadmin'
      } else if (localUser.role === 'ADMINISTRADOR') {
        role = 'admin'
      } else if (localUser.role === 'VIGILANTE') {
        role = 'guard'
      }

      const fullName = (localUser.name || 'Usuario').toString()
      const nameParts = fullName.split(' ')

      setUser({
        id: localUser.id || Date.now().toString(),
        email: (localUser.email || '').toString(),
        first_name: nameParts[0] || 'Usuario',
        last_name: nameParts.slice(1).join(' ') || '',
        role,
        residential_cluster: localUser.conjunto || localUser.residential_cluster,
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
        password: values.password,
      })

      if (error) throw error

      if (data.user) {
        // Delegar la obtención y validación del perfil al Store
        // El Store ahora busca por Email si el ID no coincide y revisa la Whitelist
        await syncAuth()

        const currentUser = useAuthStore.getState().user

        if (!currentUser) {
          // El error ya fue notificado por el Store (getOrCreateProfile)
          setLoading(false)
          return
        }

        if (currentUser.role === 'admin' || currentUser.role === 'superadmin') navigate('/admin')
        else if (currentUser.role === 'guard') navigate('/guard')
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

  const handleResetPassword = async (values: ForgotPasswordFormValues) => {
    setLoading(true)
    try {
      const cleanEmail = sanitizeString(values.email).toLowerCase().trim()

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
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
       <header style={{ position: 'fixed', top: 0, left: 0, width: '100%', padding: 'calc(20px + env(safe-area-inset-top)) 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <button
            onClick={() => navigate('/auth')}
            style={{ position: 'absolute', left: '20px', top: 'calc(48px + env(safe-area-inset-top))', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', zIndex: 101 }}
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
            <form onSubmit={handleSubmitLogin(handleLogin)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <div style={{ textAlign: 'left' }}>
                  <label style={labelStyle}>{t('auth.email')}</label>
                  <input
                    {...registerLogin('email')}
                    placeholder="ejemplo@correo.com"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck="false"
                    style={inputStyle}
                  />
                  {loginErrors.email && <span style={{ color: '#ba1a1a', fontSize: '12px' }}>{loginErrors.email.message}</span>}
               </div>

               <div style={{ textAlign: 'left' }}>
                  <label style={labelStyle}>{t('auth.password')}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      {...registerLogin('password')}
                      type={showPassword ? "text" : "password"}
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
                  {loginErrors.password && <span style={{ color: '#ba1a1a', fontSize: '12px' }}>{loginErrors.password.message}</span>}
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

               <div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
                  <span style={{ padding: '0 10px', color: 'var(--text-sub)', fontSize: '13px' }}>o continúa con</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
               </div>

               <button
                  type="button"
                  onClick={iniciarGmail}
                  disabled={loading}
                  style={googleBtnStyle}
               >
                  <FcGoogle size={20} />
                  Google
               </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
                <form onSubmit={handleSubmitForgot(handleResetPassword)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <input
                    {...registerForgot('email')}
                    placeholder="su@email.com"
                    autoCorrect="off"
                    spellCheck="false"
                    style={inputStyle}
                  />
                  {forgotErrors.email && <span style={{ color: '#ba1a1a', fontSize: '12px', textAlign: 'left' }}>{forgotErrors.email.message}</span>}
                  <button type="submit" disabled={loading} style={primaryBtnStyle}>Enviar Enlace</button>
                  <button type="button" onClick={() => setIsForgot(false)} style={{ background: 'none', border: 'none', color: 'var(--text-sub)', cursor: 'pointer' }}>Volver</button>
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
const googleBtnStyle = { ...primaryBtnStyle, backgroundColor: 'white', color: '#444', border: '1px solid var(--border-color)', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '5px' }
