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
  type DebtItem = {
    id: string
    monto_pendiente: number
    concepto?: string
    fecha_vencimiento?: string
    tipo?: string
    descripcion?: string
  }

  const [selectedMethod, setSelectedStep] = useState<'main' | 'pagomovil' | 'transferencia' | 'zelle'>('main')
  const [fileAttached, setFileAttached] = useState<File | null>(null)
  const [senderName, setSenderName] = useState('')
  const [reference, setReference] = useState('')
  const [originBank, setOriginBank] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const [sessionUserId, setSessionUserId] = useState<string | null>(null)
  const [totalDebt, setTotalDebt] = useState(20) // Default a 20 mientras carga o si no hay datos
  const [debtItems, setDebtItems] = useState<DebtItem[]>([])
  const [selectedDebtIds, setSelectedDebtIds] = useState<string[]>([])
  const [loadingDebts, setLoadingDebts] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const selectedDebtTotal = debtItems.length > 0
    ? selectedDebtIds.length > 0
      ? debtItems.filter(debt => selectedDebtIds.includes(debt.id)).reduce((acc, debt) => acc + Number(debt.monto_pendiente), 0)
      : 0
    : totalDebt

  const allDebtSelected = debtItems.length > 0 && selectedDebtIds.length === debtItems.length

  useEffect(() => {
    if (user?.id) {
      setSessionUserId(user.id)
      fetchDebts()
    }
    // sync session user id to avoid RLS mismatches
    const sync = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        const id = data?.session?.user?.id ?? user?.id ?? null
        setSessionUserId(id)
      } catch (err) {
        console.error('Error obteniendo sesión Supabase:', err)
        setSessionUserId(user?.id ?? null)
      }
    }

    sync()

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user?.id ?? user?.id ?? null
      setSessionUserId(id)
    })

    return () => {
      try { sub?.subscription?.unsubscribe?.() } catch (e) {}
    }
  }, [user?.id])

  const fetchDebts = async () => {
    try {
      // 1. Intentar obtener deudas específicas
      const { data: debtData, error } = await supabase
        .from('debts')
        .select('*')
        .eq('residente_id', user?.id)
        .eq('pagada', false)

      if (error) throw error

      // 2. Obtener configuración global (cuota mensual)
      const { data: settings } = await supabase
        .from('condo_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle()

      if (debtData && debtData.length > 0) {
        const total = debtData.reduce((acc: number, d: any) => acc + Number(d.monto_pendiente), 0)
        setDebtItems(debtData)
        setSelectedDebtIds(debtData.map((debt: any) => debt.id))
        setTotalDebt(total || 20)
      } else if (settings) {
        const today = new Date()
        const currentDay = today.getDate()
        const isProntoPago = currentDay <= settings.dias_pronto_pago
        const montoACobrar = isProntoPago ? settings.monto_pronto_pago_usd : settings.cuota_mensual_usd
        setTotalDebt(Number(montoACobrar) || 20)
      } else {
        setTotalDebt(20) // Forzar los 20 si no hay nada en DB
      }
    } catch (err) {
      console.error("Error al cargar deudas:", err)
      setTotalDebt(20) // Fallback de seguridad
    } finally {
      setLoadingDebts(false)
    }
  }

  const handleAttachCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type === 'application/pdf') {
      setFileAttached(file)
      alert(`Archivo PDF "${file.name}" cargado.`)
      return
    }

    // Compresión para imágenes
    setCompressing(true)
    try {
      const compressed = await compressImage(file)
      setFileAttached(compressed)
      alert(`Imagen optimizada y cargada con éxito.`)
    } catch (err) {
      console.error('Error al comprimir:', err)
      setFileAttached(file) // Fallback al original
    } finally {
      setCompressing(false)
    }
  }

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const MAX_WIDTH = 1200
          const MAX_HEIGHT = 1200
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            } else {
              reject(new Error('Canvas blob is null'))
            }
          }, 'image/jpeg', 0.7) // 70% calidad
        }
      }
      reader.onerror = (error) => reject(error)
    })
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
        const fileName = `${user?.id || 'anon'}_${Date.now()}.${fileExt}`
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

      // Ensure session user id to satisfy RLS policies
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError
      const authId = sessionData?.session?.user?.id ?? user?.id ?? sessionUserId
      if (!authId) throw new Error('No se detectó una sesión activa. Por favor inicie sesión nuevamente.')

      const cleanReference = sanitizeString(reference)
      const cleanBank = sanitizeString(originBank)
      const selectedDescription = selectedDebtIds.length > 0
        ? `Cuotas seleccionadas: ${selectedDebtIds.join(', ')}`
        : ''
      const cleanDescription = sanitizeString(`${description} ${selectedDescription}`.trim())
      const cleanSender = sanitizeString(senderName)
      const amountUSD = selectedDebtIds.length > 0 ? selectedDebtTotal : totalDebt

      const { error: dbError } = await supabase.rpc('rpc_insert_payment', {
        monto_bs: amountUSD * bcvRate,
        monto_usd: amountUSD,
        referencia: cleanReference,
        banco_origen: cleanBank,
        evidencia_url: screenshotUrl,
        description: cleanDescription,
        details: selectedMethod === 'zelle' ? { sender: cleanSender, fecha: paymentDate, selected_debts: selectedDebtIds } : { fecha: paymentDate, selected_debts: selectedDebtIds },
        p_profile_id: authId
      })

      if (dbError) throw dbError

      alert("¡Pago registrado con éxito! Su comprobante será validado por la administración en breve.")
      navigate('/dashboard')
    } catch (err: any) {
      alert('Error al registrar pago: ' + (err.message || 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  if (selectedMethod !== 'main') {
    const isPM = selectedMethod === 'pagomovil'
    const isZelle = selectedMethod === 'zelle'

    return (
      <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', display: 'flex', flexDirection: 'column' as any }}>
        <main style={{ paddingLeft: '20px', paddingRight: '20px', maxWidth: '480px', margin: '0 auto', width: '100%', boxSizing: 'border-box' as any, paddingBottom: '40px', paddingTop: '10px' }}>
          <h1 style={{ fontSize: '32px', color: 'var(--primary-color)', fontWeight: 800, textAlign: 'center', marginBottom: '30px' }}>{isPM ? 'Pago Móvil' : isZelle ? 'Zelle' : 'Transferencia'}</h1>
          <div style={cardStyle}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(198,160,89,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                {isPM ? <MdOutlineSmartphone size={32} color="var(--accent-gold)" /> : isZelle ? <MdOutlinePayments size={32} color="var(--accent-gold)" /> : <MdOutlineAccountBalance size={32} color="var(--accent-gold)" />}
              </div>
              <h2 style={{ fontSize: '20px', color: 'var(--primary-color)', margin: 0, fontWeight: 700 }}>Datos del Pago</h2>
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

                  <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <label style={labelStyle}>DATOS DE TU PAGO</label>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontSize: '10px', color: 'var(--text-sub)', fontWeight: 700 }}>BANCO DE ORIGEN</label>
                      <input
                        type="text"
                        placeholder="Ej: Banesco, Mercantil..."
                        value={originBank}
                        onChange={(e) => setOriginBank(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontSize: '10px', color: 'var(--text-sub)', fontWeight: 700 }}>NÚMERO DE REFERENCIA (ÚLTIMOS 6 DÍGITOS)</label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="000000"
                        maxLength={6}
                        value={reference}
                        onChange={(e) => setReference(e.target.value.replace(/[^0-9]/g, ''))}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontSize: '10px', color: 'var(--text-sub)', fontWeight: 700 }}>FECHA DEL PAGO</label>
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        style={inputStyle}
                      />
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ fontSize: '10px', color: 'var(--text-sub)', fontWeight: 700 }}>MOTIVO O DESCRIPCIÓN DEL PAGO</label>
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

              <div style={{ ...infoRowStyle, border: 'none', backgroundColor: 'var(--icon-bg)', padding: '15px', borderRadius: '12px', marginTop: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-sub)' }}>MONTO A ENVIAR</span>
                  {!isZelle && (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-color)' }}>
                      (Tasa BCV: {bcvRate.toFixed(2)} Bs/$)
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-color)' }}>{formatUSD(selectedDebtTotal)}</span>
                  {!isZelle && (
                    <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary-color)' }}>
                      {formatBs(selectedDebtTotal, bcvRate)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '30px' }}>
              <label style={labelStyle}>ADJUNTAR COMPROBANTE</label>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={compressing}
                style={{
                  width: '100%', padding: '15px', border: '2px dashed var(--border-color)', borderRadius: '12px',
                  backgroundColor: fileAttached ? 'rgba(198,160,89,0.15)' : 'var(--icon-bg)', color: 'var(--text-color)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  opacity: compressing ? 0.6 : 1
                }}
              >
                {compressing ? <MdOutlineSync className="animate-spin" size={24} /> : fileAttached ? <MdOutlineCheckCircle size={24} /> : <MdOutlineCloudUpload size={24} />}
                <span style={{ fontSize: '14px', fontWeight: 600 }}>
                  {compressing ? 'Optimizando imagen...' : fileAttached ? (fileAttached.type === 'application/pdf' ? 'PDF Adjuntado' : 'Imagen Adjuntada') : 'Subir Comprobante (Imagen o PDF)'}
                </span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleAttachCapture} accept="image/*,application/pdf" style={{ display: 'none' }} />
            </div>

                    <button
                onClick={handleRegisterPayment}
                disabled={loading || (debtItems.length > 0 && selectedDebtIds.length === 0)}
                style={{ ...primaryBtnStyle, marginTop: '30px', marginBottom: '20px', opacity: (loading || (debtItems.length > 0 && selectedDebtIds.length === 0)) ? 0.7 : 1 }}
              >
              {loading ? 'Procesando...' : debtItems.length > 0 && selectedDebtIds.length === 0 ? 'Seleccione al menos una cuota' : 'Registrar Pago'}
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={{ ...containerStyle, minHeight: 'auto' }}>
      <main style={{ paddingLeft: '20px', paddingRight: '20px', maxWidth: '520px', margin: '0 auto', width: '100%', boxSizing: 'border-box' as any, paddingBottom: '40px', paddingTop: '10px' }}>
        <h1 style={{ fontSize: '32px', color: 'var(--primary-color)', fontWeight: 800, textAlign: 'center', marginBottom: '24px' }}>Pagos de Condominio</h1>

        {loadingDebts ? (
          <div style={{ padding: '24px', borderRadius: '24px', backgroundColor: 'var(--card-bg)', boxShadow: THEME.shadow, marginBottom: '24px', border: '1px solid var(--border-color)' }}>
            <p style={{ margin: 0, color: 'var(--text-sub)', fontWeight: 700 }}>Cargando deudas pendientes...</p>
          </div>
        ) : debtItems.length > 0 ? (
          <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <p style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700, color: 'var(--text-sub)', letterSpacing: '1px' }}>DEUDAS PENDIENTES</p>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: 'var(--primary-color)' }}>{debtItems.length} cuota{debtItems.length === 1 ? '' : 's'} encontradas</h2>
              </div>
              <button onClick={() => setSelectedDebtIds(allDebtSelected ? [] : debtItems.map(d => d.id))} style={{ padding: '12px 16px', borderRadius: '14px', border: `1px solid ${allDebtSelected ? 'var(--primary-color)' : 'var(--border-color)'}`, backgroundColor: allDebtSelected ? 'var(--primary-color)' : 'var(--card-bg)', color: allDebtSelected ? 'white' : 'var(--text-sub)', cursor: 'pointer', fontWeight: 700 }}>
                {allDebtSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
            </div>
            <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border-color)', boxShadow: THEME.shadow, overflow: 'hidden' }}>
              {debtItems.map((debt) => {
                const isSelected = selectedDebtIds.includes(debt.id)
                const subtitle = debt.tipo || debt.concepto || 'Cuota pendiente'
                const dueDate = debt.fecha_vencimiento ? new Date(debt.fecha_vencimiento).toLocaleDateString('es-VE') : null

                return (
                  <button
                    key={debt.id}
                    onClick={() => {
                      setSelectedDebtIds(prev => prev.includes(debt.id) ? prev.filter(id => id !== debt.id) : [...prev, debt.id])
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '18px 20px',
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'rgba(15,85,81,0.08)' : 'var(--card-bg)',
                      cursor: 'pointer',
                      color: 'var(--text-color)',
                      textAlign: 'left',
                      border: 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: isSelected ? '2px solid var(--primary-color)' : '2px solid var(--border-color)', backgroundColor: isSelected ? 'var(--primary-color)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {isSelected && <span style={{ color: 'white', fontSize: '12px', fontWeight: 800 }}>✓</span>}
                      </div>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 700 }}>{subtitle}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-sub)' }}>{dueDate ? `Vence ${dueDate}` : 'Sin fecha'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary-color)' }}>{formatUSD(Number(debt.monto_pendiente))}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-sub)' }}>{formatBs(Number(debt.monto_pendiente), bcvRate)}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--border-color)', padding: '24px', boxShadow: THEME.shadow, marginBottom: '24px' }}>
            <p style={{ margin: 0, color: 'var(--text-sub)', fontWeight: 700 }}>No se encontraron deudas específicas.</p>
            <p style={{ margin: '10px 0 0 0', color: 'var(--text-sub)' }}>Se mostrará el monto pendiente estándar para pago.</p>
          </div>
        )}

        <div style={{ backgroundColor: 'var(--primary-color)', borderRadius: '24px', padding: '30px', color: 'white', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.12)' }}>
           <p style={{ margin: '0 0 12px 0', fontSize: '13px', opacity: 0.9, fontWeight: 700, letterSpacing: '1px' }}>MONTO SELECCIONADO</p>
           <h2 style={{ margin: '0 0 8px 0', fontSize: '42px', fontWeight: 800, letterSpacing: '-1px' }}>{formatUSD(selectedDebtTotal)}</h2>
           <p style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: 700, color: 'var(--accent-gold)' }}>Equivalente a: {formatBs(selectedDebtTotal, bcvRate)}</p>
           <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '15px 0' }}></div>
           <p style={{ margin: 0, fontSize: '11px', opacity: 0.7, fontWeight: 600 }}>Tasa oficial BCV: {bcvRate.toFixed(2)} Bs/$</p>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-color)', marginBottom: '20px', marginLeft: '5px' }}>Opciones de Pago</h3>

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
      <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-sub)' }}>{label}</span>
      <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-color)' }}>{value}</span>
  </div>
)

