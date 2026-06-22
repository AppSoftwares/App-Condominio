import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

export const Privacy: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

  // Resident State
  const [profileVisible, setProfileVisible] = useState(true)
  const [contactVisible, setContactVisible] = useState(false)
  const [platesVisible, setPlatesVisible] = useState(false)
  const [biometrics, setBiometrics] = useState(false)
  const [twoFactor, setTwoFactor] = useState(false)

  // Permissions State
  const [permissions, setPermissions] = useState({ camera: true, notifications: true, gps: true })
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)

  // Auto-delete State
  const [autoDeleteDays, setAutoDeleteDays] = useState(30)
  const [showAutoDeleteModal, setShowAutoDeleteModal] = useState(false)

  // Devices State
  const [showDevicesModal, setShowDevicesModal] = useState(false)
  const [devices, setDevices] = useState([
    { id: 1, name: 'iPhone 15 Pro (Este dispositivo)', location: 'Caracas, VZ', date: 'Activo ahora', current: true },
    { id: 2, name: 'Samsung Galaxy S23', location: 'Miranda, VZ', date: 'Hace 2 días', current: false },
    { id: 3, name: 'MacBook Air 13"', location: 'Caracas, VZ', date: 'Hace 5 horas', current: false }
  ])

  // Admin State
  const [directoryDefault, setProfileDefault] = useState(false)
  const [restrictExport, setRestrictExport] = useState(true)
  const [mfaMandatory, setMfaMandatory] = useState(true)

  // API Key State
  const [apiKeys, setApiKeys] = useState<{id: number, name: string, date: string}[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [currentKey, setCurrentKey] = useState<string | null>(null)

  const handleGenerateKey = () => {
    if (!newKeyName) return alert('Ingresa un nombre para la llave')
    const fakeKey = 'condo_' + Math.random().toString(36).substring(2, 15)
    setCurrentKey(fakeKey)
    setApiKeys([{ id: Date.now(), name: newKeyName, date: new Date().toLocaleDateString() }, ...apiKeys])
    setNewKeyName('')
    setShowKeyModal(true)
  }

  const handleDisconnect = (id: number) => {
    setDevices(devices.filter(d => d.id !== id))
  }

  return (
    <div style={{ width: '100%', backgroundColor: '#FAF8F5', fontFamily: "'Inter', sans-serif", color: '#1B1C1A', paddingBottom: '30px' }}>
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

            <Section title="Integraciones y API Keys">
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '12px', color: '#6f7978', marginBottom: '15px' }}>Genera llaves para conectar el condominio con n8n o servicios externos.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    placeholder="Nombre (ej. n8n Reportes)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    style={inputStyle}
                  />
                  <button
                    onClick={handleGenerateKey}
                    style={{ ...primaryBtnStyleSmall, height: '48px', padding: '0 15px' }}
                  >
                    Crear
                  </button>
                </div>
              </div>

              {apiKeys.length > 0 && (
                <div style={{ borderTop: '1px solid #efeeeb' }}>
                  {apiKeys.map(key => (
                    <div key={key.id} style={{ ...menuItemStyle, cursor: 'default' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={iconBoxStyle}><span className="material-symbols-outlined">key</span></div>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '14px' }}>{key.name}</span>
                          <span style={{ fontSize: '11px', color: '#6f7978', display: 'block' }}>Creada: {key.date}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setApiKeys(apiKeys.filter(k => k.id !== key.id))}
                        style={{ background: 'none', border: 'none', color: '#ba1a1a', cursor: 'pointer' }}
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
              <MenuItem onClick={() => setShowDevicesModal(true)} icon="devices" label="Dispositivos Activos" desc={`${devices.length} sesiones abiertas`} />
            </Section>

            <Section title="Gestión de Datos">
              <MenuItem onClick={() => setShowPermissionsModal(true)} icon="settings_remote" label="Permisos de la App" desc="Cámara, Notificaciones, GPS" />
              <MenuItem onClick={() => setShowAutoDeleteModal(true)} icon="auto_delete" label="Auto-borrado de Visitas" desc={autoDeleteDays === 0 ? "No eliminar nunca" : `Limpiar historial cada ${autoDeleteDays} días`} />
            </Section>

            <Section title="Legal">
              <MenuItem onClick={() => navigate('/profile/legal?type=privacy')} icon="description" label="Política de Privacidad" />
              <MenuItem onClick={() => navigate('/profile/legal?type=terms')} icon="assignment" label="Términos y Condiciones" />
              <button style={{ ...menuItemStyle, border: 'none', color: '#ba1a1a', marginTop: '10px', width: '100%', backgroundColor: 'transparent' }}>
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

      {/* MODAL: DISPOSITIVOS ACTIVOS */}
      {showDevicesModal && (
        <Modal title="Dispositivos Activos" onClose={() => setShowDevicesModal(false)}>
          <p style={{ fontSize: '13px', color: '#6f7978', marginBottom: '20px' }}>Estas son las sesiones activas en tu cuenta. Puedes cerrar sesiones remotas si no las reconoces.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {devices.map(dev => (
              <div key={dev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f5f3f0', borderRadius: '16px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span className="material-symbols-outlined" style={{ color: '#0f5551' }}>{dev.name.includes('iPhone') ? 'smartphone' : 'laptop'}</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>{dev.name}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#6f7978' }}>{dev.location} • {dev.date}</p>
                  </div>
                </div>
                {!dev.current && (
                  <button onClick={() => handleDisconnect(dev.id)} style={{ border: '1px solid #ba1a1a', color: '#ba1a1a', background: 'none', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Desconectar</button>
                )}
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* MODAL: PERMISOS APP */}
      {showPermissionsModal && (
        <Modal title="Permisos de la App" onClose={() => setShowPermissionsModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <ToggleItem
              icon="photo_camera" label="Cámara" desc="Para escanear pases QR"
              active={permissions.camera} onToggle={() => setPermissions({...permissions, camera: !permissions.camera})}
            />
            <ToggleItem
              icon="notifications" label="Notificaciones" desc="Avisos de llegada y pagos"
              active={permissions.notifications} onToggle={() => setPermissions({...permissions, notifications: !permissions.notifications})}
            />
            <ToggleItem
              icon="location_on" label="GPS / Ubicación" desc="Validar entrada en garita"
              active={permissions.gps} onToggle={() => setPermissions({...permissions, gps: !permissions.gps})}
            />
          </div>
        </Modal>
      )}

      {/* MODAL: AUTO-BORRADO */}
      {showAutoDeleteModal && (
        <Modal title="Auto-borrado de Visitas" onClose={() => setShowAutoDeleteModal(false)}>
          <p style={{ fontSize: '13px', color: '#6f7978', marginBottom: '20px' }}>Selecciona cada cuánto tiempo deseas que se limpie tu historial de invitados automáticamente.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[7, 15, 30, 0].map(days => (
              <div
                key={days}
                onClick={() => setAutoDeleteDays(days)}
                style={{
                  display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderRadius: '12px',
                  border: `2px solid ${autoDeleteDays === days ? '#0f5551' : '#efeeeb'}`,
                  backgroundColor: autoDeleteDays === days ? 'rgba(15,85,81,0.05)' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontWeight: 700 }}>{days === 0 ? "No quitar" : `Cada ${days} días`}</span>
                {autoDeleteDays === days && <span className="material-symbols-outlined" style={{ color: '#0f5551' }}>check_circle</span>}
              </div>
            ))}
          </div>
          <button onClick={() => setShowAutoDeleteModal(false)} style={{ ...primaryBtnStyleSmall, width: '100%', marginTop: '30px', padding: '15px', justifyContent: 'center' }}>Confirmar Plan</button>
        </Modal>
      )}

      {/* MODAL: API KEY (RE-RENDERED IF ADMIN) */}
      {showKeyModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '28px', padding: '30px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '30px', backgroundColor: 'rgba(198, 160, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--accent-gold)', fontSize: '32px' }}>key</span>
            </div>
            <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '20px', color: '#0f5551', marginBottom: '10px' }}>Llave Generada</h3>
            <p style={{ fontSize: '13px', color: '#6f7978', marginBottom: '20px' }}>Copia esta llave ahora. Por seguridad, no podrás volver a verla.</p>
            <div style={{ backgroundColor: '#f5f3f0', padding: '15px', borderRadius: '12px', border: '1px dashed #bfc8c7', marginBottom: '25px' }}>
              <code style={{ fontSize: '14px', wordBreak: 'break-all', fontWeight: 700, color: '#1b1c1a' }}>{currentKey}</code>
            </div>
            <button onClick={() => { navigator.clipboard.writeText(currentKey || ''); alert('Copiado'); }} style={{ ...primaryBtnStyleSmall, width: '100%', marginBottom: '10px', justifyContent: 'center' }}>Copiar Clave</button>
            <button onClick={() => setShowKeyModal(false)} style={{ width: '100%', padding: '12px', background: 'none', border: 'none', color: '#ba1a1a', fontWeight: 700, cursor: 'pointer' }}>Cerrar</button>
          </div>
        </div>
      )}

    </div>
  )
}

const Modal = ({ title, children, onClose }: any) => (
  <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 2000 }}>
    <div style={{
      backgroundColor: 'white',
      borderBottomLeftRadius: '32px',
      borderBottomRightRadius: '32px',
      padding: '30px',
      width: '100%',
      maxWidth: '500px',
      maxHeight: '90vh',
      overflowY: 'auto',
      animation: 'slideDown 0.3s ease-out',
      boxSizing: 'border-box',
      boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', position: 'sticky', top: 0, backgroundColor: 'white', paddingBottom: '15px', zIndex: 10, borderBottom: '1px solid #efeeeb' }}>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '20px', color: '#0f5551', margin: 0 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}><span className="material-symbols-outlined">close</span></button>
      </div>
      <div style={{ paddingBottom: '20px' }}>
        {children}
      </div>
      <style>{`
        @keyframes slideDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }
      `}</style>
    </div>
  </div>
)

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
      <div style={{ textAlign: 'left' }}>
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
      <div style={{ textAlign: 'left' }}>
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
const inputStyle = { flex: 1, padding: '12px 15px', borderRadius: '12px', border: '1px solid #bfc8c7', backgroundColor: '#f5f3f0', fontSize: '14px', outline: 'none' }
const primaryBtnStyleSmall = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: '#0f5551', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }
