import React, { useState, useRef, useEffect } from 'react'
import { AnnouncementDTO } from '../../../shared/api/announcementsApi'
import { MdOutlineEventNote, MdExpandMore, MdExpandLess, MdOpenInNew } from 'react-icons/md'

interface AnnouncementCardProps {
  announcement: AnnouncementDTO
  isHighlighted?: boolean
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, isHighlighted }) => {
  const [expanded, setExpanded] = useState(isHighlighted)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isHighlighted && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isHighlighted])

  const typeConfig: Record<string, { label: string, bg: string, color: string, icon: string }> = {
    asamblea: { label: 'Asamblea', bg: 'rgba(15,85,81,0.1)', color: 'var(--primary-color)', icon: '🏛️' },
    urgente: { label: 'Urgente', bg: 'rgba(186,26,26,0.1)', color: '#ba1a1a', icon: '🚨' },
    mantenimiento: { label: 'Mantenimiento', bg: 'rgba(120,89,25,0.1)', color: '#785919', icon: '🔧' },
    finanzas: { label: 'Finanzas', bg: 'rgba(16,185,129,0.1)', color: '#059669', icon: '💳' },
    general: { label: 'General', bg: 'var(--icon-bg)', color: 'var(--text-sub)', icon: '📢' }
  }

  const config = typeConfig[announcement.tipo || 'general'] || typeConfig.general

  // Safe link parsing without dangerouslySetInnerHTML
  const renderSafeMessage = (text: string) => {
    if (!text) return null
    // Regex to match URLs and mailto
    const urlRegex = /(https?:\/\/[^\s]+|mailto:[^\s]+)/g
    const parts = text.split(urlRegex)

    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--primary-color)', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
          >
            {part} <MdOpenInNew size={14} />
          </a>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  const isLongMessage = (announcement.mensaje || '').length > 250 || (announcement.mensaje || '').split('\n').length > 6

  return (
    <div
      ref={cardRef}
      style={{
        backgroundColor: 'var(--card-bg)',
        border: isHighlighted ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
        borderRadius: '20px',
        padding: '20px',
        boxShadow: isHighlighted ? '0 0 20px rgba(15,85,81,0.2)' : '0 4px 15px rgba(0,0,0,0.03)',
        transition: 'all 0.3s ease',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '40px', height: '40px', backgroundColor: config.bg, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
            {config.icon}
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, padding: '4px 10px', backgroundColor: config.bg, color: config.color, borderRadius: '8px', textTransform: 'uppercase' }}>
              {config.label}
            </span>
            <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--text-sub)' }}>
              {new Date(announcement.fecha_creacion).toLocaleDateString('es-VE', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        {announcement.residential_cluster && (
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-sub)', backgroundColor: 'var(--icon-bg)', padding: '4px 8px', borderRadius: '6px' }}>
            {announcement.residential_cluster}
          </span>
        )}
      </div>

      <h4 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 10px', color: 'var(--text-color)' }}>
        {announcement.titulo}
      </h4>

      <div style={{
        fontSize: '14px',
        lineHeight: '1.6',
        color: 'var(--text-color)',
        whiteSpace: 'pre-wrap',
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: expanded ? 'unset' : 6,
        WebkitBoxOrient: 'vertical'
      }}>
        {renderSafeMessage(announcement.mensaje)}
      </div>

      {isLongMessage && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--primary-color)',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '10px',
            padding: 0
          }}
        >
          {expanded ? <>Ver menos <MdExpandLess size={18} /></> : <>Ver más <MdExpandMore size={18} /></>}
        </button>
      )}
    </div>
  )
}
