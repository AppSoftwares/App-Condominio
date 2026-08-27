import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { supabase } from '../../shared/lib/supabase'
import icono from '../../assets/icono.png'

const resetSchema = z.object({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
})

type ResetFormValues = z.infer<typeof resetSchema>

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isInvitation, setIsInvitation] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema)
  })

  useEffect(() => {
    let handled = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        handled = true
        setMessage('')
      }
      if (session?.user) {
        setIsInvitation(session.user.user_metadata?.password_set === false)
      }
    })

    // Si el evento ya se disparó antes de montar este componente, valida con getSession()
    const checkExisting = async () => {
      const { data } = await supabase.auth.getSession()
      if (data.session) {
        handled = true
        setMessage('')
        setIsInvitation(data.session.user.user_metadata?.password_set === false)
      } else if (!handled) {
        // Pequeño retardo para dar tiempo al procesamiento del hash
        setTimeout(async () => {
          if (!handled) {
            const { data: retry } = await supabase.auth.getSession()
            if (retry.session) setMessage('')
            else setMessage('Enlace inválido o expirado. Solicite uno nuevo desde Login.')
          }
        }, 1500)
      }
    }
    checkExisting()

    return () => subscription.unsubscribe()
  }, [])

  const handleUpdatePassword = async (values: ResetFormValues) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
        data: { password_set: true }
      })
      if (error) throw error
      alert(isInvitation ? '¡Bienvenido! Su clave ha sido configurada. Ya puede iniciar sesión.' : 'Contraseña actualizada con éxito. Inicie sesión con sus nuevas credenciales.')
      navigate('/login')
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)', padding: '20px' }}>
      <main style={{ width: '100%', maxWidth: '400px', backgroundColor: 'var(--card-bg)', borderRadius: '32px', padding: '32px', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
        <img src={icono} alt="Logo" style={{ width: '80px', marginBottom: '20px' }} />
        <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '24px', color: 'var(--primary-color)', marginBottom: '10px' }}>
          {isInvitation ? 'Configurar Contraseña' : 'Nueva Contraseña'}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: '30px' }}>
          {message || (isInvitation ? 'Bienvenido al condominio. Por favor, defina su clave de acceso.' : 'Ingrese su nueva clave de acceso.')}
        </p>

        {!message ? (
          <form onSubmit={handleSubmit(handleUpdatePassword)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ textAlign: 'left' }}>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                {...register('password')}
                style={{ width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)', boxSizing: 'border-box' }}
              />
              {errors.password && <span style={{ color: '#ba1a1a', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.password.message}</span>}
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '18px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? 'Actualizando...' : 'ACTUALIZAR CONTRASEÑA'}
            </button>
          </form>
        ) : (
          <button onClick={() => navigate('/login')} style={{ width: '100%', padding: '18px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 700, cursor: 'pointer' }}>
            VOLVER AL LOGIN
          </button>
        )}
      </main>
    </div>
  )
}
