import React from 'react'

interface Props {
  id: string
  checked: boolean
  onChange: (v: boolean) => void
  required?: boolean
  error?: string | null
  disabled?: boolean
  children: React.ReactNode
}

export const ConsentCheckbox: React.FC<Props> = ({ id, checked, onChange, required, error, disabled, children }) => (
  <div style={{ marginBottom: 12 }}>
    <label htmlFor={id} style={{ display:'flex', gap:12, alignItems:'flex-start', minHeight:44, cursor:'pointer' }}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        style={{ width:24, height:24, flexShrink:0, marginTop:2, accentColor:'var(--primary-color)' }}
      />
      <span style={{ fontSize:14, lineHeight:1.5, color: 'var(--text-color)' }}>{children}{required && <span aria-hidden="true" style={{ color: '#ba1a1a' }}> *</span>}</span>
    </label>
    {error && <p id={`${id}-err`} role="alert" style={{ color:'#ba1a1a', fontSize:13, margin:'4px 0 0 36px' }}>{error}</p>}
  </div>
)
