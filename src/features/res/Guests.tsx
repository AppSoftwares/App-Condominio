import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdArrowBack } from 'react-icons/md'
import html2canvas from 'html2canvas'

export const Guests: React.FC = () => {
  const navigate = useNavigate()
  const [guestName, setGuestName] = useState('')
  const [showQR, setShowQR] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const handleGenerateQR = () => {
    if (!guestName) return alert('Por favor ingrese el nombre del invitado')
    setShowQR(true)
  }

  const handleShareWA = async () => {
    const msg = `Hola ${guestName}, aquí tienes tu pase QR de acceso para Caminos de la Lagunita.`;

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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', fontFamily: "'Inter', sans-serif", color: 'var(--text-color)', paddingBottom: '100px' }}>
      <header style={{ position: 'fixed', top: 0, width: '100%', height: '74px', backgroundColor: 'var(--header-bg)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 20px', zIndex: 100, boxSizing: 'border-box' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <MdArrowBack size={24} style={{ color: 'var(--primary-color)' }} />
        </button>
        <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '20px', marginLeft: '15px', color: 'var(--primary-color)', fontWeight: 700 }}>Acceso de Invitados</h1>
      </header>

      <main style={{ paddingTop: '100px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '500px', margin: '0 auto' }}>
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '28px', padding: '32px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.03)' }}>
           <h3 style={{ fontSize: '13px', color: 'var(--accent-gold)', marginBottom: '24px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center' }}>Autorizar Nuevo Invitado</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                 <label style={labelStyle}>Nombre del Invitado</label>
                 <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Nombre completo" style={inputStyle} />
              </div>
              <div>
                 <label style={labelStyle}>Documento ID</label>
                 <input placeholder="Cédula o Pasaporte" style={inputStyle} />
              </div>
              <button onClick={handleGenerateQR} style={primaryBtnStyle}>Generar Pase QR</button>
           </div>
        </div>

        {showQR && (
          <div style={{ marginBottom: '30px', animation: 'fadeIn 0.5s ease' }}>
            <div ref={qrRef} style={{ backgroundColor: '#ffffff', border: '1px solid var(--border-color)', borderRadius: '28px', padding: '32px', textAlign: 'center' }}>
              <p style={{ color: '#27ae60', fontWeight: 800, fontSize: '12px', marginBottom: '20px' }}>PASE DE ACCESO DIGITAL</p>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '20px', display: 'inline-block', marginBottom: '20px', border: '1px solid #efeeeb' }}>
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=GUEST-${guestName.replace(' ', '-')}`} alt="QR Code" style={{ width: '180px', height: '180px' }} />
              </div>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '20px', color: 'var(--primary-color)', fontWeight: 700 }}>{guestName.toUpperCase()}</h4>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-sub)', fontWeight: 600 }}>CAMINOS DE LA LAGUNITA</p>
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
           <GuestCard name="Maria Garcia" status="Activo" date="Hoy, 2:00 PM" />
           <GuestCard name="Ricardo Mendoza" status="Finalizado" date="Ayer, 10:00 AM" />
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
