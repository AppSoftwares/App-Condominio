import React from 'react'
import { useNavigate } from 'react-router-dom'

export const Reservations: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', fontFamily: "'Inter', sans-serif", color: '#1B1C1A', paddingBottom: '100px' }}>
      <header style={{ position: 'fixed', top: 0, width: '100%', height: '64px', backgroundColor: 'white', borderBottom: '1px solid #bfc8c7', display: 'flex', alignItems: 'center', padding: '0 20px', zIndex: 100, boxSizing: 'border-box' }}>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '20px', color: '#0f5551', fontWeight: 700, margin: '0 0 0 15px' }}>Reservación de Áreas</h1>
      </header>

      <main style={{ paddingTop: '84px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <p style={{ color: '#3f4947', fontSize: '14px', marginBottom: '30px' }}>Gestione su acceso a las exclusivas instalaciones de la comunidad.</p>

        {/* Calendar Placeholder */}
        <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '16px', padding: '20px', marginBottom: '30px' }}>
           <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#785919', marginBottom: '15px' }}>OCTUBRE 2024</h3>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center' }}>
              {['D','L','M','M','J','V','S'].map(d => <div key={d} style={{ fontSize: '10px', fontWeight: 700, color: '#6f7978' }}>{d}</div>)}
              {Array.from({length: 31}).map((_, i) => (
                <div key={i} style={{ padding: '10px', borderRadius: '8px', fontSize: '13px', backgroundColor: i + 1 === 6 ? '#0f5551' : 'transparent', color: i + 1 === 6 ? 'white' : '#1b1c1a' }}>
                  {i + 1}
                </div>
              ))}
           </div>
        </div>

        {/* Area Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <AreaCard
            title="Bohío"
            desc="Área social techada ideal para reuniones familiares."
            img="https://lh3.googleusercontent.com/aida-public/AB6AXuA3fifZElPy6Dtuz7SapzgfurrwMYuTuu-rb6Zip5T6xYgPbsj1WgrgT9yMfXBRiM7srbZy5mM4AKb6U6zZT0puDVqDmw4gqPV9U8NZe67IfBpHjrbH85psoV0oQHu1ycC4jG2wp0VdDlCEvBupJExt5hqJhxRXHHl7hja8fn1zA-JsGGRe-Y-Ccm1F_ERiyKY4EB4x-9yJcyJj0DJcH_0Lga-inwDBQ58LNuRoFcsGzseADmRdlfQummjCzseBN6-kXKSRDJff9HY"
           />
           <AreaCard
            title="Cancha Deportiva"
            desc="Cancha profesional multi-uso con iluminación."
            img="https://lh3.googleusercontent.com/aida-public/AB6AXuDE6XFBPFgJ4Nhk5oPxEQ6-MxT4bsY43_sgJ9wzfqTjIMPVi9oSZISnBiChGwX7J8rHP4UEZPknc8AN99uhW4A6qzGwE4NPkDNVrpRJwqQjethFsbNLh5bGqCdZFL4C9WES3QnIG99iPFfQQStOsUM-WMWle9vG1wgLeUTJcrHOJQ_xcnO677SLtww2NxhbfvJ5j2YEcWzMt_XeFTj6a1fRvj8CvVZIggQlwkdFw_I6OVTQwxYDyKEaiEFzvvHWpPs0wdGBJCp8nLI"
           />
        </div>
      </main>
    </div>
  )
}

const AreaCard = ({ title, desc, img }: any) => (
  <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
    <img src={img} alt={title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
    <div style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '20px', color: '#0f5551', margin: '0 0 10px 0', fontFamily: "'EB Garamond', serif" }}>{title}</h3>
      <p style={{ fontSize: '13px', color: '#3f4947', marginBottom: '20px' }}>{desc}</p>
      <button style={{ width: '100%', padding: '12px', backgroundColor: '#0f5551', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Reservar Espacio</button>
    </div>
  </div>
)
