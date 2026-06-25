import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MdArrowBack,
  MdOutlineSmartphone,
  MdOutlinePayments,
  MdOutlineAccountBalance,
  MdOutlineSync,
  MdOutlineCheckCircle,
  MdOutlineCloudUpload,
  MdOutlineChevronRight
} from 'react-icons/md'
import { formatBs, formatUSD } from '../../utils/currency'
import { useCurrencyStore } from '../../store/useCurrencyStore'
import { useAuthStore } from '../../store/useAuthStore'
import { supabase } from '../../lib/supabase'
import { sanitizeString } from '../../utils/security'

const THEME = {
  colors: {
    primary: '#0f5551',
    accentGold: '#785919',
    bg: '#F4F7F6',
    white: '#ffffff',
    text: '#1b1c1a',
    textSub: '#5f6b69',
    border: '#E2E8E7',
    success: '#27ae60',
  },
  shadow: '0px 10px 30px rgba(0,0,0,0.05)',
  radius: '24px'
}

export const Payments: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const bcvRate = useCurrencyStore(state => state.bcvRate)
  const [selectedMethod, setSelectedStep] = useState<'main' | 'pagomovil' | 'transferencia' | 'zelle'>('main')
  const [fileAttached, setFileAttached] = useState<File | null>(null)
  const [senderName, setSenderName] = useState('')
  const [reference, setReference] = useState('')
  const [originBank, setOriginBank] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [debts, setDebts] = useState<any[]>([])
  const [loadingDebts, setLoadingDebts] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const debtUSD = debts.length > 0 ? debts.reduce((acc, d) => acc + d.monto_pendiente, 0) : 0

  useEffect(() => {
    fetchDebts()
  }, [])

  const fetchDebts = async () => {
    try {
      const { data, error } = await supabase
        .from('debts')
        .select('*')
        .eq('residente_id', user?.id)
        .eq('pagada', false)

      if (error) throw error
      setDebts(data || [])
    } catch (err) {
      console.error("Error al cargar deudas:", err)
    } finally {
      setLoadingDebts(false)
    }
  }

  const handleAttachCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileAttached(file)
      alert(`Comprobante "${file.name}" cargado.`)
    }
  }

  const handleRegisterPayment = async () => {
    if ((selectedMethod !== 'main') && !fileAttached) {
      alert("Por favor adjunte el capture del comprobante para continuar.")
      return
    }

    setLoading(true)
    try {
      let screenshotUrl = ''

      if (fileAttached) {
        const fileExt = fileAttached.name.split('.').pop()
        const fileName = `${user?.id}_${Date.now()}.${fileExt}`
        const filePath = `payments/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('payment-captures')
          .upload(filePath, fileAttached)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('payment-captures')
          .getPublicUrl(filePath)

        screenshotUrl = publicUrl
      }

      const cleanReference = sanitizeString(reference)
      const cleanBank = sanitizeString(originBank)
      const cleanDescription = sanitizeString(description)
      const cleanSender = sanitizeString(senderName)

      const { error: dbError } = await supabase
        .from('payments')
        .insert([
          {
            profile_id: user?.id,
            monto_bs: debtUSD * bcvRate,
            referencia: cleanReference,
            banco_origen: cleanBank,
            status: 'pendiente',
            evidencia_url: screenshotUrl,
            description: cleanDescription,
            details: selectedMethod === 'zelle' ? { sender: cleanSender, fecha: paymentDate } : { fecha: paymentDate }
          }
        ])

      if (dbError) throw dbError

      alert("¡Pago registrado con éxito! Su comprobante será validado por la administración en breve.")
      navigate('/dashboard')
    } catch (err: any) {
      alert('Error al registrar pago: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (selectedMethod !== 'main') {
    const isPM = selectedMethod === 'pagomovil'
    const isZelle = selectedMethod === 'zelle'

    return (
      <div style={{ backgroundColor: 'var(--bg-color)', fontFamily: "'Inter', sans-serif", color: 'var(--text-color)', display: 'flex', flexDirection: 'column' as any }}>
        <header style={headerStyle}>
          <button onClick={() => setSelectedStep('main')} style={backBtnStyle}>
            <MdArrowBack size={24} />
          </button>
          <h1 style={titleStyle}>{isPM ? 'Pago Móvil' : isZelle ? 'Zelle' : 'Transferencia'}</h1>
        </header>

        <main style={mainContentStyle}>
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#ffdea6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                {isPM ? <MdOutlineSmartphone size={32} color="#785919" /> : isZelle ? <MdOutlinePayments size={32} color="#785919" /> : <MdOutlineAccountBalance size={32} color="#785919" />}
              </div>
              <h2 style={{ fontSize: '20px', color: '#0f5551', margin: 0, fontWeight: 700 }}>Datos del Pago</h2>
            </div>

            <div style={infoGridStyle}>
              {isZelle ? (
                <>
                  <InfoRow label="EMAIL ZELLE" value="CONDOMINIOLAS HUERTAS@GMAIL.COM" />
                  <InfoRow label="CONCEPTO" value="Pago casa 14-01" />
                  <div style={{ marginTop: '10px' }}>
                    <label style={labelStyle}>NOMBRE DEL TITULAR (QUIEN ENVÍA)</label>
                    <input
                      type="text"
                      placeholder="Nombre y Apellido"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </>
              ) : (
                <>
                  <InfoRow label="BANCO RECEPTOR" value="Banco Nacional de Crédito (0191)" />
                  <InfoRow label="RIF" value="J-299007323" />
                  {!isPM && <InfoRow label="CUENTA" value="0191-0000-00-0000000000" />}
                  <InfoRow label="NOMBRE" value="Adm. Conj. Las Huertas" />

                  <div style={{ marginTop: '20px', borderTop: '1px solid #efeeeb', paddingTop: '20px' }}>
                    <label style={labelStyle}>DATOS DE TU PAGO</label>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontSize: '10px', color: '#6f7978', fontWeight: 700 }}>BANCO DE ORIGEN</label>
                      <input
                        type="text"
                        placeholder="Ej: Banesco, Mercantil..."
                        value={originBank}
                        onChange={(e) => setOriginBank(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontSize: '10px', color: '#6f7978', fontWeight: 700 }}>NÚMERO DE REFERENCIA (ÚLTIMOS 6 DÍGITOS)</label>
                      <input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontSize: '10px', color: '#6f7978', fontWeight: 700 }}>FECHA DEL PAGO</label>
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontSize: '10px', color: '#6f7978', fontWeight: 700 }}>MOTIVO O DESCRIPCIÓN DEL PAGO</label>
                      <textarea
                        placeholder="Ej: Pago de condominio Octubre y cuota extra de bomba"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ ...inputStyle, height: '80px', resize: 'none' }}
                      />
                    </div>
                  </div>
                </>
              )}

              <div style={{ ...infoRowStyle, border: 'none', backgroundColor: '#f5f3f0', padding: '15px', borderRadius: '12px', marginTop: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#3d503e' }}>MONTO A ENVIAR</span>
                  {!isZelle && (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#785919' }}>
                      (Tasa BCV: {bcvRate.toFixed(2)} Bs/$)
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f5551' }}>{formatUSD(debtUSD)}</span>
                  {!isZelle && (
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#2f6d69' }}>
                      {formatBs(debtUSD, bcvRate)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '30px' }}>
              <label style={labelStyle}>ADJUNTAR COMPROBANTE</label>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%', padding: '15px', border: '2px dashed #bfc8c7', borderRadius: '12px',
                  backgroundColor: fileAttached ? '#d3e8d0' : '#FAF8F5', color: '#3f4947',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                }}
              >
                {fileAttached ? <MdOutlineCheckCircle size={24} /> : <MdOutlineCloudUpload size={24} />}
                <span style={{ fontSize: '14px', fontWeight: 600 }}>{fileAttached ? (fileAttached.type === 'application/pdf' ? 'PDF Adjuntado' : 'Imagen Adjuntada') : 'Subir Comprobante (Imagen o PDF)'}</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleAttachCapture} accept="image/*,application/pdf" style={{ display: 'none' }} />
            </div>

            <button
              onClick={handleRegisterPayment}
              disabled={loading}
              style={{ ...primaryBtnStyle, marginTop: '30px', marginBottom: '20px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Procesando...' : 'Registrar Pago'}
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <button onClick={() => navigate('/dashboard')} style={backBtnStyle}>
          <MdArrowBack size={24} />
        </button>
        <h1 style={titleStyle}>Pagos de Condominio</h1>
      </header>

      <main style={mainContentStyle}>
        <div style={{ backgroundColor: '#2f6d69', borderRadius: '24px', padding: '30px', color: 'white', marginBottom: '40px', boxShadow: '0 10px 30px rgba(47,109,105,0.2)' }}>
           <p style={{ margin: '0 0 12px 0', fontSize: '13px', opacity: 0.9, fontWeight: 700, letterSpacing: '1px' }}>MONTO PENDIENTE</p>
           <h2 style={{ margin: '0 0 8px 0', fontSize: '42px', fontWeight: 800, letterSpacing: '-1px' }}>{formatUSD(debtUSD)}</h2>
           <p style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: 700, color: '#ffdea6' }}>Equivalente a: {formatBs(debtUSD, bcvRate)}</p>
           <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '15px 0' }}></div>
           <p style={{ margin: 0, fontSize: '11px', opacity: 0.7, fontWeight: 600 }}>Tasa oficial BCV: {bcvRate.toFixed(2)} Bs/$</p>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1B1C1A', marginBottom: '20px', marginLeft: '5px' }}>Opciones de Pago</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '20px' }}>
           <PaymentOption
              icon={MdOutlineSync}
              label="Domiciliación Digital (Venflow)"
              sublabel="Cobra y concilia automáticamente"
              highlight
           />
           <PaymentOption
              icon={MdOutlineSmartphone}
              label="Pago Móvil"
              sublabel="Validación manual en 24h"
              onClick={() => setSelectedStep('pagomovil')}
           />
           <PaymentOption
              icon={MdOutlineAccountBalance}
              label="Transferencia Bancaria"
              sublabel="Datos BNC y adjuntar capture"
              onClick={() => setSelectedStep('transferencia')}
           />
           <PaymentOption
              icon={MdOutlinePayments}
              label="Zelle"
              sublabel="CONDOMINIOLAS HUERTAS@GMAIL.COM"
              onClick={() => setSelectedStep('zelle')}
           />
        </div>
      </main>
    </div>
  )
}

const InfoRow = ({ label, value }: any) => (
  <div style={infoRowStyle}>
    <span style={{ fontSize: '11px', fontWeight: 800, color: '#6f7978' }}>{label}</span>
    <span style={{ fontSize: '15px', fontWeight: 700, color: '#1B1C1A' }}>{value}</span>
  </div>
)

const PaymentOption = ({ icon: Icon, label, sublabel, highlight, onClick }: any) => (
  <div onClick={onClick} style={{ backgroundColor: highlight ? '#fdf8ef' : 'white', border: highlight ? '2px solid #C6A059' : '1px solid #bfc8c7', borderRadius: '18px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', boxSizing: 'border-box' }}>
     <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: highlight ? '#C6A059' : '#f5f3f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: highlight ? 'white' : '#785919', flexShrink: 0 }}>
        <Icon size={24} />
     </div>
     <div style={{ flex: 1 }}>
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#1B1C1A', display: 'block' }}>{label}</span>
        {sublabel && <span style={{ fontSize: '11px', color: '#785919', fontWeight: 600 }}>{sublabel}</span>}
     </div>
     <MdOutlineChevronRight size={24} style={{ color: highlight ? '#C6A059' : '#bfc8c7' }} />
  </div>
)

const containerStyle = { backgroundColor: THEME.colors.bg, fontFamily: "'Inter', sans-serif", color: THEME.colors.text, display: 'flex', flexDirection: 'column' as any, minHeight: '100vh' }
const headerStyle = { position: 'fixed' as any, top: 0, width: '100%', height: '64px', backgroundColor: THEME.colors.white, borderBottom: `1px solid ${THEME.colors.border}`, display: 'flex', alignItems: 'center', padding: '0 20px', zIndex: 100, boxSizing: 'border-box' as any }
const backBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', color: THEME.colors.primary }
const titleStyle = { fontSize: '18px', color: THEME.colors.primary, fontWeight: 800, margin: '0 0 0 15px', letterSpacing: '0.5px' }
const mainContentStyle = { paddingTop: '84px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '480px', margin: '0 auto', width: '100%', boxSizing: 'border-box' as any, paddingBottom: '40px' }
const cardStyle = { backgroundColor: THEME.colors.white, border: `1px solid ${THEME.colors.border}`, borderRadius: THEME.radius, padding: '30px', boxShadow: THEME.shadow }
const infoGridStyle = { display: 'flex', flexDirection: 'column' as any, gap: '15px' }
const infoRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #efeeeb', paddingBottom: '12px' }
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 900, color: THEME.colors.textSub, marginBottom: '12px', letterSpacing: '1px' }
const inputStyle = { width: '100%', padding: '16px', borderRadius: '14px', border: `1px solid ${THEME.colors.border}`, fontSize: '16px', boxSizing: 'border-box' as any, outline: 'none', backgroundColor: THEME.colors.bg }
const primaryBtnStyle = { width: '100%', padding: '18px', backgroundColor: THEME.colors.primary, color: 'white', border: 'none', borderRadius: '16px', fontWeight: 800, fontSize: '16px', cursor: 'pointer', boxShadow: THEME.shadow, letterSpacing: '1px' }
