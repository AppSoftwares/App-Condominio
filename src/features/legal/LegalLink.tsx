import React, { useState } from 'react'
import { LegalDocumentModal } from './LegalDocumentModal'

export const LegalLink: React.FC<{ doc: 'terms' | 'privacy' | 'cookies' | 'refunds'; children: React.ReactNode }> = ({ doc, children }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ background: 'none', border: 'none', color: 'var(--primary-color)', textDecoration: 'underline', cursor: 'pointer', padding: 0, font: 'inherit' }}
      >
        {children}
      </button>
      {open && <LegalDocumentModal doc={doc} onClose={() => setOpen(false)} />}
    </>
  )
}
