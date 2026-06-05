import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, UserRole } from '../../store/useAuthStore'

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

    // Simulate API delay
    setTimeout(() => {
      const found = DEMO_USERS.find(u => u.email === email && u.pass === password)

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
      height: '100vh', width: '100vw', backgroundColor: '#FAF8F5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box', fontFamily: "'Inter', sans-serif"
    }}>
       <header style={{ position: 'fixed', top: 0, left: 0, width: '100%', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/auth')}
            style={{ position: 'absolute', left: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#1B1C1A' }}>arrow_back</span>
          </button>
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPwdp7uHsqU1vRZWPz2cgSezTBACQTT0Gy8BQ6Q6if0vf2CFTpdQTkcjAkPwWtFVXNuaOR4GEc-EotjUx7KvjV3hkiHEJjhqKow1-rev1tmlseP7VhH8yxef2qcJOuWC8WV1ICHTO2FIflVEH_ikuYhzv8Wxe3tdX39ad5eCxaHovyjWNn_yD38hop_ZO3Y_rmmgFX889FXiT4gDoBYlWLlInRq3EPb1EHZuCSd3gGGmU1Qo2eedVhDVZ1NWVuSvsW8mMn0x3gAPg" style={{ height: '60px' }} />
       </header>

       <main style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '20px', padding: '40px', boxSizing: 'border-box', boxShadow: '0 8px 30px rgba(0,0,0,0.05)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', color: '#0f5551', margin: '0 0 8px 0', fontFamily: "'EB Garamond', serif" }}>Bienvenido</h1>
            <p style={{ color: '#3f4947', fontSize: '14px', margin: 0 }}>Inicie sesión con las credenciales de prueba</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@caminos.com" style={inputStyle} />
             </div>

             <div>
                <label style={labelStyle}>Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" style={inputStyle} />
             </div>

             <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px', backgroundColor: '#2f6d69', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', marginTop: '10px' }}>
                {loading ? 'Ingresando...' : 'Ingresar'}
             </button>
          </form>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f3f0', borderRadius: '10px', fontSize: '12px', color: '#6f7978' }}>
             <strong>Credenciales demo:</strong><br/>
             Admin: admin@caminos.com / admin123<br/>
             Propietario: residente@caminos.com / residente123<br/>
             Vigilante: vigilante@caminos.com / vigilante123
          </div>
       </main>

       <footer style={{ marginTop: '40px', opacity: 0.5, fontSize: '12px', letterSpacing: '2px', color: '#6f7978', textAlign: 'center' }}>
          SEGURIDAD • COMUNIDAD • EXCLUSIVIDAD
       </footer>
    </div>
  )
}

const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 700, color: '#3d503e', marginBottom: '8px', textTransform: 'uppercase' as const }
const inputStyle = { width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid #bfc8c7', fontSize: '16px', boxSizing: 'border-box' as const, outline: 'none' }
