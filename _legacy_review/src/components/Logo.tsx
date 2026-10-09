import React from 'react'
import logoImage from '../assets/logo_premium.png'

interface LogoProps {
  height?: number | string
  className?: string
  style?: React.CSSProperties
}

export const Logo: React.FC<LogoProps> = ({ height = 60, style }) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', height, ...style }}>
      <img
        src={logoImage}
        alt="Caminos de la Lagunita Logo"
        style={{ height: '100%', width: 'auto', objectFit: 'contain' }}
      />
    </div>
  )
}
