import React from 'react'
import { useNavigate } from 'react-router-dom'

export const Splash: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#2F6D69',
      backgroundImage: `linear-gradient(rgba(47, 109, 105, 0.9), rgba(47, 109, 105, 0.9)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBcbvZDDo0T_0wDyT_PYJVGqDNBAxtIjBv3bSGWh6KNk9DSCLk_AKpN4FRiFbvq1bPZsgDk3D47671D39xbXII1TlEwqdq8EFpoMSDawb9yFTSDfnFNAO-XIpU_bwLHfIKmN8t-GaILN6SOhDYG9jlk-h6MwgnZ-8OtBcVrNs2T-THiJqffrqRTV0IVIIbVYK7F7ptnVXarj-GvBf0ksJDk5v5--SYsMx8W_xusghrDluU7FelQzuyubB9KtRwW7UbOxN-lyaGuAf4')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Architectural Pattern Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 1
      }}></div>

      {/* Decorative Corner Elements */}
      <div style={{ position: 'absolute', top: '32px', left: '32px', width: '64px', height: '64px', borderTop: '1px solid rgba(255,255,255,0.2)', borderLeft: '1px solid rgba(255,255,255,0.2)', zIndex: 2 }}></div>
      <div style={{ position: 'absolute', top: '32px', right: '32px', width: '64px', height: '64px', borderTop: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', zIndex: 2 }}></div>

      <main style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '512px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '80px 24px',
        boxSizing: 'border-box'
      }}>

        {/* Header Branding */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px' }}>
          <div style={{ width: '128px', height: '128px', animation: 'float 4s ease-in-out infinite' }}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8QsGNY_Q0aq1KaT-hJeFsbP4mRDomcQ19BW-zuVYjVkb6eac8rVaAJgrbgjV1BCYpVyyKjJzoH36qm0d4H3skuvIPSjKU5t8GcKDMNLDBaIiEY-nz8q-UMjry88UdO-r6NhCoKBvnDpbOXysRkWPuX072rdgZwm1sgyeex05EJtuPr4wI-Cejn53p67SD85te5omuI7vj63weNdKASAD4HFzTcNmAJCZR7hQgo_zpVH-Iz6m5J7eZu9yHN3BzObk0cTxuqgPVS-Y"
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontFamily: "'Cinzel', serif",
              color: 'white',
              letterSpacing: '0.3em',
              fontSize: '28px',
              fontWeight: 700,
              lineHeight: 1.2,
              margin: 0,
              textTransform: 'uppercase'
            }}>
              CAMINO DE LA<br/>LAGUNITA
            </h1>
            <div style={{ height: '1px', width: '96px', backgroundColor: '#C6A059', margin: '16px auto 0' }}></div>
          </div>
        </div>

        {/* Central Hero Element */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#C6A059',
            borderRadius: '50%',
            filter: 'blur(40px)',
            opacity: 0.1
          }}></div>
          <div style={{
            position: 'relative',
            width: '280px',
            height: '280px',
            borderRadius: '50%',
            border: '4px solid rgba(198, 160, 89, 0.3)',
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', filter: 'grayscale(100%) contrast(125%)' }}>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIapTPtAfQckIu-4za_9ThJ0Uw5w82iV68fiBpjI3MIle3ECweEYscc8d6IvJ1uh9I0JX34XVPisq9sVmqs8-sHvUXoPsQSUw_yvb8oByL6QL31_jJH9I45MvRx90MigjefiaD0XSX_duTBhr-3ohBvj63jJCRVi8mqRbMBi_aSnNq8P1z90VnLTlXsP196QZJhjXTN9KmLrhB6YBTwPLyUF9q2YfvrdfaNcmg3oAcUufWsM1Wezr9Ry993sJPg4tvaWOeRUJYj3c"
                alt="Tower"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>

        {/* Footer / Action Area */}
        <div style={{ width: '100%', textAlign: 'center', position: 'relative', paddingBottom: '40px' }}>
          <p style={{
            fontSize: '14px',
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '60px',
            fontWeight: 500
          }}>
            Experiencia Residencial Premium
          </p>
          <div style={{ position: 'absolute', bottom: '-70px', left: '50%', transform: 'translateX(-50%)' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                backgroundColor: '#C6A059',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', tracking: '0.1em', color: '#00201e', marginBottom: '4px' }}>ENTRAR</span>
                <span className="material-symbols-outlined" style={{ fontSize: '36px', color: '#00201e' }}>keyboard_arrow_down</span>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Vertical Text Accents */}
      <div style={{
        display: 'none',
        position: 'absolute',
        left: '40px',
        top: '50%',
        transform: 'translateY(-50%) rotate(180deg)',
        writingMode: 'vertical-lr',
        color: 'rgba(255,255,255,0.2)',
        textTransform: 'uppercase',
        letterSpacing: '1em',
        fontSize: '12px'
      }} className="lg:block">
        RESIDENCIAL • EXCLUSIVO • SEGURO
      </div>
      <div style={{
        display: 'none',
        position: 'absolute',
        right: '40px',
        top: '50%',
        transform: 'translateY(-50%)',
        writingMode: 'vertical-lr',
        color: 'rgba(255,255,255,0.2)',
        textTransform: 'uppercase',
        letterSpacing: '1em',
        fontSize: '12px'
      }} className="lg:block">
        BIENVENIDO A CASA
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .lg\\:block {
          @media (min-width: 1024px) {
            display: block !important;
          }
        }
      `}} />
    </div>
  )
}
