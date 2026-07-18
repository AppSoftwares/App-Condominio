import React, { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MdOutlinePhotoCamera,
  MdOutlinePerson,
  MdOutlineLock,
  MdOutlinePalette,
  MdOutlineNotifications,
  MdOutlineHelpOutline,
  MdGavel,
  MdOutlineLogout,
  MdOutlineChevronRight,
  MdOutlineEmergency
} from 'react-icons/md'
import { useAuthStore } from '../../store/useAuthStore'

export const Profile: React.FC = () => {
  const navigate = useNavigate()
  const { user, signOut, updateAvatar } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLogout = async () => {
    try {
      await signOut()
    } finally {
      navigate('/', { replace: true })
    }
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
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 0.3s ease', minHeight: '100vh' }}>

      <main style={mainContentStyle}>

        {/* Profile Avatar Large - Now at the top */}
        <div style={{ position: 'relative', width: '160px', height: '160px', margin: '10px auto 30px' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', border: '5px solid var(--accent-gold)', overflow: 'hidden', boxShadow: '0 10px 30px rgba(198,160,89,0.3)' }}>
            <img src={user?.avatar_url || defaultAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <button onClick={handleEditAvatar} style={camBtnStyle}>
            <MdOutlinePhotoCamera size={24} />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
        </div>

        <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '36px', margin: '0 0 8px 0', color: 'var(--primary-color)', fontWeight: 700 }}>{user?.first_name || 'Usuario'} {user?.last_name || ''}</h2>
        <p style={{ fontSize: '15px', color: 'var(--text-sub)', marginBottom: '35px', fontWeight: 600, letterSpacing: '1px' }}>{user?.role?.toUpperCase()} • {user?.residential_cluster || 'Residente'}</p>

        {/* Menu Groups */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
           <div style={cardStyle}>
              <MenuItem onClick={() => navigate('/profile/account')} icon={MdOutlinePerson} label="Configuración de Cuenta" />
              <MenuItem onClick={() => navigate('/profile/emergency')} icon={MdOutlineEmergency} label="Líneas de Emergencia" />
              <MenuItem onClick={() => navigate('/profile/privacy')} icon={MdOutlineLock} label="Privacidad y Seguridad" />
              <MenuItem onClick={() => navigate('/profile/appearance')} icon={MdOutlinePalette} label="Apariencia y Tema" />
              <MenuItem onClick={() => navigate('/profile/notifications')} icon={MdOutlineNotifications} label="Notificaciones" last />
           </div>

           <div style={cardStyle}>
              <MenuItem onClick={() => navigate('/profile/support')} icon={MdOutlineHelpOutline} label="Centro de Ayuda" />
              <MenuItem onClick={() => navigate('/profile/legal')} icon={MdGavel} label="Términos y Condiciones" />
              <div onClick={handleLogout} style={{ ...menuItemStyle, border: 'none' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ ...iconBoxStyle, backgroundColor: 'rgba(186,26,26,0.1)', color: '#ba1a1a' }}>
                       <MdOutlineLogout size={24} />
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

const MenuItem = ({ icon: Icon, label, last, onClick }: any) => (
  <div onClick={onClick} style={{ ...menuItemStyle, borderBottom: last ? 'none' : '1px solid var(--border-color)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <div style={iconBoxStyle}>
        <Icon size={24} />
      </div>
      <span style={{ fontWeight: 600, fontSize: '15px' }}>{label}</span>
    </div>
    <MdOutlineChevronRight size={20} style={{ color: 'var(--text-sub)' }} />
  </div>
)

const headerStyle = { width: '100%', maxWidth: '560px', borderRadius: '32px', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '18px 22px', marginTop: '20px', boxShadow: '0 18px 35px rgba(0,0,0,0.08)' }
const mainContentStyle = { paddingTop: '40px', paddingLeft: '20px', paddingRight: '20px', width: '100%', maxWidth: '500px', margin: '0 auto', boxSizing: 'border-box' as any, textAlign: 'center' as any }
const cardStyle = { backgroundColor: 'var(--card-bg)', borderRadius: '28px', border: '1px solid var(--border-color)', width: '100%', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }
const menuItemStyle = { padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }
const iconBoxStyle = { width: '44px', height: '44px', borderRadius: '14px', backgroundColor: 'var(--icon-bg)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
const camBtnStyle = { position: 'absolute' as any, bottom: '5px', right: '5px', backgroundColor: 'var(--accent-gold)', color: 'white', borderRadius: '50%', width: '48px', height: '48px', border: '4px solid var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 6px 15px rgba(0,0,0,0.15)' }
