import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, UserRole } from '../../store/useAuthStore'
import { sanitizeString } from '../../utils/security'
import { Logo } from '../../components/Logo'

const DEMO_USERS = [
  { email: 'admin@caminos.com', pass: 'admin123', role: 'admin' as UserRole, name: 'Admin', last: 'Caminos' },
  { email: 'residente@caminos.com', pass: 'residente123', role: 'resident' as UserRole, name: 'Juan', last: 'Pérez', cluster: 'Punta de Piedra', house: '14-42' },
  { email: 'vigilante@caminos.com', pass: 'vigilante123', role: 'guard' as UserRole, name: 'Carlos', last: 'Seguridad' },
]

export const Login: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const setUser = useAuthStore(state => state.setUser)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const cleanEmail = sanitizeString(email).toLowerCase()
    const cleanPass = password

    setTimeout(() => {
      const found = DEMO_USERS.find(u => u.email === cleanEmail && u.pass === cleanPass)

      if (found) {
        setUser({
          id: Math.random().toString(),
          email: found.email,
          first_name: found.name,
          last_name: found.last,
          role: found.role,
          residential_cluster: found.cluster,
          house_number: found.house
        })

        if (found.role === 'admin') navigate('/admin')
        else if (found.role === 'guard') navigate('/guard')
        else navigate('/dashboard')
      } else {
        alert("Credenciales incorrectas. Prueba con:\nadmin@caminos.com / admin123\nresidente@caminos.com / residente123\nvigilante@caminos.com / vigilante123")
      }
      setLoading(false)
    }, 800)
  }

  return (
    <div style={{
      height: '100vh', width: '100vw', backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif"
    }}>
       <header style={{ position: 'fixed', top: 0, left: 0, width: '100%', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/auth')}
            style={{ position: 'absolute', left: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--text-color)' }}>arrow_back</span>
          </button>
          <Logo height={50} />
       </header>

       <main style={{ width: '100%', maxWidth: '450px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '28px', padding: '40px', boxSizing: 'border-box', boxShadow: '0 10px 40px rgba(0,0,0,0.04)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '36px', color: 'var(--primary-color)', margin: '0 0 10px 0', fontFamily: "'EB Garamond', serif", fontWeight: 700 }}>Bienvenido</h1>
            <div style={{ width: '40px', height: '3px', backgroundColor: 'var(--accent-gold)', margin: '0 auto 15px', borderRadius: '2px' }}></div>
            <p style={{ color: 'var(--text-sub)', fontSize: '15px', margin: 0, fontWeight: 500 }}>Inicie sesión con las credenciales de prueba</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             <div style={{ textAlign: 'left' }}>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@caminos.com" style={inputStyle} />
             </div>

             <div style={{ textAlign: 'left' }}>
                <label style={labelStyle}>Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={inputStyle} />
             </div>

             <button type="submit" disabled={loading} style={{ width: '100%', padding: '18px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', marginTop: '10px', boxShadow: '0 8px 20px rgba(15,85,81,0.2)' }}>
                {loading ? 'Ingresando...' : 'Ingresar al Portal'}
             </button>
          </form>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'var(--icon-bg)', borderRadius: '12px', fontSize: '12px', color: 'var(--text-sub)' }}>
             <strong>Credenciales demo:</strong><br/>
             Admin: admin@caminos.com / admin123<br/>
             Residente: residente@caminos.com / residente123<br/>
             Vigilante: vigilante@caminos.com / vigilante123
          </div>
       </main>
    </div>
  )
}

const labelStyle = { display: 'block' as const, fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '1px' }
const inputStyle = { width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', fontSize: '16px', boxSizing: 'border-box' as const, outline: 'none', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)' }
