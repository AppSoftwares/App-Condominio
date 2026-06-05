import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const HelpCenter: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const faqs = [
    {
      q: "¿Cómo registro un pago?",
      a: "Ve a la sección 'Pagos' desde tu Dashboard, selecciona el método de pago preferido e ingresa los datos del comprobante. La administración validará tu pago en breve."
    },
    {
      q: "¿Cómo autorizo a un visitante?",
      a: "En el Dashboard, pulsa 'Invitados'. Ingresa el nombre y cédula de tu visita y genera el Pase QR que podrá escanear el vigilante."
    },
    {
      q: "¿Qué hago si mi casa ya está registrada?",
      a: "Si ves un aviso de casa duplicada, contacta a administración para validar tu identidad y recuperar el acceso a tu vivienda."
    },
    {
      q: "¿Cómo funcionan las reservas?",
      a: "Pulsa 'Reservas', selecciona el área (Bohío o Cancha), elige un día disponible y confirma tu turno. Recibirás una notificación de confirmación."
    }
  ]

  const filteredFaqs = faqs.filter(f => f.q.toLowerCase().includes(search.toLowerCase()))

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', fontFamily: "'Inter', sans-serif", color: '#1B1C1A', paddingBottom: '40px' }}>
      <header style={{
        position: 'fixed', top: 0, width: '100%', height: '64px', backgroundColor: '#FAF8F5',
        borderBottom: '1px solid #bfc8c7', display: 'flex', alignItems: 'center', padding: '0 20px',
        zIndex: 100, boxSizing: 'border-box'
      }}>
        <button
          onClick={() => navigate('/profile/support')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#1B1C1A' }}>arrow_back</span>
        </button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '18px', marginLeft: '15px', color: '#0f5551', fontWeight: 700, textTransform: 'uppercase' }}>Centro de Ayuda</h1>
      </header>

      <main style={{ paddingTop: '84px', maxWidth: '600px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

        {/* Search Bar - Contained within padding */}
        <div style={{ padding: '0 20px', marginBottom: '32px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            border: '1px solid #bfc8c7',
            display: 'flex',
            alignItems: 'center',
            padding: '4px 16px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
          }}>
            <span className="material-symbols-outlined" style={{ color: '#6f7978', marginRight: '12px' }}>search</span>
            <input
              type="text"
              placeholder="Buscar pregunta o tutorial..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '12px 0', border: 'none', outline: 'none', fontSize: '16px', backgroundColor: 'transparent' }}
            />
          </div>
        </div>

        {/* Tutorials Section - Full width scrollable */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#785919', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px', padding: '0 20px' }}>Tutoriales Paso a Paso</h3>
          <div style={{
            display: 'flex',
            gap: '15px',
            overflowX: 'auto',
            padding: '0 20px 20px 20px',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch'
          }} className="no-scrollbar">
             <TutorialBox title="Mi Primer Pago" icon="payments" color="#d3e8d0" />
             <TutorialBox title="Guía de Invitados" icon="vpn_key" color="#b0eee9" />
             <TutorialBox title="Reglas de Áreas" icon="park" color="#ffdea6" />
             {/* Extra spacer to prevent cutting off last item */}
             <div style={{ minWidth: '5px', flexShrink: 0 }}></div>
          </div>
        </div>

        {/* FAQs Section - Contained within padding */}
        <div style={{ padding: '0 20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#785919', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '20px' }}>Consultas Frecuentes</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
             {filteredFaqs.map((faq, i) => (
               <FaqAccordion key={i} question={faq.q} answer={faq.a} />
             ))}
          </div>
        </div>

        {/* Contact Footer - Contained within padding */}
        <div style={{ padding: '0 20px', marginTop: '50px' }}>
          <div style={{ padding: '30px', backgroundColor: '#2f6d69', borderRadius: '24px', color: 'white', textAlign: 'center', boxShadow: '0 10px 30px rgba(47,109,105,0.2)' }}>
             <h4 style={{ margin: '0 0 10px 0', fontSize: '20px', fontWeight: 700 }}>¿Aún tienes dudas?</h4>
             <p style={{ margin: '0 0 25px 0', fontSize: '14px', opacity: 0.9 }}>Estamos disponibles para ayudarte personalmente.</p>
             <button
              onClick={() => navigate('/profile/support')}
              style={{
                width: '100%',
                padding: '16px',
                backgroundColor: 'white',
                color: '#2f6d69',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                textTransform: 'uppercase'
              }}
             >Hablar con Soporte</button>
          </div>
        </div>
      </main>
    </div>
  )
}

const TutorialBox = ({ title, icon, color }: any) => (
  <div style={{
    minWidth: '160px',
    backgroundColor: 'white',
    border: '1px solid #bfc8c7',
    borderRadius: '20px',
    padding: '24px 15px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
    flexShrink: 0,
    scrollSnapAlign: 'start'
  }}>
    <div style={{
      width: '56px',
      height: '56px',
      borderRadius: '16px',
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 16px'
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#1B1C1A' }}>{icon}</span>
    </div>
    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1B1C1A', display: 'block', lineHeight: '1.3' }}>{title}</span>
  </div>
)

const FaqAccordion = ({ question, answer }: any) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #bfc8c7',
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
      >
        <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f5551', pr: '10px' }}>{question}</span>
        <span className="material-symbols-outlined" style={{
          color: '#bfc8c7',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
          transition: 'transform 0.3s'
        }}>expand_more</span>
      </div>
      {isOpen && (
        <div style={{
          padding: '0 20px 20px',
          fontSize: '14px',
          color: '#3f4947',
          lineHeight: '1.6',
          borderTop: '1px solid #f5f3f0',
          paddingTop: '15px',
          animation: 'fadeIn 0.3s ease-in'
        }}>
          {answer}
        </div>
      )}
    </div>
  )
}
