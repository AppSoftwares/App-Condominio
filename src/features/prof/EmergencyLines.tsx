import React from 'react'
import { MdOutlinePhone, MdOutlineChat } from 'react-icons/md'

export const EmergencyLines: React.FC = () => {
  const handleCall = (number: string, label: string) => {
    const confirmCall = window.confirm(`¿Desea realizar una llamada de emergencia a: ${label}?`)
    if (confirmCall) {
      window.location.href = `tel:${number.replace(/-/g, '')}`
    }
  }

  const handleWhatsApp = (number: string) => {
    const cleanNumber = number.replace(/[^0-9]/g, '')
    window.open(`https://wa.me/${cleanNumber}`, '_blank')
  }

  const emergencyContacts = [
    { label: 'Línea de Emergencia Central', number: '911', icon: 'emergency', primary: true },
    { label: 'Bomberos de Maracaibo (Llamadas)', number: '0414-1479760', icon: 'fire_truck' },
    { label: 'Bomberos y Atención Ciudadana (WhatsApp)', number: '0414-5039488', icon: 'chat', type: 'whatsapp' },
    { label: 'Polimaracaibo', number: '0412-3533150', icon: 'local_police' },
    { label: 'Protección Civil', number: '0414-1479763', icon: 'medical_services' },
    { label: 'Dir. Gral. de Seguridad Ciudadana', number: '0414-1479755', icon: 'security' },
    { label: 'Centro de Op. de Emergencia (COE)', number: '0414-6290386', icon: 'hub' },
    { label: 'Cuadrante Paz (109) La Lagunita', number: '911', icon: 'shield', subtitle: 'Pendiente confirmar número directo' },
  ]

  return (
    <div style={{ padding: '20px', paddingBottom: '100px', backgroundColor: 'var(--bg-color)', minHeight: '100vh' }}>
      <main style={{ maxWidth: '500px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '32px', color: 'var(--primary-color)', margin: '0 0 10px 0' }}>Líneas de Atención</h2>
          <p style={{ color: 'var(--text-sub)', fontSize: '15px' }}>Asistencia inmediata y cuerpos de seguridad</p>
        </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {emergencyContacts.map((contact, index) => (
          <div
            key={index}
            onClick={() => contact.type === 'whatsapp' ? handleWhatsApp(contact.number) : handleCall(contact.number, contact.label)}
            style={{
              ...cardStyle,
              border: contact.primary ? '2px solid #ba1a1a' : '1px solid var(--border-color)',
              backgroundColor: contact.primary ? 'rgba(186, 26, 26, 0.02)' : 'var(--card-bg)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{
                ...iconBoxStyle,
                backgroundColor: contact.primary ? 'rgba(186, 26, 26, 0.1)' : 'var(--icon-bg)',
                color: contact.primary ? '#ba1a1a' : 'var(--primary-color)'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{contact.icon}</span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: contact.primary ? '#ba1a1a' : 'inherit' }}>{contact.label}</p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--primary-color)', letterSpacing: '1px' }}>{contact.number}</p>
                {contact.subtitle && <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--text-sub)', fontStyle: 'italic' }}>{contact.subtitle}</p>}
              </div>
              {contact.type === 'whatsapp' ? (
                <MdOutlineChat size={24} style={{ color: '#25D366' }} />
              ) : (
                <MdOutlinePhone size={24} style={{ color: contact.primary ? '#ba1a1a' : 'var(--text-sub)' }} />
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: 'rgba(198, 160, 89, 0.1)', borderRadius: '20px', border: '1px dashed var(--accent-gold)' }}>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-sub)', textAlign: 'center', fontWeight: 600 }}>
          En caso de emergencia vital, siempre priorice llamar al 911.
        </p>
      </div>
      </main>
    </div>
  )
}

const cardStyle = {
  padding: '20px',
  borderRadius: '24px',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
}

const iconBoxStyle = {
  width: '56px',
  height: '56px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}
