import React, { useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/useAuthStore'

export const Profile: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut, updateAvatar } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const handleEditAvatar = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        updateAvatar(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuBXl_IfekcWOFARMjd2mqv4iW5pjjXof_IFK1PmC2_jcr4Dqc_sqHvBCFfhx10Vkoy3fwsaCJFY3FeBLxdhFwjA_ZXTeu2p8RlOhoNLfY1oUtcW7agASAcxMxF0W6jw8xgy9uo7OjGHjYW-J-JV_f6uhPH-r6sVqTOygYgkI_CauVfYnZOmKbS0ZtiweGaQmq4ooCgcZNjNeZd5HwFNIkSTAtL1UNXV3so4jgtqKVBx5-M-HFKpQaaequitgj24kQjzJ8S2sECYzco"

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF8F5', fontFamily: "'Inter', sans-serif", color: '#1B1C1A', paddingBottom: '100px' }}>
      <header style={{ position: 'fixed', top: 0, width: '100%', height: '64px', backgroundColor: 'white', borderBottom: '1px solid #bfc8c7', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 100, boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2f6d69', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden' }}>
            <img
              src={user?.avatar_url || defaultAvatar}
              alt="Mini Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: '20px', color: '#0f5551', fontWeight: 700, margin: 0 }}>Caminos de la Lagunita</h1>
        </div>
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f5551' }}>
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      <main style={{ paddingTop: '84px', paddingLeft: '20px', paddingRight: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        {/* Profile Header */}
        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '30px auto' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '4px solid #eae8e5', overflow: 'hidden', backgroundColor: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <img
              src={user?.avatar_url || defaultAvatar}
              alt="Avatar"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <button
            onClick={handleEditAvatar}
            style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0f5551', color: 'white', borderRadius: '50%', width: '36px', height: '36px', border: '3px solid #FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_camera</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px 0' }}>{user?.first_name || 'Nombre'} {user?.last_name || 'Apellido'}</h2>
        <p style={{ fontSize: '14px', color: '#3f4947', margin: '0 0 15px 0' }}>Residente Principal • Villa {user?.house_number || '14-42'}</p>
        <button style={{ padding: '8px 24px', borderRadius: '20px', border: '1px solid #bfc8c7', backgroundColor: 'white', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Editar Información</button>

        {/* Menu Sections */}
        <div style={{ marginTop: '40px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '16px', overflow: 'hidden' }}>
            <MenuItem onClick={() => navigate('/profile/account')} icon="key" label="Cuenta" bgColor="#ffdea6" />
            <MenuItem onClick={() => navigate('/profile/privacy')} icon="lock" label="Privacidad y seguridad" bgColor="#2f6d69" iconColor="white" />
            <MenuItem onClick={() => navigate('/profile/notifications')} icon="notifications" label="Notificaciones y sonido" bgColor="#d3e8d0" />
            <MenuItem onClick={() => navigate('/profile/appearance')} icon="dark_mode" label="Apariencia" bgColor="#e4e2df" />
            <MenuItem icon="language" label="Idioma" bgColor="#b0eee9" last />
          </div>

          <div style={{ backgroundColor: 'white', border: '1px solid #bfc8c7', borderRadius: '16px', overflow: 'hidden' }}>
            <MenuItem onClick={() => navigate('/profile/support')} icon="help" label="Ayuda, Comentario y reclamos" bgColor="#eae8e5" />
            <MenuItem onClick={() => navigate('/profile/invite')} icon="favorite" label="Invitar amigo" bgColor="#ffdad6" iconColor="#ba1a1a" />
            <div onClick={handleLogout} style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(186,26,26,0.1)', color: '#ba1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <span className="material-symbols-outlined">logout</span>
                  </div>
                  <span style={{ fontWeight: 600, color: '#ba1a1a' }}>Cerrar Sesión</span>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const MenuItem = ({ icon, label, bgColor, iconColor, last, onClick }: any) => (
  <div onClick={onClick} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: last ? 'none' : '1px solid #efeeeb', cursor: 'pointer', overflow: 'hidden' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, overflow: 'hidden' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: bgColor, color: iconColor || '#1B1C1A', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
    </div>
    <span className="material-symbols-outlined" style={{ color: '#bfc8c7', flexShrink: 0 }}>chevron_right</span>
  </div>
)