const PaymentOption = ({ icon: Icon, label, sublabel, highlight, onClick }: any) => (
  <div onClick={onClick} style={{ backgroundColor: highlight ? 'rgba(198,160,89,0.12)' : 'var(--card-bg)', border: highlight ? '2px solid var(--accent-gold)' : '1px solid var(--border-color)', borderRadius: '18px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer', boxSizing: 'border-box' }}>
     <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: highlight ? 'var(--accent-gold)' : 'var(--icon-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: highlight ? 'white' : 'var(--primary-color)', flexShrink: 0 }}>
        <Icon size={24} />
     </div>
     <div style={{ flex: 1 }}>
        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-color)', display: 'block' }}>{label}</span>
        {sublabel && <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 600 }}>{sublabel}</span>}
     </div>
     <MdOutlineChevronRight size={24} style={{ color: highlight ? 'var(--accent-gold)' : 'var(--border-color)' }} />
  </div>
)

const containerStyle = { backgroundColor: 'var(--bg-color)', fontFamily: "'Inter', sans-serif", color: 'var(--text-color)', display: 'flex', flexDirection: 'column' as any, minHeight: '100vh' }
const headerStyle = { position: 'fixed' as any, top: 0, width: '100%', height: '64px', backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 20px', zIndex: 100, boxSizing: 'border-box' as any }
const backBtnStyle = { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', color: 'var(--primary-color)' }
const titleStyle = { fontSize: '18px', color: 'var(--primary-color)', fontWeight: 800, margin: '0 0 0 15px', letterSpacing: '0.5px' }
const mainContentStyle = { paddingTop: '84px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '480px', margin: '0 auto', width: '100%', boxSizing: 'border-box' as any, paddingBottom: '40px' }
const cardStyle = { backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '30px', boxShadow: THEME.shadow }
const infoGridStyle = { display: 'flex', flexDirection: 'column' as any, gap: '15px' }
const infoRowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }
const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 900, color: 'var(--text-sub)', marginBottom: '12px', letterSpacing: '1px' }
const inputStyle = { width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', fontSize: '16px', boxSizing: 'border-box' as any, outline: 'none', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)' }
const primaryBtnStyle = { width: '100%', padding: '18px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 800, fontSize: '16px', cursor: 'pointer', boxShadow: THEME.shadow, letterSpacing: '1px' }
