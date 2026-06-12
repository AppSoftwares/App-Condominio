// Creado por Jesús Pirela.
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, UserRole } from '../../store/useAuthStore'
import { sanitizeString } from '../../utils/security'
import { Logo } from '../../components/Logo'
import { supabase } from '../../lib/supabase'

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const { setUser, whitelist } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const cleanEmail = sanitizeString(email).toLowerCase().trim()

    // 1. Intentar validación con Whitelist (Excel)
    let localUser = whitelist.find(u => u.email === cleanEmail && u.password === password)

    // Fallback manual para asegurar acceso inicial si la lista está vacía o no ha cargado
    if (!localUser && cleanEmail === 'jess.pirela@gmail.com' && password === 'JESS.HUERTAS.123') {
      localUser = { id: 'admin-master', name: 'JESÚS PIRELA', email: cleanEmail, role: 'Administrador', house_number: '14-28' };
    }
    if (!localUser && cleanEmail === 'ofi.pirela@gmail.com' && password === 'CARLOS.HUERTAS.123') {
      localUser = { id: 'res-master', name: 'CARLOS PIRELA', email: cleanEmail, role: 'Residente', house_number: '14-27' };
    }

    if (localUser) {
      const role = localUser.role.toLowerCase() === 'administrador' ? 'admin' : 'resident';
      setUser({
        id: localUser.id.toString(),
        email: localUser.email,
        first_name: localUser.name.split(' ')[0],
        last_name: localUser.name.split(' ')[1] || '',
        role: role as UserRole,
        residential_cluster: 'Las Huertas',
        house_number: localUser.house_number
      })

      if (role === 'admin') navigate('/admin')
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
          .single()

        if (profileError) throw profileError

        setUser({
          id: data.user.id,
          email: data.user.email || '',
          first_name: profile.first_name,
          last_name: profile.last_name,
          role: profile.role as UserRole,
          residential_cluster: profile.residential_cluster,
          house_number: profile.house_number
        })

        if (profile.role === 'admin') navigate('/admin')
        else if (profile.role === 'guard') navigate('/guard')
        else navigate('/dashboard')
      }
    } catch (error: any) {
      alert(error.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      height: '100vh', width: '100%', overflowX: 'hidden', backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif"
    }}>
       <header style={{ position: 'fixed', top: 0, left: 0, width: '100%', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/auth')}
            style={{ position: 'absolute', left: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="currentColor"/>
            </svg>
          </button>
          <Logo height={50} />
       </header>

       <main style={{ width: '100%', maxWidth: '450px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '28px', padding: '40px', boxSizing: 'border-box', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '36px', color: 'var(--primary-color)', margin: '0 0 10px 0', fontFamily: "'EB Garamond', serif", fontWeight: 700 }}>Bienvenido</h1>
            <div style={{ width: '40px', height: '3px', backgroundColor: 'var(--accent-gold)', margin: '0 auto 15px', borderRadius: '2px' }}></div>
            <p style={{ color: 'var(--text-sub)', fontSize: '15px', margin: 0, fontWeight: 500 }}>Inicie sesión en su cuenta</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <div style={{ textAlign: 'left' }}>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="su@email.com" style={inputStyle} />
             </div>

             <div style={{ textAlign: 'left' }}>
                <label style={labelStyle}>Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={inputStyle} />
             </div>

             <button type="submit" disabled={loading} style={{ width: '100%', padding: '18px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 8px 20px rgba(15,85,81,0.2)' }}>
                {loading ? 'Ingresando...' : 'Ingresar al Portal'}
             </button>
          </form>
       </main>
    </div>
  )
}

const labelStyle = { display: 'block' as const, fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '1px' }
const inputStyle = { width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', fontSize: '16px', boxSizing: 'border-box' as const, outline: 'none', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)' }
