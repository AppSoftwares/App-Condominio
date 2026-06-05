import React from 'react'
import { useNavigate } from 'react-router-dom'

export const InviteFriend: React.FC = () => {
  const navigate = useNavigate()

  const shareMessage = "¡Hola! Te invito a unirte a Caminos de la Lagunita, la aplicación exclusiva para nuestra comunidad. Gestiona tus pagos, reservas y reportes de forma segura. Descárgala aquí: https://caminoslagunita.app/download"
  const encodedMessage = encodeURIComponent(shareMessage)

  const shareOptions = [
    { name: 'WhatsApp', icon: 'chat', color: '#25D366', url: `https://wa.me/?text=${encodedMessage}` },
    { name: 'Telegram', icon: 'send', color: '#0088cc', url: `https://t.me/share/url?url=https://caminoslagunita.app/download&text=${encodedMessage}` },
    { name: 'Instagram', icon: 'camera_alt', color: '#E1306C', url: `https://www.instagram.com/` }, // Instagram usually requires native SDK for direct story/DM sharing, linking to app for now
    { name: 'Mensaje (MMS)', icon: 'sms', color: '#007AFF', url: `sms:?&body=${encodedMessage}` }
  ]

  const handleShare = (url: string) => {
    window.open(url, '_blank')
  }

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
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '18px', marginLeft: '15px', color: '#0f5551', fontWeight: 700, textTransform: 'uppercase' }}>Invitar Amigo</h1>
      </header>

      <main style={{ paddingTop: '84px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ margin: '30px 0' }}>
           <div style={{ width: '80px', height: '80px', backgroundColor: '#FFDEA6', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#785919' }}>favorite</span>
           </div>
           <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#0f5551', margin: '0 0 10px 0' }}>Comparte la Experiencia</h2>
           <p style={{ color: '#3f4947', fontSize: '14px', lineHeight: '1.6', margin: '0 auto', maxWidth: '300px' }}>
             Ayuda a tus vecinos a unirse a la plataforma oficial de <strong>Caminos de la Lagunita</strong>.
           </p>
        </div>

        {/* Share Card */}
        <section style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 800, color: '#785919', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '24px', borderBottom: '1px solid #efeeeb', paddingBottom: '100' }}>Canales de Envío</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
             {shareOptions.map((opt) => (
               <button
                key={opt.name}
                onClick={() => handleShare(opt.url)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '20px',
                  backgroundColor: '#f5f3f0',
                  border: '1px solid #efeeeb',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
               >
                 <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: opt.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{opt.icon}</span>
                 </div>
                 <span style={{ fontSize: '12px', fontWeight: 700, color: '#1B1C1A' }}>{opt.name}</span>
               </button>
             ))}
          </div>
        </section>

        {/* Message Preview */}
        <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'rgba(15,85,81,0.05)', borderRadius: '12px', textAlign: 'left' }}>
           <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 800, color: '#0f5551', textTransform: 'uppercase' }}>Mensaje a enviar:</p>
           <p style={{ margin: 0, fontSize: '13px', color: '#0f5551', fontStyle: 'italic', lineHeight: '1.4' }}>
             "{shareMessage}"
           </p>
        </div>
      </main>
    </div>
  )
}
