import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const HelpCenter: React.FC = () => {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const faqs = [
    { question: "¿Cómo registro un pago?", answer: "Vaya a la sección de Pagos, elija su método (Pago Móvil, Zelle o Transferencia), realice la operación y adjunte el comprobante." },
    { question: "¿Cómo autorizo a un visitante?", answer: "En el menú inferior elija Invitados, presione 'Nueva Invitación' y genere el código QR para enviar por WhatsApp." },
    { question: "¿Olvidé mi contraseña?", answer: "En la pantalla de login, use la opción 'Recuperar Cuenta' o contacte directamente a la administración del conjunto." },
    { question: "¿Qué hacer ante un reclamo?", answer: "Use la sección de Solicitudes para reportar ruidos, fallas de infraestructura o problemas de convivencia." },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-color)', fontFamily: "'Inter', sans-serif", color: 'var(--text-color)', paddingBottom: '50px' }}>
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
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '18px', marginLeft: '15px', color: 'var(--primary-color)', fontWeight: 700 }}>Centro de Ayuda</h1>
      </header>

      <main style={{ paddingTop: '84px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '600px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: 'var(--primary-color)', borderRadius: '24px', padding: '30px', color: 'white', marginBottom: '30px' }}>
           <h2 style={{ fontSize: '24px', marginBottom: '15px' }}>¿En qué podemos ayudarte?</h2>
           <div style={{ position: 'relative' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: '15px', top: '12px', color: '#6f7978' }}>search</span>
              <input
                type="text"
                placeholder="Buscar solución..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '14px 14px 14px 45px', borderRadius: '12px', border: 'none', fontSize: '15px', outline: 'none', color: '#1B1C1A' }}
              />
           </div>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '20px' }}>Preguntas Frecuentes</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
           {faqs.filter(f => f.question.toLowerCase().includes(search.toLowerCase())).map((f, i) => (
             <FAQItem key={i} question={f.question} answer={f.answer} />
           ))}
        </div>

        <div style={{ marginTop: '40px', padding: '25px', border: '1px dashed var(--border-color)', borderRadius: '20px', textAlign: 'center' }}>
           <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: '15px' }}>¿No encuentras lo que buscas?</p>
           <button style={{ backgroundColor: 'transparent', border: `1px solid var(--primary-color)`, color: 'var(--primary-color)', padding: '12px 25px', borderRadius: '12px', fontWeight: 700 }}>Contactar Soporte</button>
        </div>
      </main>
    </div>
  )
}

const FAQItem = ({ question, answer }: any) => {
  const [open, setOpen] = useState(false)
  return (
    <div onClick={() => setOpen(!open)} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '20px', cursor: 'pointer' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-color)', paddingRight: '10px' }}>{question}</span>
        <span className="material-symbols-outlined" style={{ transition: 'transform 0.3s', transform: open ? 'rotate(180deg)' : 'none' }}>expand_more</span>
      </div>
      {open && <p style={{ marginTop: '15px', fontSize: '14px', color: 'var(--text-sub)', lineHeight: '1.6' }}>{answer}</p>}
    </div>
  )
}
