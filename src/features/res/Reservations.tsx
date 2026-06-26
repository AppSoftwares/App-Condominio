import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdArrowBack } from 'react-icons/md'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'

export const Reservations: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  const [selectedArea, setSelectedArea] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [reservations, setReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('reservations')
        .select('*, profiles(first_name, last_name, house_number)')
        .gte('reservation_date', today)
        .order('reservation_date', { ascending: true })

      if (error) throw error
      setReservations(data || [])
    } catch (err: any) {
      console.error('Error fetching reservations:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReserve = (title: string) => {
    setSelectedArea(title)
    setShowModal(true)
  }

  const confirmReservation = async () => {
    if (!date || !time) return alert('Por favor seleccione fecha y hora')

    try {
      const { error } = await supabase
        .from('reservations')
        .insert([{
          user_id: user?.id,
          area_name: selectedArea,
          reservation_date: date,
          reservation_time: time,
          status: 'confirmed'
        }])

      if (error) throw error

      alert(`Reserva de ${selectedArea} para el ${date} a las ${time} registrada exitosamente.`)
      setShowModal(false)
      setDate('')
      setTime('')
      fetchReservations()
    } catch (err: any) {
      alert('Error al reservar: ' + err.message)
    }
  }

  // Helper para ver si un día del calendario tiene reserva
  const getDayReservation = (day: number) => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reservations.find(r => r.reservation_date === dateStr);
  }

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', paddingBottom: '100px' }}>
      <main style={{ paddingLeft: '20px', paddingRight: '20px', maxWidth: '500px', margin: '0 auto', paddingTop: '10px' }}>
        <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '32px', color: 'var(--primary-color)', fontWeight: 700, textAlign: 'center', marginBottom: '10px' }}>Reservación de Áreas</h1>
        <p style={{ color: 'var(--text-sub)', fontSize: '14px', marginBottom: '30px', textAlign: 'center' }}>Gestione su acceso a las exclusivas instalaciones de la comunidad.</p>

        {/* Calendar */}
        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '24px', marginBottom: '30px' }}>
           <h3 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '15px', textAlign: 'center', letterSpacing: '1px', textTransform: 'uppercase' }}>
             {new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
           </h3>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px', textAlign: 'center' }}>
              {['D','L','M','M','J','V','S'].map(d => <div key={d} style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-sub)' }}>{d}</div>)}
              {Array.from({length: daysInMonth}).map((_, i) => {
                const day = i + 1;
                const res = getDayReservation(day);
                return (
                  <div key={i} style={{
                    padding: '8px',
                    borderRadius: '10px',
                    fontSize: '13px',
                    backgroundColor: res ? 'var(--primary-color)' : 'transparent',
                    color: res ? 'white' : 'var(--text-color)',
                    fontWeight: res ? 700 : 500,
                    position: 'relative'
                  }}>
                    {day}
                    {res && <div style={{ position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)' }}></div>}
                  </div>
                )
              })}
           </div>
        </div>

        {/* Mural de Reservas */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-sub)', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>Mural de Reservaciones</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
              <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-sub)' }}>Cargando mural...</p>
            ) : reservations.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-sub)' }}>No hay reservas próximas.</p>
            ) : (
              reservations.map(r => (
                <div key={r.id} style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '14px' }}>{r.area_name}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-sub)' }}>{r.profiles?.first_name} {r.profiles?.last_name} • Casa {r.profiles?.house_number}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: 'var(--primary-color)' }}>{r.reservation_date}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-sub)' }}>{r.reservation_time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Area Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           <AreaCard
            title="Bohío"
            desc="Área social techada ideal para reuniones familiares."
            img="https://lh3.googleusercontent.com/aida-public/AB6AXuA3fifZElPy6Dtuz7SapzgfurrwMYuTuu-rb6Zip5T6xYgPbsj1WgrgT9yMfXBRiM7srbZy5mM4AKb6U6zZT0puDVqDmw4gqPV9U8NZe67IfBpHjrbH85psoV0oQHu1ycC4jG2wp0VdDlCEvBupJExt5hqJhxRXHHl7hja8fn1zA-JsGGRe-Y-Ccm1F_ERiyKY4EB4x-9yJcyJj0DJcH_0Lga-inwDBQ58LNuRoFcsGzseADmRdlfQummjCzseBN6-kXKSRDJff9HY"
            onReserve={() => handleReserve('Bohío')}
           />
           <AreaCard
            title="Cancha Deportiva"
            desc="Cancha profesional multi-uso con iluminación."
            img="https://lh3.googleusercontent.com/aida-public/AB6AXuDE6XFBPFgJ4Nhk5oPxEQ6-MxT4bsY43_sgJ9wzfqTjIMPVi9oSZISnBiChGwX7J8rHP4UEZPknc8AN99uhW4A6qzGwE4NPkDNVrpRJwqQjethFsbNLh5bGqCdZFL4C9WES3QnIG99iPFfQQStOsUM-WMWle9vG1wgLeUTJcrHOJQ_xcnO677SLtww2NxhbfvJ5j2YEcWzMt_XeFTj6a1fRvj8CvVZIggQlwkdFw_I6OVTQwxYDyKEaiEFzvvHWpPs0wdGBJCp8nLI"
            onReserve={() => handleReserve('Cancha Deportiva')}
           />
        </div>
      </main>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '28px', padding: '32px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontFamily: "'EB Garamond', serif", fontSize: '24px', color: 'var(--primary-color)', margin: '0 0 20px 0', textAlign: 'center' }}>Reservar {selectedArea}</h3>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Fecha</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={labelStyle}>Hora de Inicio</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inputStyle} />
            </div>

            <button onClick={confirmReservation} style={primaryBtnStyle}>Confirmar Reserva</button>
            <button onClick={() => setShowModal(false)} style={{ width: '100%', padding: '15px', background: 'none', border: 'none', color: '#ba1a1a', fontWeight: 700, cursor: 'pointer', marginTop: '10px' }}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  )
}

const AreaCard = ({ title, desc, img, onReserve }: any) => (
  <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
    <img src={img} alt={title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
    <div style={{ padding: '24px' }}>
      <h3 style={{ fontSize: '20px', color: 'var(--primary-color)', margin: '0 0 8px 0', fontFamily: "'EB Garamond', serif", fontWeight: 700 }}>{title}</h3>
      <p style={{ fontSize: '14px', color: 'var(--text-sub)', marginBottom: '20px', lineHeight: 1.5 }}>{desc}</p>
      <button onClick={onReserve} style={primaryBtnStyle}>Reservar Espacio</button>
    </div>
  </div>
)

const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '8px', textTransform: 'uppercase' as const, letterSpacing: '1px' }
const inputStyle = { width: '100%', padding: '16px', borderRadius: '14px', border: '1px solid var(--border-color)', fontSize: '16px', boxSizing: 'border-box' as const, outline: 'none', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)' }
const primaryBtnStyle = { width: '100%', padding: '18px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(15,85,81,0.15)' }
