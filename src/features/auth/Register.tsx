import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

const VALID_CODES = ['LAGUNITA-ETAPA1-2026', 'LAGUNITA-ETAPA2-2026', 'LAGUNITA-PRO-2024']

const conjuntosPorEtapa: Record<string, string[]> = {
  "I": ["La Pradera", "Los Jarales", "El Roble"],
  "II": ["Punta de Piedra", "Las Isletas", "Punta Mangle"],
  "III": ["Altos del Mirador", "Lomas del Sol"],
  "IV": ["Residencias Lagunita", "The Collection"]
}

export const Register: React.FC = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Code Validation, 2: Form, 3: Pending
  const [accessCode, setAccessCode] = useState('')
  const [formData, setFormData] = useState({
    nombre: '', apellido: '', email: '', phone: '', password: '', confirmPassword: '', etapa: '', conjunto: '', houseNumber: ''
  })
  const [loading, setLoading] = useState(false)

  const handleValidateCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (VALID_CODES.includes(accessCode.toUpperCase())) {
      setStep(2)
    } else {
      alert("Código de Acceso inválido. Por favor, solicítelo a su junta de condominio.")
    }
  }

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) return alert("Las contraseñas no coinciden")
    setLoading(true)

    // Simular registro y validación de duplicados
    setTimeout(() => {
      // Simulación de validación de casa duplicada
      if (formData.houseNumber === "11-45" && formData.conjunto === "Punta de Piedra") {
        alert("ALERTA: Ya existe un residente registrado en esta ubicación. Se ha notificado al administrador para verificar su identidad.")
        setLoading(false)
        return
      }

      setStep(3) // Ir a pantalla de espera/aprobación
      setLoading(false)
    }, 1500)
  }

  if (step === 1) {
    return (
      <div style={containerStyle}>
        <header style={headerStyle}>
          <button onClick={() => navigate('/auth')} style={backBtnStyle}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 style={titleStyle}>Seguridad de Acceso</h1>
        </header>
        <main style={mainStyle}>
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#785919', marginBottom: '15px' }}>vsafe</span>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f5551', margin: '0 0 10px 0' }}>Validación de Conjunto</h2>
              <p style={{ fontSize: '14px', color: '#3f4947' }}>Para registrarse, ingrese el código único proporcionado por su junta de condominio.</p>
            </div>
            <form onSubmit={handleValidateCode} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Field label="Código de Invitación" value={accessCode} onChange={(e:any) => setAccessCode(e.target.value)} placeholder="Ej: LAGUNITA-XXXX-XXXX" />
              <button type="submit" style={primaryBtnStyle}>Validar Código</button>
            </form>
          </div>
        </main>
      </div>
    )
  }

  if (step === 3) {
    return (
      <div style={containerStyle}>
        <main style={mainStyle}>
          <div style={{ ...cardStyle, textAlign: 'center', padding: '40px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#2f6d69', marginBottom: '20px' }}>hourglass_empty</span>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f5551', marginBottom: '15px' }}>Registro en Proceso</h2>
            <p style={{ fontSize: '15px', color: '#3f4947', lineHeight: '1.6', marginBottom: '30px' }}>
              Tu solicitud ha sido enviada con éxito. El administrador de la <strong>{formData.etapa} Etapa</strong> validará tus datos en las próximas 24 horas para activar tu acceso.
            </p>
            <button onClick={() => navigate('/')} style={primaryBtnStyle}>Volver al Inicio</button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <button onClick={() => setStep(1)} style={backBtnStyle}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 style={titleStyle}>Datos del Residente</h1>
      </header>

      <main style={mainStyle}>
        <div style={cardStyle}>
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
               <Field label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Juan" />
               <Field label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Ej: Pérez" />
            </div>

            <Field label="Correo electrónico" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="ejemplo@correo.com" />

            <div style={{ display: 'flex', border: '1px solid #bfc8c7', borderRadius: '8px', overflow: 'hidden' }}>
               <div style={{ padding: '12px 15px', backgroundColor: '#f5f3f0', borderRight: '1px solid #bfc8c7', color: '#3f4947', fontSize: '14px', fontWeight: 600 }}>+58</div>
               <input name="phone" value={formData.phone} onChange={handleChange} placeholder="412 1234567" style={{ ...inputStyle, border: 'none', flex: 1 }} />
            </div>

            <Field label="Contraseña" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Min. 8 caracteres" />
            <Field label="Confirmar contraseña" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} placeholder="Repita contraseña" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Etapa Residencial</label>
                <select name="etapa" value={formData.etapa} onChange={handleChange} style={inputStyle} required>
                  <option value="">Seleccione</option>
                  {Object.keys(conjuntosPorEtapa).map(e => <option key={e} value={e}>{e} Etapa</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Conjunto</label>
                <select name="conjunto" value={formData.conjunto} onChange={handleChange} style={inputStyle} required disabled={!formData.etapa}>
                  <option value="">Seleccione</option>
                  {formData.etapa && conjuntosPorEtapa[formData.etapa].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <Field label="Número de casa" name="houseNumber" value={formData.houseNumber} onChange={handleChange} placeholder="Ej: 11-45" />

            <button type="submit" disabled={loading} style={primaryBtnStyle}>
              {loading ? 'Procesando...' : 'Completar Registro'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

const Field = ({ label, ...props }: any) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <input {...props} style={inputStyle} required />
  </div>
)

const containerStyle = { minHeight: '100vh', backgroundColor: '#FAF8F5', fontFamily: "'Inter', sans-serif", color: '#1B1C1A', display: 'flex', flexDirection: 'column' }
const headerStyle = { position: 'fixed' as const, top: 0, width: '100%', height: '64px', backgroundColor: '#FAF8F5', borderBottom: '1px solid #bfc8c7', display: 'flex', alignItems: 'center', padding: '0 20px', zIndex: 100, boxSizing: 'border-box' as const }
const backBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }
const titleStyle = { fontFamily: "'Cinzel', serif", fontSize: '18px', marginLeft: '15px', color: '#0f5551', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em' }
const mainStyle = { padding: '100px 20px 40px', flex: 1 }
const cardStyle = { maxWidth: '450px', margin: '0 auto', backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }
const labelStyle = { display: 'block', fontSize: '14px', fontWeight: 500, color: '#1B1C1A', marginBottom: '8px' }
const inputStyle = { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #bfc8c7', fontSize: '15px', boxSizing: 'border-box' as const, outline: 'none' }
const primaryBtnStyle = { width: '100%', padding: '16px', backgroundColor: '#2f6d69', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', fontSize: '16px' }
