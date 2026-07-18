import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdArrowBack, MdCheckCircle, MdBlock } from 'react-icons/md'
import html2canvas from 'html2canvas'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'

export const Guests: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [guestName, setGuestName] = useState('')
  const [guestId, setGuestId] = useState('')
  const [showQR, setShowQR] = useState(false)
  const [qrData, setQrData] = useState('')
  const [allowedAreas, setAllowedAreas] = useState<string[]>(['residencia'])
  const [isBlocked, setIsBlocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [recentGuests, setRecentGuests] = useState<any[]>([])
  const qrRef = useRef<HTMLDivElement>(null)

  const areas = [
    { id: 'residencia', label: 'Residencia (Auto)', disabled: true },
    { id: 'parrilleras', label: 'Parrilleras' },
    { id: 'cancha', label: 'Cancha Deportiva' },
    { id: 'bohio', label: 'Bohío' },
  ]

  useEffect(() => {
    checkDebtStatus()
    fetchRecentGuests()
  }, [])

  const checkDebtStatus = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase.rpc('check_debt_limit', { res_id: user.id })
      if (error) throw error
      setIsBlocked(data === true)
    } catch (err) {
      console.error('Error checking debt:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentGuests = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('guest_invitations')
        .select('*')
        .eq('resident_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      setRecentGuests(data || [])
    } catch (err) {
      console.error('Error fetching guests:', err)
    }
  }

  const handleAreaToggle = (areaId: string) => {
    if (areaId === 'residencia') return
    setAllowedAreas(prev =>
      prev.includes(areaId) ? prev.filter(a => a !== areaId) : [...prev, areaId]
    )
  }

  const handleGenerateQR = async () => {
    if (isBlocked) return
    if (!guestName) return alert('Por favor ingrese el nombre del invitado')

    try {
      const { data, error } = await supabase
        .from('guest_invitations')
        .insert([{
          resident_id: user?.id,
          guest_name: guestName,
          guest_id_number: guestId,
          allowed_areas: allowedAreas
        }])
        .select()
        .single()

      if (error) throw error

      // Payload del QR con ID único para que el vigilante consulte
      setQrData(data.id)
      setShowQR(true)
      fetchRecentGuests()
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  const handleShareWA = async () => {
    const areasStr = allowedAreas.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ');
    const msg = `Hola ${guestName}, aquí tienes tu pase QR de acceso para Caminos de la Lagunita. Áreas permitidas: ${areasStr}.`;

    if (qrRef.current) {
      try {
        const canvas = await html2canvas(qrRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          logging: false,
          useCORS: true
        });

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], `Pase_${guestName.replace(/\s+/g, '_')}.png`, { type: 'image/png' });

          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Pase de Acceso QR',
              text: msg,
            });
          } else {
            // Fallback: solo texto si no se puede compartir archivos
            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
          }
        }, 'image/png');
      } catch (err) {
        console.error('Error sharing QR:', err);
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    }
  }

  const handleDownload = async () => {
    if (qrRef.current) {
      try {
        const canvas = await html2canvas(qrRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
          useCORS: true
        });
        const link = document.createElement('a');
        link.download = `Pase_QR_${guestName}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        alert('Error al descargar el pase');
      }
    }
  }

  if (loading) return <div style={{ padding: '50px', textAlign: 'center' }}>Cargando...</div>

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', paddingBottom: '100px' }}>
      <main style={{ paddingLeft: '20px', paddingRight: '20px', maxWidth: '500px', margin: '0 auto', paddingTop: '10px' }}>
        <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '32px', color: 'var(--primary-color)', fontWeight: 700, textAlign: 'center', marginBottom: '30px' }}>Acceso de Invitados</h1>

        {isBlocked ? (
          <div style={{ backgroundColor: '#fff5f5', border: '1px solid #feb2b2', borderRadius: '28px', padding: '32px', marginBottom: '30px', textAlign: 'center' }}>
            <MdBlock size={50} color="#e53e3e" style={{ marginBottom: '15px' }} />
            <h3 style={{ color: '#c53030', marginBottom: '10px' }}>ACCESO RESTRINGIDO</h3>
            <p style={{ fontSize: '14px', color: '#742a2a', lineHeight: 1.5 }}>
              Detectamos una deuda pendiente de 3 o más meses en su cuenta. La generación de pases QR está bloqueada hasta que regularice su situación.
            </p>
            <button onClick={() => navigate('/res/payments')} style={{ ...primaryBtnStyle, marginTop: '20px', backgroundColor: '#e53e3e' }}>Ver Mis Pagos</button>
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '28px', padding: '32px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
             <h3 style={{ fontSize: '13px', color: 'var(--accent-gold)', marginBottom: '24px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Autorizar Nuevo Invitado</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                   <label style={labelStyle}>Nombre del Invitado</label>
                   <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Nombre completo" style={inputStyle} />
                </div>
                <div>
                   <label style={labelStyle}>Documento ID (Opcional)</label>
                   <input value={guestId} onChange={e => setGuestId(e.target.value)} placeholder="Cédula o Pasaporte" style={inputStyle} />
                </div>

                <div>
                   <label style={labelStyle}>Áreas Permitidas</label>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                      {areas.map(area => (
                        <div
                          key={area.id}
                          onClick={() => handleAreaToggle(area.id)}
                          style={{
                            padding: '12px',
                            borderRadius: '12px',
                            border: '1px solid',
                            borderColor: allowedAreas.includes(area.id) ? 'var(--primary-color)' : 'var(--border-color)',
                            backgroundColor: allowedAreas.includes(area.id) ? 'rgba(15,85,81,0.05)' : 'var(--icon-bg)',
                            cursor: area.disabled ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            opacity: area.disabled ? 0.7 : 1
                          }}
                        >
                          {allowedAreas.includes(area.id) ? <MdCheckCircle color="var(--primary-color)" /> : <div style={{ width: 16, height: 16, borderRadius: '50%', border: '1px solid var(--border-color)' }} />}
                          {area.label}
                        </div>
                      ))}
                   </div>
                </div>

                <button onClick={handleGenerateQR} style={primaryBtnStyle}>Generar Pase QR</button>
             </div>
          </div>
        )}

        {showQR && (
          <div style={{ marginBottom: '30px', animation: 'fadeIn 0.5s ease' }}>
            <div ref={qrRef} style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '28px', padding: '32px', textAlign: 'center' }}>
              <p style={{ color: '#27ae60', fontWeight: 800, fontSize: '12px', marginBottom: '20px' }}>PASE DE ACCESO DIGITAL</p>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', display: 'inline-block', marginBottom: '20px', border: '1px solid #efeeeb' }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrData}`} alt="QR Code" style={{ width: '180px', height: '180px' }} />
              </div>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '20px', color: 'var(--primary-color)', fontWeight: 700 }}>{guestName.toUpperCase()}</h4>
              <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600 }}>CASA {user?.house_number}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', justifyContent: 'center' }}>
                {allowedAreas.map(a => (
                  <span key={a} style={{ fontSize: '9px', backgroundColor: '#f0fdf4', color: '#166534', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, textTransform: 'uppercase' }}>{a}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button
                onClick={handleDownload}
                style={{ ...primaryBtnStyle, backgroundColor: 'var(--accent-gold)', flex: 1 }}
              >
                Descargar
              </button>
              <button
                onClick={handleShareWA}
                style={{ ...primaryBtnStyle, backgroundColor: '#25D366', flex: 1 }}
              >
                Enviar WA
              </button>
            </div>
          </div>
        )}

        <h3 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>Invitados Recientes</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
           {recentGuests.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '32px', backgroundColor: 'var(--card-bg)', borderRadius: '24px', border: '1px dashed var(--border-color)' }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-sub)', fontWeight: 600 }}>No has generado pases recientemente.</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: 'var(--text-sub)', opacity: 0.7 }}>Autoriza a tus visitas desde el formulario superior.</p>
             </div>
           ) : recentGuests.map(g => (
             <GuestCard key={g.id} name={g.guest_name} status={g.status === 'active' ? 'Activo' : g.status} date={new Date(g.created_at).toLocaleDateString()} />
           ))}
        </div>
      </main>
    </div>
  )
}

const GuestCard = ({ name, status, date }: any) => (
  <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
     <div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>{name}</p>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-sub)' }}>{date}</p>
     </div>
     <span style={{ fontSize: '10px', fontWeight: 800, padding: '5px 12px', borderRadius: '10px', backgroundColor: status === 'Activo' ? 'rgba(39, 174, 96, 0.1)' : 'var(--icon-bg)', color: status === 'Activo' ? 'var(--success-color)' : 'var(--text-sub)' }}>{status.toUpperCase()}</span>
  </div>
)

const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '1px' }
const inputStyle = { width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', fontSize: '16px', boxSizing: 'border-box' as const, outline: 'none', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)' }
const primaryBtnStyle = { width: '100%', padding: '18px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(15,85,81,0.15)' }
