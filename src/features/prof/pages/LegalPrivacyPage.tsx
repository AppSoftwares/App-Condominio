import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdGavel, MdOutlinePrivacyTip, MdCookie, MdReceiptLong, MdSettings, MdArrowBackIosNew } from 'react-icons/md'
import { SettingsRow } from '../components/SettingsRow'
import { ConsentPreferences } from '../../legal/ConsentPreferences'

export const LegalPrivacyPage: React.FC = () => {
  const navigate = useNavigate()
  const [showConsentModal, setShowConsentModal] = useState(false)

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', minHeight: '100vh', paddingBottom: '40px' }}>
      <div style={{ padding: '20px 20px 10px', maxWidth: '500px', margin: '0 auto' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, padding: 0 }}
        >
          <MdArrowBackIosNew size={18} />
          <span style={{ fontSize: '16px' }}>Volver</span>
        </button>
      </div>

      <main style={{ paddingLeft: '20px', paddingRight: '20px', maxWidth: '500px', margin: '0 auto', paddingTop: '10px' }}>
        <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: '32px', marginBottom: '24px', color: 'var(--primary-color)', fontWeight: 700 }}>
          Legal y Privacidad
        </h2>

        <div style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '28px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.02)' }}>
          <SettingsRow
            icon={MdGavel}
            label="Términos y Condiciones"
            onClick={() => navigate('/profile/legal?type=terms')}
          />
          <SettingsRow
            icon={MdOutlinePrivacyTip}
            label="Política de Privacidad"
            onClick={() => navigate('/profile/legal?type=privacy')}
          />
          <SettingsRow
            icon={MdCookie}
            label="Política de Cookies y Almacenamiento"
            onClick={() => navigate('/profile/legal?type=cookies')}
          />
          <SettingsRow
            icon={MdSettings}
            label="Preferencias de Privacidad"
            description="Cookies y almacenamiento"
            onClick={() => setShowConsentModal(true)}
          />
          <SettingsRow
            icon={MdReceiptLong}
            label="Política de Reembolso y Cancelación"
            onClick={() => navigate('/profile/legal?type=refunds')}
            last
          />
        </div>
      </main>

      {showConsentModal && <ConsentPreferences onClose={() => setShowConsentModal(false)} />}
    </div>
  )
}
