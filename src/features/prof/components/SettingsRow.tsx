import React from 'react'
import { IconType } from 'react-icons'
import { MdOutlineChevronRight } from 'react-icons/md'

interface SettingsRowProps {
  icon: IconType
  label: string
  description?: string
  onClick: () => void
  danger?: boolean
  last?: boolean
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon: Icon,
  label,
  description,
  onClick,
  danger = false,
  last = false,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      style={{
        width: '100%',
        minHeight: '56px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
        border: 'none',
        borderBottom: last ? 'none' : '1px solid var(--border-color)',
        cursor: 'pointer',
        textAlign: 'left',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            backgroundColor: danger ? 'rgba(186,26,26,0.1)' : 'var(--icon-bg)',
            color: danger ? '#ba1a1a' : 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={22} />
        </div>
        <div>
          <span
            style={{
              fontWeight: 600,
              fontSize: '15px',
              color: danger ? '#ba1a1a' : 'var(--text-color)',
              display: 'block',
            }}
          >
            {label}
          </span>
          {description && (
            <span
              style={{
                fontSize: '13px',
                color: 'var(--text-sub)',
                display: 'block',
                marginTop: '2px',
              }}
            >
              {description}
            </span>
          )}
        </div>
      </div>
      <MdOutlineChevronRight size={20} style={{ color: 'var(--text-sub)', flexShrink: 0 }} />
    </button>
  )
}
