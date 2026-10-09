import React from 'react'

export const FullScreenLoader: React.FC<{ label?: string }> = ({ label = 'Cargando...' }) => (
  <div role="status" aria-live="polite" style={{ minHeight: '100vh', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
    background: 'var(--bg-color)', color: 'var(--text-color)' }}>
    <span className="spinner" aria-hidden="true" />
    <span>{label}</span>
  </div>
)
