import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const { whitelist } = useAuthStore()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [cluster, setCluster] = useState('Punta de Piedra')
  const [house, setHouse] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Validación contra la lista importada del Excel
      const cleanEmail = email.trim().toLowerCase();
      const whitelistedUser = whitelist.find(u => u.email.toLowerCase().trim() === cleanEmail);

      if (!whitelistedUser) {
        alert('Este correo no está registrado en el sistema oficial de la urbanización. Por favor, contacte a la administración.')
        setLoading(false)
        return
      }

      // 2. Registro Real en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // 3. Crear Perfil con estado 'pendiente'
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: cleanEmail,
              first_name: firstName,
              last_name: lastName,
              role: 'resident',
              residential_cluster: cluster,
              house_number: house,
              status: 'pending' // El admin deberá aprobarlo
            }
          ])

        if (profileError) throw profileError

        alert(`¡Registro exitoso! Bienvenido ${firstName}. Su solicitud ha sido enviada y el administrador validará su acceso pronto.`)
        navigate('/login')
      }
    } catch (err: any) {
      alert('Error al registrar residente: ' + (err.message || 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '8px', letterSpacing: '0.5px' }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '16px', boxSizing: 'border-box', outline: 'none', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)' }
  const containerStyle: React.CSSProperties = { height: '100%', width: '100%', overflowX: 'hidden', backgroundColor: 'var(--bg-color)', fontFamily: "'Inter', sans-serif", color: 'var(--text-color)', display: 'flex', flexDirection: 'column' }

  if (step === 1) {
    return (
      <div style={containerStyle}>
        <header style={{ ...headerStyle, position: 'relative', justifyContent: 'center' }}>
          <button
            onClick={() => navigate('/auth')}
            style={{ ...backBtnStyle, position: 'absolute', left: '20px', display: 'flex', alignItems: 'center' }}
          >
            <ArrowLeft size={24} color="#0f5551" />
          </button>
          <h1 style={{ ...titleStyle, margin: 0 }}>Crear Cuenta</h1>
        </header>

        <main style={mainContentStyle}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={stepIndicatorStyle}><span style={{ color: 'white', fontWeight: 700 }}>1</span></div>
            <h2 style={{ fontSize: '24px', fontFamily: "'EB Garamond', serif", color: '#0f5551', margin: '15px 0 5px' }}>Datos de Acceso</h2>
            <p style={{ fontSize: '14px', color: '#6f7978' }}>Configure su correo y contraseña</p>
          </div>

          <div style={cardStyle}>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Correo Electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ejemplo@email.com"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: '30px' }}>
              <label style={labelStyle}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoCapitalize="none"
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
            <button onClick={() => setStep(2)} style={primaryBtnStyle}>Siguiente</button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <header style={{ ...headerStyle, position: 'relative', justifyContent: 'center' }}>
        <button
          onClick={() => setStep(1)}
          style={{ ...backBtnStyle, position: 'absolute', left: '20px', display: 'flex', alignItems: 'center' }}
        >
          <ArrowLeft size={24} color="#0f5551" />
        </button>
        <h1 style={{ ...titleStyle, margin: 0 }}>Datos Residenciales</h1>
      </header>

      <main style={mainContentStyle}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={stepIndicatorStyle}><span style={{ color: 'white', fontWeight: 700 }}>2</span></div>
          <h2 style={{ fontSize: '24px', fontFamily: "'EB Garamond', serif", color: '#0f5551', margin: '15px 0 5px' }}>Ubicación</h2>
          <p style={{ fontSize: '14px', color: '#6f7978' }}>Confirme su casa en el conjunto</p>
        </div>

        <form onSubmit={handleRegister} style={cardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Juan"
                autoCorrect="off"
                spellCheck="false"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Apellido</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Pérez"
                autoCorrect="off"
                spellCheck="false"
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Conjunto / Etapa</label>
            <select value={cluster} onChange={e => setCluster(e.target.value)} style={inputStyle}>
              <option>Punta de Piedra</option>
              <option>Las Huertas</option>
              <option>El Manantial</option>
            </select>
          </div>
          <div style={{ marginBottom: '30px' }}>
            <label style={labelStyle}>Número de Casa</label>
            <input
              type="text"
              value={house}
              onChange={e => setHouse(e.target.value)}
              placeholder="Ej: 14-02"
              autoCorrect="off"
              spellCheck="false"
              style={inputStyle}
            />
          </div>
          <button type="submit" disabled={loading} style={primaryBtnStyle}>
            {loading ? 'Validando...' : 'Enviar Solicitud'}
          </button>
        </form>
      </main>
    </div>
  )
}

const headerStyle: React.CSSProperties = { height: '64px', backgroundColor: 'white', borderBottom: '1px solid #bfc8c7', display: 'flex', alignItems: 'center', padding: '0 20px' }
const backBtnStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }
const titleStyle: React.CSSProperties = { fontFamily: "'EB Garamond', serif", fontSize: '20px', color: '#0f5551', fontWeight: 700, margin: '0 0 0 15px' }
const mainContentStyle: React.CSSProperties = { padding: '40px 20px', maxWidth: '500px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }
const cardStyle: React.CSSProperties = { backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '24px', padding: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }
const primaryBtnStyle: React.CSSProperties = { width: '100%', padding: '16px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '16px', cursor: 'pointer' }
const stepIndicatorStyle: React.CSSProperties = { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }
