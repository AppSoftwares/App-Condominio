import React from 'react'
import { LEGAL_ENTITY } from '../../config/legalEntity'

export const LegalEntityBlock: React.FC = () => (
  <div style={{ padding: '16px', fontSize: '11px', color: 'var(--text-sub)', textAlign: 'center', borderTop: '1px solid var(--border-color)', marginTop: '20px', width: '100%', boxSizing: 'border-box' }}>
    <p style={{ margin: '0 0 4px 0', fontWeight: 700 }}>{LEGAL_ENTITY.tradeName} — {LEGAL_ENTITY.legalName}</p>
    <p style={{ margin: '0 0 4px 0' }}>RIF: {LEGAL_ENTITY.taxId} • {LEGAL_ENTITY.address}</p>
    <p style={{ margin: 0 }}>Contacto: {LEGAL_ENTITY.contactEmail}</p>
  </div>
)
