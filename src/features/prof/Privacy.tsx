import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'
import { supabase } from '../../lib/supabase'
import api from '../../lib/api'
import { Device } from '@capacitor/device'
import {
  isBiometricEnabled,
  isBiometricAvailable,
  enableBiometric,
  disableBiometric
} from '../../lib/biometrics'
import { TwoFactorSetup } from './TwoFactorSetup'

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
  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false)

  // Devices State
  const [showDevicesModal, setShowDevicesModal] = useState(false)
  const [devices, setDevices] = useState<any[]>([])
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('')
  const [loadingDevices, setLoadingDevices] = useState(false)

  // Admin State
  const [directoryDefault, setProfileDefault] = useState(false)
  const [restrictExport, setRestrictExport] = useState(true)
  const [mfaMandatory, setMfaMandatory] = useState(true)

  // API Key State
  const [apiKeys, setApiKeys] = useState<{id: string, name: string, date: string}[]>([])
  const [newKeyName, setNewKeyName] = useState('')
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [currentKey, setCurrentKey] = useState<string | null>(null)

  useEffect(() => {
    // Cargar preferencias reales
    isBiometricEnabled().then(setBiometrics)

    // Verificar MFA
    supabase.auth.mfa.listFactors().then(({ data }) => {
      const verified = data?.all?.some(f => f.status === 'verified')
      setTwoFactor(!!verified)
    })

    // ID del dispositivo actual
    Device.getId().then(id => setCurrentDeviceId(id.identifier))

    if (isAdmin) {
      fetchApiKeys()
    }
  }, [isAdmin])

  const fetchApiKeys = async () => {
    try {
      // Usamos el endpoint real del backend FastAPI
      const res = await api.get('/api/v1/admin/security/keys')
      setApiKeys(res.data.map((k: any) => ({
        id: k.id,
        name: k.nombre_cliente,
        date: new Date(k.fecha_creacion).toLocaleDateString()
      })))
    } catch (err) {
      console.error('Error cargando llaves:', err)
    }
  }

  const fetchSessions = async () => {
    setLoadingDevices(true)
    try {
      const { data, error } = await supabase.rpc('get_my_sessions')
      if (error) throw error
      setDevices(data || [])
    } catch (err) {
      console.error("Error cargando sesiones:", err)
    } finally {
      setLoadingDevices(false)
    }
  }

  const handleGenerateKey = async () => {
    if (!newKeyName) return alert('Ingresa un nombre para la llave')
    try {
      const res = await api.post('/api/v1/admin/security/keys', {
        nombre_cliente: newKeyName,
        permisos: ["read", "write"]
      })
      setCurrentKey(res.data.api_key_viva)
      setNewKeyName('')
      setShowKeyModal(true)
      fetchApiKeys()
    } catch (err: any) {
      alert('No se pudo generar la llave: ' + (err.response?.data?.detail || 'Error desconocido'))
    }
  }

  const handleRevokeKey = async (id: string) => {
    if (!confirm('¿Seguro que deseas revocar esta llave?')) return
    try {
      await api.delete(`/api/v1/admin/security/keys/${id}`)
      setApiKeys(apiKeys.filter(k => k.id !== id))
    } catch (err) {
      alert('No se pudo revocar la llave')
    }
  }

  const handleToggleBiometric = async () => {
    if (biometrics) {
      await disableBiometric()
      setBiometrics(false)
      return
    }
    const available = await isBiometricAvailable()
    if (!available) return alert('Este dispositivo no tiene biometría configurada')
    const ok = await enableBiometric()
    if (ok) setBiometrics(true)
  }

  const handleDisableTwoFactor = async () => {
    const { data } = await supabase.auth.mfa.listFactors()
    const factor = data?.all?.find(f => f.status === 'verified')
    if (!factor) return
    if (!confirm('¿Seguro que deseas desactivar la verificación en 2 pasos?')) return

    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id })
    if (error) alert("Error: " + error.message)
    else {
      setTwoFactor(false)
      alert("2FA desactivado")
    }
  }

  const handleDisconnectSession = async (id: string) => {
    if (!confirm('¿Cerrar sesión en este dispositivo remotamente?')) return
    const { error } = await supabase.rpc('revoke_session', { p_session_id: id })
    if (error) alert("Error: " + error.message)
    else fetchSessions()
  }

  return (
    <div style={{ width: '100%', backgroundColor: 'var(--bg-color)', fontFamily: "'Inter', sans-serif", color: 'var(--text-color)', paddingBottom: '30px' }}>
      <header style={{
        position: 'fixed', top: 0, width: '100%', height: '64px', backgroundColor: 'var(--header-bg)',
        borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 20px',
        zIndex: 100, boxSizing: 'border-box'
      }}>
        <button
          onClick={() => navigate('/profile')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: 'var(--text-color)' }}>arrow_back</span>
        </button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '18px', marginLeft: '15px', color: 'var(--primary-color)', fontWeight: 700, textTransform: 'uppercase' }}>Privacidad y Seguridad</h1>
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

            <Section title="Integraciones y API Keys">
              <div style={{ padding: '20px' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-sub)', marginBottom: '15px' }}>Genera llaves para conectar el condominio con n8n o servicios externos.</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    placeholder="Nombre (ej. n8n Reportes)"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    style={{ ...inputStyle, backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)' }}
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
                <div style={{ borderTop: '1px solid var(--border-color)' }}>
                  {apiKeys.map(key => (
                    <div key={key.id} style={{ ...menuItemStyle, cursor: 'default' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={iconBoxStyle}><span className="material-symbols-outlined">key</span></div>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '14px' }}>{key.name}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-sub)', display: 'block' }}>Creada: {key.date}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        style={{ background: 'none', border: 'none', color: '#ba1a1a', cursor: 'pointer' }}
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </>
        ) : (
          /* RESIDENT VIEW */
          <>
            <p style={introTextStyle}>Controla qué información compartes y cómo proteges tu cuenta.</p>

            <Section title="Seguridad de la Cuenta">
              <MenuItem onClick={() => navigate('/profile/account')} icon="password" label="Cambiar Contraseña" desc="Mantén tu cuenta segura" />
              <ToggleItem
                icon="fingerprint"
                label="Biometría"
                desc="Acceder con FaceID / Huella"
                active={biometrics}
                onToggle={handleToggleBiometric}
              />
              <MenuItem
                onClick={() => twoFactor ? handleDisableTwoFactor() : setShowTwoFactorModal(true)}
                icon="verified_user"
                label="Verificación en 2 pasos"
                desc={twoFactor ? "Activada (Máxima seguridad)" : "Toca para activar con Authenticator"}
              />
              <MenuItem onClick={() => { setShowDevicesModal(true); fetchSessions(); }} icon="devices" label="Dispositivos Activos" desc="Gestiona tus sesiones abiertas" />
            </Section>

            <Section title="Legal">
              <MenuItem onClick={() => navigate('/profile/legal?type=privacy')} icon="description" label="Política de Privacidad" />
              <MenuItem onClick={() => navigate('/profile/legal?type=terms')} icon="assignment" label="Términos y Condiciones" />
            </Section>
          </>
        )}
      </main>

      {/* MODAL: DISPOSITIVOS ACTIVOS */}
      {showDevicesModal && (
        <Modal title="Dispositivos Activos" onClose={() => setShowDevicesModal(false)}>
          <p style={{ fontSize: '13px', color: '#6f7978', marginBottom: '20px' }}>Estas son las sesiones activas en tu cuenta. Puedes cerrar sesiones remotas si no las reconoces.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {loadingDevices ? <p style={{textAlign:'center'}}>Cargando sesiones...</p> : devices.length === 0 ? <p style={{textAlign:'center'}}>No hay otras sesiones.</p> : devices.map(dev => {
              const isCurrent = dev.device_id === currentDeviceId;
              return (
                <div key={dev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', backgroundColor: '#f5f3f0', borderRadius: '16px' }}>
                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span className="material-symbols-outlined" style={{ color: '#0f5551' }}>{dev.platform === 'web' ? 'laptop' : 'smartphone'}</span>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '14px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dev.device_name} {isCurrent && '(Este equipo)'}
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6f7978' }}>Visto: {new Date(dev.last_seen).toLocaleString()}</p>
                    </div>
                  </div>
                  {!isCurrent && (
                    <button onClick={() => handleDisconnectSession(dev.id)} style={{ border: '1px solid #ba1a1a', color: '#ba1a1a', background: 'none', padding: '5px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Cerrar</button>
                  )}
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      {/* MODAL: ACTIVAR 2FA */}
      {showTwoFactorModal && (
        <Modal title="Verificación en 2 pasos" onClose={() => setShowTwoFactorModal(false)}>
            <TwoFactorSetup
                onClose={() => setShowTwoFactorModal(false)}
                onEnabled={() => setTwoFactor(true)}
            />
        </Modal>
      )}

      {/* MODAL: LLAVE GENERADA */}
      {showKeyModal && currentKey && (
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
      backgroundColor: 'var(--card-bg)',
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', position: 'sticky', top: 0, backgroundColor: 'var(--card-bg)', paddingBottom: '15px', zIndex: 10, borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: '20px', color: 'var(--primary-color)', margin: 0 }}>{title}</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}><span className="material-symbols-outlined" style={{ color: 'var(--text-color)' }}>close</span></button>
      </div>
      <div style={{ paddingBottom: '20px', color: 'var(--text-color)' }}>
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
    <h3 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '15px', marginLeft: '5px' }}>{title}</h3>
    <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
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
        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-color)', display: 'block' }}>{label}</span>
        {desc && <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{desc}</span>}
      </div>
    </div>
    <span className="material-symbols-outlined" style={{ color: 'var(--border-color)' }}>chevron_right</span>
  </div>
)

const ToggleItem = ({ icon, label, desc, active, onToggle }: any) => (
  <div style={menuItemStyle}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <div style={iconBoxStyle}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div style={{ textAlign: 'left' }}>
        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-color)', display: 'block' }}>{label}</span>
        <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{desc}</span>
      </div>
    </div>
    <div
      onClick={onToggle}
      style={{
        width: '44px', height: '24px', backgroundColor: active ? 'var(--primary-color)' : 'var(--border-color)',
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

const introTextStyle = { color: 'var(--text-sub)', fontSize: '14px', marginBottom: '30px', textAlign: 'center' as const, lineHeight: '1.5' }
const menuItemStyle = { padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }
const iconBoxStyle = { width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--icon-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)' }
const inputStyle = { flex: 1, padding: '12px 15px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--icon-bg)', fontSize: '14px', outline: 'none' }
const primaryBtnStyleSmall = { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }
