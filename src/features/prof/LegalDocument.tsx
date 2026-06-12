import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export const LegalDocument: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type') || 'privacy' // 'privacy' or 'terms'

  const content = {
    privacy: {
      title: 'Política de Privacidad',
      sections: [
        {
          h: '1. Información que Recopilamos',
          p: 'Recopilamos datos de perfil (nombre, cédula, correo), información residencial (etapa, conjunto, casa), registros de acceso de invitados y comprobantes de pago adjuntos por el usuario.'
        },
        {
          h: '2. Uso de la Información',
          p: 'Sus datos se utilizan exclusivamente para la gestión administrativa del condominio, la seguridad en garita (vía pases QR) y la facilitación de pagos y reservas de áreas comunes.'
        },
        {
          h: '3. Protección de Datos',
          p: 'Implementamos encriptación de nivel bancario y Seguridad a Nivel de Fila (RLS) para asegurar que ningún usuario pueda ver la información privada de otro vecino.'
        },
        {
          h: '4. Sus Derechos',
          p: 'Usted puede acceder, rectificar o solicitar la eliminación de sus datos en cualquier momento desde la sección de Ajustes o contactando a la administración.'
        }
      ]
    },
    terms: {
      title: 'Términos y Condiciones',
      sections: [
        {
          h: '1. Responsabilidad del Usuario',
          p: 'El usuario se compromete a proporcionar información veraz y a no compartir sus credenciales de acceso con terceros.'
        },
        {
          h: '2. Uso del Sistema de Pagos',
          p: 'Los pagos registrados a través de la app (Pago Móvil, Zelle o Venflow) están sujetos a validación administrativa en un plazo de 24 a 48 horas hábiles.'
        },
        {
          h: '3. Normas de Convivencia',
          p: 'El uso de la aplicación implica la aceptación del manual de convivencia del condominio, incluyendo el respeto a los horarios de ruidos y áreas comunes.'
        },
        {
          h: '4. Seguridad y QR',
          p: 'La generación de pases QR para invitados es responsabilidad del residente. Cualquier mal uso del acceso por parte de un invitado recaerá sobre el propietario autorizante.'
        }
      ]
    }
  }

  const activeDoc = type === 'terms' ? content.terms : content.privacy

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', fontFamily: "'Inter', sans-serif", color: '#1B1C1A', paddingBottom: '40px' }}>
      <header style={{
        position: 'fixed', top: 0, width: '100%', height: '64px', backgroundColor: '#FAF8F5',
        borderBottom: '1px solid #bfc8c7', display: 'flex', alignItems: 'center', padding: '0 20px',
        zIndex: 100, boxSizing: 'border-box'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#1B1C1A' }}>arrow_back</span>
        </button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '18px', marginLeft: '15px', color: '#0f5551', fontWeight: 700, textTransform: 'uppercase' }}>{activeDoc.title}</h1>
      </header>

      <main style={{ paddingTop: '84px', paddingLeft: '24px', paddingRight: '24px', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '24px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
             <div style={{ width: '64px', height: '64px', backgroundColor: '#d3e8d0', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#0e1f10' }}>{type === 'terms' ? 'assignment' : 'verified_user'}</span>
             </div>
             <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f5551', margin: 0 }}>Caminos de la Lagunita</h2>
             <p style={{ fontSize: '12px', color: '#6f7978', marginTop: '5px' }}>Última actualización: Junio 2026</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {activeDoc.sections.map((sec, i) => (
              <div key={i}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#1B1C1A', marginBottom: '10px' }}>{sec.h}</h3>
                <p style={{ fontSize: '14px', color: '#3f4947', lineHeight: '1.6', margin: 0 }}>{sec.p}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #efeeeb', textAlign: 'center' }}>
            <button
              onClick={() => navigate(-1)}
              style={{ width: '100%', padding: '16px', backgroundColor: '#2f6d69', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
            >
              He leído y acepto
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
