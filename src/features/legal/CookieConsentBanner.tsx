import React, { useState } from 'react'
import { useConsentStore, needsConsentDecision } from './useConsentStore'
import { ConsentPreferences } from './ConsentPreferences'
import { LegalLink } from './LegalLink'

export const CookieConsentBanner: React.FC = () => {
  const needs = useConsentStore(needsConsentDecision)
  const { acceptAll, rejectOptional } = useConsentStore()
  const [open, setOpen] = useState(false)

  if (!needs && !open) return null

  const btnStyle: React.CSSProperties = {
    minHeight: 44,
    padding: '10px 16px',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  }

  return (
    <>
      {needs && !open && (
        <section
          role="region"
          aria-label="Preferencias de privacidad"
          style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 1000,
            padding: '16px 16px calc(16px + env(safe-area-inset-bottom))',
            backgroundColor: 'var(--card-bg)', color: 'var(--text-color)',
            borderTop: '1px solid var(--control-border, var(--border-color))',
            boxShadow: '0 -8px 24px rgba(0,0,0,.12)'
          }}
        >
          <h2 style={{ fontSize: 16, margin: '0 0 6px', fontWeight: 700 }}>Tu privacidad</h2>
          <p style={{ fontSize: 14, lineHeight: 1.5, margin: '0 0 12px' }}>
            Usamos almacenamiento técnico necesario para que la app funcione. Con tu permiso también enviamos informes de errores anónimos para mejorarla. Puedes cambiarlo cuando quieras en Perfil &gt; Privacidad. Más información en la{' '}
            <LegalLink doc="cookies">Política de Cookies</LegalLink>.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={rejectOptional}
              style={{ ...btnStyle, backgroundColor: 'transparent', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}
            >
              Rechazar opcionales
            </button>
            <button
              type="button"
              onClick={acceptAll}
              style={{ ...btnStyle, backgroundColor: 'var(--primary-color)', color: 'white', border: 'none' }}
            >
              Aceptar todo
            </button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              style={{ ...btnStyle, backgroundColor: 'transparent', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}
            >
              Configurar
            </button>
          </div>
        </section>
      )}
      {open && <ConsentPreferences onClose={() => setOpen(false)} />}
    </>
  )
}
