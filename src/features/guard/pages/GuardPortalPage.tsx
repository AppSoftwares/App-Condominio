import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../../shared/lib/supabase'
import {
  MdCancel,
  MdCheckCircle,
  MdInventory,
  MdNotificationsActive,
  MdQrCodeScanner
} from 'react-icons/md'
import { Network } from '@capacitor/network'
import { enqueueAction } from '../../../shared/lib/offlineQueue'
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'
import { useAuthStore } from '../../../app/store/useAuthStore'
import { notificationService } from '../../../shared/api/services/notificationService'

export const GuardPortalPage: React.FC = () => {
  const { user } = useAuthStore()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'control'

  const [isScanning, setIsScanning] = useState(false)
  const [scanType, setScanType] = useState<'access' | 'package'>('access')
  const [scanResult, setScanResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Estados para Registro Manual
  const [manualVisitor, setManualVisitor] = useState('')
  const [houseSuffix, setHouseSuffix] = useState('')
  const clusterPrefix = user?.residential_cluster?.match(/\d+/)?.[0] || null

  // Estados para Alertas
  const [alertTitle, setAlertTitle] = useState('')
  const [alertDesc, setAlertDesc] = useState('')
  const [alertSeverity, setAlertSeverity] = useState('normal')

  // Estados para Casillero Virtual
  const [residentId, setResidentId] = useState('')
  const [courier, setCourier] = useState('')
  const [details, setDetails] = useState('')
  const [residents, setResidents] = useState<any[]>([])

  // Historial de Accesos
  const [accessLogs, setAccessLogs] = useState<any[]>([])

  // Novedades de Residentes
  const [incidents, setIncidents] = useState<any[]>([])

  useEffect(() => {
    if (activeTab === 'packages') {
      fetchResidents()
    }
    if (activeTab === 'alerts') {
      fetchIncidents()
    }
    if (activeTab === 'history') {
      fetchAccessLogs()
    }
  }, [activeTab])

  const fetchResidents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, house_number')
      .eq('role', 'resident')
      .eq('residential_cluster', user?.residential_cluster)
    if (data) setResidents(data)
  }

  const fetchIncidents = async () => {
    if (!user?.residential_cluster) return
    const clusterKeyword = user.residential_cluster.replace(/Conjunto\s+\d+\s+/i, '').trim();

    const { data } = await supabase
      .from('incidents_guard_view') // Usar vista protegida para privacidad
      .select('*')
      .ilike('cluster_name', `%${clusterKeyword}%`)
      .eq('status', 'Pendiente')
      .order('created_at', { ascending: false })
    if (data) setIncidents(data)
  }

  const fetchAccessLogs = async () => {
    const { data } = await supabase
      .from('manual_access_logs')
      .select('*')
      .eq('cluster_name', user?.residential_cluster)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setAccessLogs(data)
  }

  const handleManualAccess = async () => {
    if (!manualVisitor || !houseSuffix) return alert("Complete los datos del visitante")
    setLoading(true)
    try {
      const destination = clusterPrefix
        ? `${clusterPrefix}-${houseSuffix.trim().toUpperCase()}`
        : houseSuffix.trim().toUpperCase();

      const { error } = await supabase.from('manual_access_logs').insert([{
        visitor_name: manualVisitor,
        destination_house: destination,
        guard_id: user?.id,
        cluster_name: user?.residential_cluster
      }])
      if (error) throw error

      // Notificar al residente
      if (user?.residential_cluster) {
        await notificationService.notifyResidentByHouse(destination, user.residential_cluster, {
          title: "👤 Visita en Puerta",
          body: `${manualVisitor} se encuentra en la entrada para ingresar a su domicilio.`
        });
      }

      alert("✅ Ingreso manual registrado y residente notificado")
      setManualVisitor(''); setHouseSuffix('')
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAlert = async () => {
    if (!alertTitle) return alert("Ingrese un título para la alerta")
    setLoading(true)
    try {
      const { error } = await supabase.from('security_alerts').insert([{
        title: alertTitle,
        description: alertDesc,
        severity: alertSeverity,
        created_by: user?.id,
        cluster_name: user?.residential_cluster
      }])
      if (error) throw error

      if (user?.residential_cluster) {
        await notificationService.notifyCluster(user.residential_cluster, {
          title: `⚠️ Alerta de Seguridad (${alertSeverity})`,
          body: alertTitle
        })
      }

      alert("📢 Alerta publicada a todos los residentes")
      setAlertTitle(''); setAlertDesc('')
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const startRealScan = async () => {
    try {
        const { camera } = await BarcodeScanner.requestPermissions()
        if (camera !== 'granted') {
            alert('Se necesita permiso de cámara para escanear')
            setIsScanning(false)
            return
        }
        const { barcodes } = await BarcodeScanner.scan()
        if (barcodes.length > 0 && barcodes[0].rawValue) {
            handleScan(barcodes[0].rawValue)
        } else {
            setIsScanning(false)
        }
    } catch (err) {
        console.error('Error scanning:', err)
        setIsScanning(false)
    }
  }

  useEffect(() => {
    if (isScanning) {
        startRealScan()
    }
  }, [isScanning])

  const handleScan = async (qrContent: string) => {
    setLoading(true)
    try {
      if (scanType === 'access') {
        const { data, error } = await supabase
          .from('guest_invitations')
          .select(`
            *,
            profiles:resident_id (first_name, last_name, house_number, residential_cluster)
          `)
          .eq('id', qrContent)
          .single()

        if (error) throw new Error('Código QR no válido o expirado.')

        // Verificar que sea del mismo conjunto
        if (data.profiles?.residential_cluster !== user?.residential_cluster) {
           throw new Error('Este pase pertenece a otro conjunto residencial.')
        }

        // 1. Marcar invitación como usada
        await supabase.from('guest_invitations').update({ status: 'used' }).eq('id', qrContent)

        // 2. Registrar en historial real
        await supabase.from('access_logs').insert([{
            invitation_id: data.id,
            resident_id: data.resident_id,
            guest_name: data.guest_name,
            cluster_name: user?.residential_cluster
        }])

        // 3. Notificar al residente de la llegada real
        await notificationService.sendToUser(data.resident_id, {
            title: "✅ Visita en Casa",
            body: `${data.guest_name} acaba de ingresar al conjunto.`
        })

        setScanResult(data)
      } else {
        // Validación de liberación de paquete
        const { data, error } = await supabase
          .from('casillero_virtual')
          .update({
            status: 'entregado',
            delivered_at: new Date().toISOString()
          })
          .eq('liberation_token', qrContent)
          .eq('status', 'en_custodia')
          .select(`
            *,
            profiles:resident_id (first_name, last_name, house_number)
          `)
          .single()

        if (error || !data) throw new Error('Código de liberación no válido o paquete ya entregado.')
        setScanResult({ ...data, type: 'package_delivered' })
      }
    } catch (err: any) {
      setScanResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleReceivePackage = async () => {
    if (!residentId || !courier) {
      alert("Por favor seleccione un residente y el origen del paquete.")
      return
    }
    setLoading(true)

    const payload = {
        resident_id: residentId,
        courier_name: courier,
        package_details: details,
        status: 'en_custodia'
    }
    const idempotencyKey = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `pkg-${Date.now()}`

    const netStatus = await Network.getStatus();
    if (!netStatus.connected) {
        await enqueueAction({
            tipo: 'visit',
            payload,
            idempotencyKey
        })
        alert("✅ Registro guardado offline. Se sincronizará pronto.")
        setCourier(''); setDetails(''); setResidentId('')
        setLoading(false)
        return
    }

    const { error } = await supabase
      .from('casillero_virtual')
      .insert([payload])

    if (error) alert("Error al registrar: " + error.message)
    else {
      // Notificación real al residente
      if (residentId) {
        await notificationService.sendToUser(residentId, {
          title: "📦 Nuevo Paquete",
          body: `Tienes un paquete de ${courier} esperando en portería.`
        });
      }
      alert("✅ Paquete registrado y residente notificado.")
      setCourier(''); setDetails(''); setResidentId('')
    }
    setLoading(false)
  }

  if (isScanning) {
    return (
      <div style={{ flex: 1, backgroundColor: '#000', height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box', position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 2000 }}>
        {!scanResult ? (
          <>
            <div style={{ width: 250, height: 250, border: '2px solid var(--primary-color)', borderRadius: '20px', position: 'relative', marginBottom: '40px' }}>
              <div style={{ width: '100%', height: '2px', backgroundColor: 'var(--primary-color)', position: 'absolute', top: '50%', boxShadow: '0 0 10px var(--primary-color)', animation: 'scan 2s infinite linear' }}></div>
            </div>
            <p style={{ color: 'white', fontWeight: 'bold', fontSize: '18px', marginBottom: '40px', textAlign: 'center' }}>
              {scanType === 'access' ? 'APUNTE AL QR DE ACCESO' : 'APUNTE AL QR DEL RESIDENTE'}
            </p>
            <div style={{ width: '100%', maxWidth: '300px' }}>
                <label style={{ color: 'white', fontSize: '11px', fontWeight: 800, marginBottom: '10px', display: 'block' }}>INGRESAR ID MANUALMENTE (RESPALDO)</label>
                <input
                    type="text"
                    placeholder="Escribir código..."
                    style={{ ...inputStyle, marginBottom: '20px', textAlign: 'center', backgroundColor: '#222', color: 'white', border: '1px solid #444' }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleScan(e.currentTarget.value) }}
                />
            </div>
            <button onClick={() => setIsScanning(false)} style={{ color: 'white', opacity: 0.7, padding: '10px' }}>Cancelar Escaneo</button>
          </>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '28px', padding: '32px', width: '100%', maxWidth: '350px', textAlign: 'center' }}>
            {scanResult.error ? (
              <>
                <MdCancel size={60} color="#ba1a1a" style={{ marginBottom: '20px' }} />
                <h3 style={{ color: '#ba1a1a', margin: '0 0 10px 0' }}>ERROR</h3>
                <p style={{ fontSize: '14px', color: '#666' }}>{scanResult.error}</p>
              </>
            ) : scanResult.type === 'package_delivered' ? (
              <>
                <MdCheckCircle size={60} color="#27ae60" style={{ marginBottom: '20px' }} />
                <h3 style={{ color: '#27ae60', margin: '0 0 5px 0' }}>PAQUETE LIBERADO</h3>
                <p style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0' }}>Entregado a: {scanResult.profiles?.first_name} {scanResult.profiles?.last_name}</p>
                <p style={{ fontSize: '14px', color: '#666' }}>Casa {scanResult.profiles?.house_number}</p>
              </>
            ) : (
              <>
                <MdCheckCircle size={60} color="#27ae60" style={{ marginBottom: '20px' }} />
                <h3 style={{ color: '#27ae60', margin: '0 0 5px 0' }}>AUTORIZADO</h3>
                <p style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 20px 0' }}>Invitado: {scanResult.guest_name}</p>
                <div style={{ textAlign: 'left', backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '15px', marginBottom: '20px' }}>
                  <p style={{ fontSize: '14px', margin: '0 0 10px 0' }}><strong>Destino:</strong> Casa {scanResult.profiles?.house_number}</p>
                  <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-color)' }}>ÁREAS: {scanResult.allowed_areas?.join(', ')}</p>
                </div>
              </>
            )}
            <button onClick={() => { setIsScanning(false); setScanResult(null); }} style={{ ...primaryBtnStyle, marginTop: '20px' }}>CERRAR</button>
          </div>
        )}
        <style>{`@keyframes scan { 0% { top: 0%; } 50% { top: 100%; } 100% { top: 0%; } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', paddingTop: 'calc(20px + env(safe-area-inset-top))', paddingBottom: '120px', boxSizing: 'border-box' }}>

      <section style={{ marginBottom: '32px', textAlign: 'center' }}>
         <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '34px', color: 'var(--primary-color)', margin: '0 0 10px 0' }}>
           {activeTab === 'control' && 'Control de Accesos'}
           {activeTab === 'packages' && 'Casillero Virtual'}
           {activeTab === 'alerts' && 'Novedades y Alertas'}
         </h2>
      </section>

      {activeTab === 'control' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           <button onClick={() => { setScanType('access'); setIsScanning(true); }} style={qrBtnStyle}>
              <MdQrCodeScanner size={24} /> ESCANEAR QR ACCESO
           </button>
           <div style={cardStyle}>
              <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Registro Manual</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                 <Field label="Nombre Visitante" placeholder="Nombre completo" value={manualVisitor} onChange={(e: any) => setManualVisitor(e.target.value)} />
                 <div style={{ textAlign: 'left' }}>
                    <label style={labelStyle}>Destino (Casa / Apto)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {clusterPrefix && (
                        <div style={{ ...inputStyle, width: '70px', textAlign: 'center', backgroundColor: 'var(--border-color)', flexShrink: 0 }}>
                          {clusterPrefix}-
                        </div>
                      )}
                      <input
                        placeholder="Ej: 73 o 11A"
                        style={{ ...inputStyle, flex: 1 }}
                        value={houseSuffix}
                        autoCapitalize="characters"
                        onChange={(e: any) => setHouseSuffix(e.target.value.toUpperCase())}
                      />
                    </div>
                 </div>
                 <button
                  onClick={handleManualAccess}
                  disabled={loading}
                  style={primaryBtnStyle}
                 >
                   {loading ? 'Registrando...' : 'Registrar Ingreso'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'packages' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           <button onClick={() => { setScanType('package'); setIsScanning(true); }} style={{ ...qrBtnStyle, backgroundColor: '#27ae60' }}>
              <MdInventory size={24} /> ENTREGAR PAQUETE (QR)
           </button>

           <div style={cardStyle}>
              <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Recibir Nuevo Paquete</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                 <div style={{ textAlign: 'left' }}>
                    <label style={labelStyle}>Residente</label>
                    <select
                      style={inputStyle}
                      value={residentId}
                      onChange={e => setResidentId(e.target.value)}
                    >
                      <option value="">Seleccionar Casa...</option>
                      {residents.map(r => (
                        <option key={r.id} value={r.id}>Casa {r.house_number} - {r.first_name} {r.last_name}</option>
                      ))}
                    </select>
                 </div>
                 <Field label="Origen" placeholder="Amazon, DHL, Delivery..." value={courier} onChange={(e: any) => setCourier(e.target.value)} />
                 <Field label="Detalles" placeholder="Caja grande, sobre, etc." value={details} onChange={(e: any) => setDetails(e.target.value)} />
                 <button
                  onClick={handleReceivePackage}
                  disabled={loading}
                  style={primaryBtnStyle}
                 >
                   {loading ? 'Procesando...' : 'Registrar y Notificar'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
           {/* Crear Alerta */}
           <div style={cardStyle}>
              <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Emitir Alerta de Seguridad</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                 <input
                  placeholder="Título de la alerta (ej. Portón Averiado)"
                  style={inputStyle}
                  value={alertTitle}
                  onChange={e => setAlertTitle(e.target.value)}
                 />
                 <textarea
                  placeholder="Descripción detallada..."
                  style={{ ...inputStyle, height: '80px', resize: 'none' }}
                  value={alertDesc}
                  onChange={e => setAlertDesc(e.target.value)}
                 />
                 <select style={inputStyle} value={alertSeverity} onChange={e => setAlertSeverity(e.target.value)}>
                    <option value="info">Información (Verde)</option>
                    <option value="normal">Normal (Amarillo)</option>
                    <option value="critical">Crítica (Rojo)</option>
                 </select>
                 <button
                  onClick={handleCreateAlert}
                  disabled={loading}
                  style={{ ...primaryBtnStyle, backgroundColor: alertSeverity === 'critical' ? '#ba1a1a' : 'var(--primary-color)' }}
                 >
                   <MdNotificationsActive size={20} style={{ marginRight: '8px' }} />
                   Publicar Alerta
                 </button>
              </div>
           </div>

           {/* Quejas de Residentes */}
           <div style={{ marginTop: '10px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '20px', letterSpacing: '1px' }}>REPORTE DE INCIDENTES (RESIDENTES)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                 {incidents.length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-sub)' }}>No hay reportes pendientes.</p>
                 ) : incidents.map(inc => (
                    <div key={inc.id} style={{ ...cardStyle, borderLeft: '6px solid var(--accent-gold)' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                          <span style={{ fontWeight: 800, fontSize: '13px' }}>{inc.category.toUpperCase()}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>{new Date(inc.created_at).toLocaleTimeString()}</span>
                       </div>
                       <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{inc.description}</p>
                       <div style={{ backgroundColor: 'var(--icon-bg)', padding: '10px', borderRadius: '10px' }}>
                          <p style={{ margin: 0, fontSize: '12px', fontWeight: 700 }}>Ubicación: Casa {inc.location || inc.profiles?.house_number || 'N/A'}</p>
                       </div>
                       <button
                        onClick={async () => {
                           await supabase.from('incidents').update({ status: 'Atendido' }).eq('id', inc.id);
                           fetchIncidents();
                           alert("Reporte marcado como atendido.");
                        }}
                        style={{ ...primaryBtnStyle, padding: '10px', marginTop: '15px', fontSize: '13px', backgroundColor: 'var(--accent-gold)' }}
                       >
                         Marcar como Atendido
                       </button>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '10px', letterSpacing: '1px' }}>ÚLTIMOS INGRESOS REGISTRADOS</h3>
           {accessLogs.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-sub)' }}>No hay ingresos registrados hoy.</p>
           ) : accessLogs.map(log => (
              <div key={log.id} style={{ ...cardStyle, padding: '20px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                       <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>{log.visitor_name}</p>
                       <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-sub)' }}>Destino: Casa {log.destination_house}</p>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-sub)' }}>{new Date(log.created_at).toLocaleTimeString()}</span>
                 </div>
              </div>
           ))}
        </div>
      )}
    </div>
  )
}

const Field = ({ label, placeholder, value, onChange }: any) => (
  <div style={{ textAlign: 'left' }}>
    <label style={labelStyle}>{label}</label>
    <input placeholder={placeholder} style={inputStyle} value={value} onChange={onChange} />
  </div>
)

const cardStyle = { backgroundColor: 'var(--card-bg)', padding: '25px', borderRadius: '28px', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' as any }
const inputStyle = { width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)', fontSize: '16px' }
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '10px', textTransform: 'uppercase' as any }
const primaryBtnStyle = { width: '100%', padding: '20px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 700, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const qrBtnStyle = { width: '100%', padding: '22px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', fontSize: '16px' }
