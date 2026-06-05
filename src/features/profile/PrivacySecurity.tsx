import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

export const PrivacySecurity: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  // Resident State
  const [profileVisible, setProfileVisible] = useState(true)
  const [contactVisible, setContactVisible] = useState(false)
  const [platesVisible, setPlatesVisible] = useState(false)
  const [biometrics, setBiometrics] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)

  // Admin State
  const [directoryDefault, setProfileDefault] = useState(false)
  const [restrictExport, setRestrictExport] = useState(true)
  const [mfaMandatory, setMfaMandatory] = useState(true)

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
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '18px', marginLeft: '15px', color: '#0f5551', fontWeight: 700, textTransform: 'uppercase' }}>Privacidad y Seguridad</h1>
      </header>

      <main style={{ paddingTop: '84px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '500px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {isAdmin ? (
          /* ADMIN VIEW */
          <>
            <p style={introTextStyle}>Gestión de seguridad global y cumplimiento normativo del condominio.</p>

            <Section title="Control de Staff">
              <MenuItem icon="badge" label="Gestión de Roles" desc="Permisos de vigilantes y personal" />
              <MenuItem icon="history_edu" label="Registro de Actividad" desc="Historial de cambios (Audit Log)" />
            </Section>

            <Section title="Políticas de Comunidad">
              <ToggleItem
                icon="visibility"
                label="Directorio Público"
                desc="Nuevos residentes visibles por defecto"
                active={directoryDefault}
                onToggle={() => setProfileDefault(!directoryDefault)}
              />
              <ToggleItem
                icon="file_download_off"
                label="Restringir Exportación"
                desc="Bloquear descarga masiva de datos"
                active={restrictExport}
                onToggle={() => setRestrictExport(!restrictExport)}
              />
            </Section>

            <Section title="Sistema y Respaldos">
              <ToggleItem
                icon="enhanced_encryption"
                label="MFA Obligatorio"
                desc="Exigir 2FA a todo el staff"
                active={mfaMandatory}
                onToggle={() => setMfaMandatory(!mfaMandatory)}
              />
              <MenuItem icon="cloud_sync" label="Copias de Seguridad" desc="Último respaldo: Hace 2 horas" />
            </Section>

            <Section title="Legal">
              <MenuItem icon="gavel" label="Consentimiento Digital" desc="Gestionar avisos de privacidad" />
            </Section>
          </>
        ) : (
          /* RESIDENT VIEW */
          <>
            <p style={introTextStyle}>Controla qué información compartes y cómo proteges tu cuenta.</p>

            <Section title="Privacidad (¿Qué ven mis vecinos?)">
              <ToggleItem
                icon="person_search"
                label="Visibilidad del Perfil"
                desc="Aparecer en el directorio de vecinos"
                active={profileVisible}
                onToggle={() => setProfileVisible(!profileVisible)}
              />
              <ToggleItem
                icon="contact_phone"
                label="Ocultar Contacto"
                desc="Teléfono y correo privados"
                active={contactVisible}
                onToggle={() => setContactVisible(!contactVisible)}
              />
              <ToggleItem
                icon="directions_car"
                label="Privacidad de Vehículos"
                desc="Ocultar mis placas en el sistema"
                active={platesVisible}
                onToggle={() => setPlatesVisible(!platesVisible)}
              />
            </Section>

            <Section title="Seguridad de la Cuenta">
              <MenuItem onClick={() => navigate('/profile/account')} icon="password" label="Cambiar Contraseña" desc="Actualizada hace 3 meses" />
              <ToggleItem
                icon="fingerprint"
                label="Biometría"
                desc="Acceder con FaceID / Huella"
                active={biometrics}
                onToggle={() => setBiometrics(!biometrics)}
              />
              <ToggleItem
                icon="verified_user"
                label="Verificación en 2 pasos"
                desc="Código vía SMS o Correo"
                active={twoFactor}
                onToggle={() => setTwoFactor(!twoFactor)}
              />
              <MenuItem icon="devices" label="Dispositivos Activos" desc="2 sesiones abiertas" />
            </Section>

            <Section title="Gestión de Datos">
              <MenuItem icon="settings_remote" label="Permisos de la App" desc="Cámara, Notificaciones, GPS" />
              <MenuItem icon="auto_delete" label="Auto-borrado de Visitas" desc="Limpiar historial cada 30 días" />
            </Section>

            <Section title="Legal">
              <MenuItem onClick={() => navigate('/profile/legal?type=privacy')} icon="description" label="Política de Privacidad" />
              <MenuItem onClick={() => navigate('/profile/legal?type=terms')} icon="assignment" label="Términos y Condiciones" />
              <button style={{ ...menuItemStyle, border: 'none', color: '#ba1a1a', marginTop: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ ...iconBoxStyle, backgroundColor: '#ffdad6' }}>
                    <span className="material-symbols-outlined">delete_forever</span>
                  </div>
                  <span style={{ fontWeight: 700 }}>Eliminar mi cuenta</span>
                </div>
              </button>
            </Section>
          </>
        )}
      </main>
    </div>
  )
}

const Section = ({ title, children }: any) => (
  <div style={{ marginBottom: '30px' }}>
    <h3 style={{ fontSize: '12px', fontWeight: 800, color: '#785919', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '15px', marginLeft: '5px' }}>{title}</h3>
    <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
      {children}
    </div>
  </div>
)

const MenuItem = ({ icon, label, desc, onClick }: any) => (
  <div onClick={onClick} style={menuItemStyle}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <div style={iconBoxStyle}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#1B1C1A', display: 'block' }}>{label}</span>
        {desc && <span style={{ fontSize: '12px', color: '#6f7978' }}>{desc}</span>}
      </div>
    </div>
    <span className="material-symbols-outlined" style={{ color: '#bfc8c7' }}>chevron_right</span>
  </div>
)

const ToggleItem = ({ icon, label, desc, active, onToggle }: any) => (
  <div style={menuItemStyle}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <div style={iconBoxStyle}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#1B1C1A', display: 'block' }}>{label}</span>
        <span style={{ fontSize: '12px', color: '#6f7978' }}>{desc}</span>
      </div>
    </div>
    <div
      onClick={onToggle}
      style={{
        width: '44px', height: '24px', backgroundColor: active ? '#2f6d69' : '#bfc8c7',
        borderRadius: '12px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease'
      }}
    >
      <div style={{
        width: '18px', height: '18px', backgroundColor: 'white', borderRadius: '50%',
        position: 'absolute', top: '3px', left: active ? '23px' : '3px',
        transition: 'left 0.3s ease'
      }} />
    </div>
  </div>
)

const introTextStyle = { color: '#3f4947', fontSize: '14px', marginBottom: '30px', textAlign: 'center' as const, lineHeight: '1.5' }
const menuItemStyle = { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #efeeeb', cursor: 'pointer' }
const iconBoxStyle = { width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f5f3f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f5551' }
