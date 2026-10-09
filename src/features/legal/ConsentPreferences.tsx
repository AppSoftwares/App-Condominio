import React, { useState, useEffect, useRef } from 'react'
import { useConsentStore } from './useConsentStore'

interface Props {
  onClose: () => void
}

export const ConsentPreferences: React.FC<Props> = ({ onClose }) => {
  const store = useConsentStore()
  const [diagnostics, setDiagnostics] = useState(store.diagnostics)
  const titleRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    titleRef.current?.focus()
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleSave = () => {
    store.save({ diagnostics })
    onClose()
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cp-title"
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderRadius: '24px', width: '100%', maxWidth: '500px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
      >
        <h2 ref={titleRef} tabIndex={-1} id="cp-title" style={{ fontSize: '20px', fontFamily: "'EB Garamond', serif", margin: '0 0 16px 0', color: 'var(--primary-color)' }}>
          Preferencias de Privacidad
        </h2>
        <p style={{ fontSize: '14px', lineHeight: 1.5, marginBottom: '20px', color: 'var(--text-sub)' }}>
          Gestiona tus permisos de almacenamiento y diagnóstico en la aplicación.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--icon-bg)', borderRadius: '12px' }}>
            <div>
              <p style={{ fontWeight: 700, margin: '0 0 4px 0', fontSize: '14px' }}>Estrictamente necesarias</p>
              <p style={{ fontSize: '12px', color: 'var(--text-sub)', margin: 0 }}>Autenticación, sesión y almacenamiento técnico esencial.</p>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-color)' }}>Siempre activas</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--icon-bg)', borderRadius: '12px' }}>
            <div>
              <label htmlFor="diag-switch" style={{ fontWeight: 700, margin: '0 0 4px 0', fontSize: '14px', cursor: 'pointer', display: 'block' }}>Diagnóstico y rendimiento (Sentry)</label>
              <p style={{ fontSize: '12px', color: 'var(--text-sub)', margin: 0 }}>Informes de errores anónimos para mejorar la estabilidad.</p>
            </div>
            <input
              id="diag-switch"
              type="checkbox"
              role="switch"
              checked={diagnostics}
              onChange={e => setDiagnostics(e.target.checked)}
              style={{ width: 24, height: 24, accentColor: 'var(--primary-color)', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, padding: '14px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', color: 'var(--text-color)' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{ flex: 1, padding: '14px', background: 'var(--primary-color)', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', color: 'white' }}
          >
            Guardar preferencias
          </button>
        </div>
      </div>
    </div>
  )
}
