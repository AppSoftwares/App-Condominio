import React, { useEffect, useRef } from 'react'
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY } from '../prof/LegalContent'
import { COOKIES_POLICY, REFUND_POLICY, DATA_DELETION_POLICY } from './legalPolicies'
import { formatLegalBody } from './LegalBody'

interface Props {
  doc: 'terms' | 'privacy' | 'cookies' | 'refunds' | 'deletion'
  onClose: () => void
}

export const LegalDocumentModal: React.FC<Props> = ({ doc, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    modalRef.current?.focus()
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  let content: any = TERMS_AND_CONDITIONS

  if (doc === 'terms') content = TERMS_AND_CONDITIONS
  else if (doc === 'privacy') content = PRIVACY_POLICY
  else if (doc === 'cookies') content = COOKIES_POLICY
  else if (doc === 'refunds') content = REFUND_POLICY
  else if (doc === 'deletion') content = DATA_DELETION_POLICY

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', outline: 'none', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
          <h2 id="modal-title" style={{ fontSize: '20px', fontFamily: "'EB Garamond', serif", margin: 0, color: 'var(--primary-color)' }}>{content.title}</h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-color)' }} aria-label="Cerrar">×</button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '8px', lineHeight: 1.6, fontSize: '14px' }}>
          <p style={{ fontStyle: 'italic', marginBottom: '20px' }}>{content.intro}</p>
          {content.sections.map((s: any, idx: number) => (
            <div key={idx} style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '8px' }}>{s.title}</h3>
              <div>{formatLegalBody(s.body)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
