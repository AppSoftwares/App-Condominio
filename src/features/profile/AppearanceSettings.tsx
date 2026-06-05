import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const AppearanceSettings: React.FC = () => {
  const navigate = useNavigate()
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', fontFamily: "'Inter', sans-serif", color: '#1B1C1A', paddingBottom: '50px' }}>
      <header style={{
        position: 'fixed', top: 0, width: '100%', height: '64px', backgroundColor: '#FAF8F5',
        borderBottom: '1px solid #bfc8c7', display: 'flex', alignItems: 'center', padding: '0 20px',
        zIndex: 100, boxSizing: 'border-box'
      }}>
        <button
          onClick={() => navigate('/profile')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px', color: '#1B1C1A' }}>arrow_back</span>
        </button>
        <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: '18px', marginLeft: '15px', color: '#0f5551', fontWeight: 700, textTransform: 'uppercase' }}>Apariencia</h1>
      </header>

      <main style={{ paddingTop: '84px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '500px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        <p style={{ color: '#3f4947', fontSize: '14px', marginBottom: '30px', textAlign: 'center' }}>Personaliza el estilo visual de tu aplicación.</p>

        {/* Main Card with Toggle */}
        <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '20px', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#f5f3f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined" style={{ color: '#0f5551' }}>{isDarkMode ? 'dark_mode' : 'light_mode'}</span>
              </div>
              <div>
                <span style={{ fontWeight: 700, fontSize: '16px', color: '#1B1C1A', display: 'block' }}>Modo Oscuro</span>
                <span style={{ fontSize: '12px', color: '#6f7978' }}>Cambiar tema global</span>
              </div>
            </div>

            <div
              onClick={toggleTheme}
              style={{
                width: '60px', height: '34px', backgroundColor: isDarkMode ? '#2f6d69' : '#bfc8c7',
                borderRadius: '17px', position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '26px', height: '26px', backgroundColor: 'white', borderRadius: '50%',
                position: 'absolute', top: '4px', left: isDarkMode ? '30px' : '4px',
                transition: 'left 0.3s ease', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }} />
            </div>
          </div>

          {/* Mini Views Inside the Card for better visibility */}
          <div style={{ borderTop: '1px solid #efeeeb', paddingTop: '30px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f5551', marginBottom: '20px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Vista Previa</h3>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'nowrap' }}>
               <ThemePreview
                active={!isDarkMode}
                label="MODO CLARO"
                theme={{ bg: '#FAF8F5', head: '#FFF', prim: '#0F5551', card: '#FFF', text: '#1B1C1A' }}
               />
               <ThemePreview
                active={isDarkMode}
                label="MODO OSCURO"
                theme={{ bg: '#1B1C1A', head: '#30312F', prim: '#94D2CD', card: '#30312F', text: '#F2F0ED' }}
               />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const ThemePreview = ({ active, label, theme }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '140px' }}>
    {/* Mini Mobile Frame */}
    <div style={{
      width: '100%',
      height: '180px',
      backgroundColor: theme.bg,
      borderRadius: '20px',
      border: active ? '3px solid #C6A059' : '1px solid #efeeeb',
      boxShadow: active ? '0 8px 25px rgba(198,160,89,0.2)' : '0 4px 10px rgba(0,0,0,0.05)',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease',
      transform: active ? 'scale(1.05)' : 'scale(1)'
    }}>
      {/* Mini App Bar */}
      <div style={{ height: '20px', backgroundColor: theme.head, display: 'flex', alignItems: 'center', padding: '0 10px', borderBottom: `1px solid ${theme.prim}15` }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: theme.prim }}></div>
        <div style={{ flex: 1, height: '3px', backgroundColor: theme.prim, marginLeft: '5px', opacity: 0.2, borderRadius: '2px' }}></div>
      </div>
      {/* Mini Content */}
      <div style={{ padding: '10px', flex: 1 }}>
        <div style={{ width: '100%', height: '45px', backgroundColor: theme.card, borderRadius: '8px', border: `1px solid ${theme.prim}20`, padding: '6px', boxSizing: 'border-box' }}>
           <div style={{ width: '60%', height: '3px', backgroundColor: theme.text, opacity: 0.3, borderRadius: '2px', marginBottom: '3px' }}></div>
           <div style={{ width: '40%', height: '10px', backgroundColor: theme.prim, borderRadius: '2px' }}></div>
        </div>
        <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
           <div style={{ flex: 1, height: '30px', backgroundColor: theme.prim, opacity: 0.1, borderRadius: '6px' }}></div>
           <div style={{ flex: 1, height: '30px', backgroundColor: theme.prim, opacity: 0.1, borderRadius: '6px' }}></div>
        </div>
      </div>
      {/* Mini Bottom Nav */}
      <div style={{ height: '25px', backgroundColor: theme.head, borderTop: `1px solid ${theme.prim}15`, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: theme.prim, opacity: 0.4 }}></div>
        <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#C6A059' }}></div>
        <div style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: theme.prim, opacity: 0.4 }}></div>
      </div>
    </div>
    <span style={{ fontSize: '10px', fontWeight: 800, color: active ? '#0f5551' : '#6f7978', marginTop: '12px', letterSpacing: '0.5px' }}>{label}</span>
  </div>
)
