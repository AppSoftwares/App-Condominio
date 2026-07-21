import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { MdCheckCircle, MdCancel, MdInfo, MdInventory, MdQrCodeScanner } from 'react-icons/md'
import { Network } from '@capacitor/network'
import { enqueueAction } from '../../lib/offlineQueue'
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'

export const GuardPortal: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'control'

  const [isScanning, setIsScanning] = useState(false)
  const [scanType, setScanType] = useState<'access' | 'package'>('access')
  const [scanResult, setScanResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // Estados para Casillero Virtual
  const [residentId, setResidentId] = useState('')
  const [courier, setCourier] = useState('')
  const [details, setDetails] = useState('')
  const [residents, setResidents] = useState<any[]>([])

  useEffect(() => {
    if (activeTab === 'packages') {
      fetchResidents()
    }
  }, [activeTab])

  const fetchResidents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, house_number')
      .eq('role', 'resident')
    if (data) setResidents(data)
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
            tipo: 'visit', // Usamos visit genéricamente para cola offline
            payload,
            idempotencyKey
        })
        alert("✅ Registro guardado offline. Se sincronizará pronto.")
        setCourier('')
        setDetails('')
        setResidentId('')
        setLoading(false)
        return
    }

    const { error } = await supabase
      .from('casillero_virtual')
      .insert([payload])

    if (error) alert("Error al registrar: " + error.message)
    else {
      alert("✅ Paquete registrado y notificación enviada.")
      setCourier('')
      setDetails('')
      setResidentId('')
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
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', padding: '20px', paddingTop: '94px', paddingBottom: '120px', boxSizing: 'border-box' }}>
      {/* Selector de Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', overflowX: 'auto', paddingBottom: '5px' }}>
         <TabButton active={activeTab === 'control'} onClick={() => navigate('/guard?tab=control')} icon="security" label="Accesos" />
         <TabButton active={activeTab === 'packages'} onClick={() => navigate('/guard?tab=packages')} icon="inventory_2" label="Paquetes" />
         <TabButton active={activeTab === 'alerts'} onClick={() => navigate('/guard?tab=alerts')} icon="warning" label="Alertas" />
      </div>

      <section style={{ marginBottom: '32px', textAlign: 'center' }}>
         <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '34px', color: 'var(--primary-color)', margin: '0 0 10px 0' }}>
           {activeTab === 'control' && 'Control de Accesos'}
           {activeTab === 'packages' && 'Casillero Virtual'}
           {activeTab === 'alerts' && 'Alertas de Seguridad'}
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
                 <Field label="Nombre Visitante" placeholder="Nombre completo" />
                 <div style={{ textAlign: 'left' }}>
                    <label style={labelStyle}>Destino (Casa)</label>
                    <input
                        placeholder="Ej: 14-73"
                        style={inputStyle}
                        onChange={(e: any) => {
                            let val = e.target.value.replace(/[^0-9-]/g, '');
                            if (val.length === 2 && !val.includes('-')) val += '-';
                            if (val.length <= 5) e.target.value = val;
                        }}
                    />
                 </div>
                 <button style={primaryBtnStyle}>Registrar Ingreso</button>
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

      {/* Otros tabs omitidos por brevedad o mantenidos igual */}
    </div>
  )
}

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} style={{
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '15px',
    border: 'none', backgroundColor: active ? 'var(--primary-color)' : 'var(--card-bg)',
    color: active ? 'white' : 'var(--text-sub)', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap'
  }}>
    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{icon}</span>
    {label}
  </button>
)

const Field = ({ label, placeholder, value, onChange }: any) => (
  <div style={{ textAlign: 'left' }}>
    <label style={labelStyle}>{label}</label>
    <input placeholder={placeholder} style={inputStyle} value={value} onChange={onChange} />
  </div>
)

const cardStyle = { backgroundColor: 'var(--card-bg)', padding: '25px', borderRadius: '28px', border: '1px solid var(--border-color)', width: '100%', boxSizing: 'border-box' as any }
const inputStyle = { width: '100%', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)', fontSize: '16px' }
const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '10px', textTransform: 'uppercase' as any }
const primaryBtnStyle = { width: '100%', padding: '20px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '18px', fontWeight: 700, fontSize: '16px' }
const qrBtnStyle = { width: '100%', padding: '22px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '22px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', fontSize: '16px' }
