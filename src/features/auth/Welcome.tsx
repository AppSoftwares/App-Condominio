import React from 'react'
import { useNavigate } from 'react-router-dom'

export const Welcome: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center', // Centrado vertical total
      alignItems: 'center',     // Centrado horizontal total
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#2F6D69',
      backgroundImage: `linear-gradient(rgba(47, 109, 105, 0.92), rgba(47, 109, 105, 0.92)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuBcbvZDDo0T_0wDyT_PYJVGqDNBAxtIjBv3bSGWh6KNk9DSCLk_AKpN4FRiFbvq1bPZsgDk3D47671D39xbXII1TlEwqdq8EFpoMSDawb9yFTSDfnFNAO-XIpU_bwLHfIKmN8t-GaILN6SOhDYG9jlk-h6MwgnZ-8OtBcVrNs2T-THiJqffrqRTV0IVIIbVYK7F7ptnVXarj-GvBf0ksJDk5v5--SYsMx8W_xusghrDluU7FelQzuyubB9KtRwW7UbOxN-lyaGuAf4')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Patrón Arquitectónico sutil */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
        zIndex: 1
      }}></div>

      {/* Marcos de las esquinas */}
      <div style={{ position: 'absolute', top: '30px', left: '30px', width: '50px', height: '50px', borderTop: '1px solid rgba(255,255,255,0.2)', borderLeft: '1px solid rgba(255,255,255,0.2)', zIndex: 2 }}></div>
      <div style={{ position: 'absolute', top: '30px', right: '30px', width: '50px', height: '50px', borderTop: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', zIndex: 2 }}></div>

      <main style={{
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '450px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center', // Agrupa todo al centro
        gap: '40px',             // Espaciado equilibrado entre secciones
        padding: '20px',
        boxSizing: 'border-box'
      }}>

        {/* Sección Superior: Logo y Título */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '110px', height: '110px', marginBottom: '25px', animation: 'float 4s ease-in-out infinite' }}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8QsGNY_Q0aq1KaT-hJeFsbP4mRDomcQ19BW-zuVYjVkb6eac8rVaAJgrbgjV1BCYpVyyKjJzoH36qm0d4H3skuvIPSjKU5t8GcKDMNLDBaIiEY-nz8q-UMjry88UdO-r6NhCoKBvnDpbOXysRkWPuX072rdgZwm1sgyeex05EJtuPr4wI-Cejn53p67SD85te5omuI7vj63weNdKASAD4HFzTcNmAJCZR7hQgo_zpVH-Iz6m5J7eZu9yHN3BzObk0cTxuqgPVS-Y"
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <h1 style={{
            fontFamily: "'Cinzel', serif",
            color: 'white',
            letterSpacing: '0.3em',
            fontSize: '26px',
            fontWeight: 700,
            lineHeight: 1.2,
            margin: 0,
            textTransform: 'uppercase'
          }}>
            CAMINO DE LA<br/>LAGUNITA
          </h1>
          <div style={{ height: '1px', width: '80px', backgroundColor: '#C6A059', margin: '15px auto 0' }}></div>
        </div>

        {/* Sección Central: Imagen de la Torre */}
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            inset: -15,
            backgroundColor: '#C6A059',
            borderRadius: '50%',
            filter: 'blur(35px)',
            opacity: 0.15
          }}></div>
          <div style={{
            position: 'relative',
            width: '260px',
            height: '260px',
            borderRadius: '50%',
            border: '3px solid rgba(198, 160, 89, 0.4)',
            padding: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', filter: 'grayscale(100%) contrast(120%)' }}>
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBIapTPtAfQckIu-4za_9ThJ0Uw5w82iV68fiBpjI3MIle3ECweEYscc8d6IvJ1uh9I0JX34XVPisq9sVmqs8-sHvUXoPsQSUw_yvb8oByL6QL31_jJH9I45MvRx90MigjefiaD0XSX_duTBhr-3ohBvj63jJCRVi8mqRbMBi_aSnNq8P1z90VnLTlXsP196QZJhjXTN9KmLrhB6YBTwPLyUF9q2YfvrdfaNcmg3oAcUufWsM1Wezr9Ry993sJPg4tvaWOeRUJYj3c"
                alt="Tower"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>

        {/* Sección Inferior: Botón y Texto */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.8)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: '25px',
            fontWeight: 500
          }}>
            Experiencia Residencial Premium
          </p>

          <button
            onClick={() => navigate('/auth')}
            style={{
              width: '130px',
              height: '130px',
              borderRadius: '50%',
              backgroundColor: '#C6A059',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 35px rgba(0,0,0,0.3)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.1em', color: '#00201e', marginBottom: '2px' }}>ENTRAR</span>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: '#00201e' }}>keyboard_arrow_down</span>
          </button>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
        }
      `}} />
    </div>
  )
}
