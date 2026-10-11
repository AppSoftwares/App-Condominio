import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdGavel, MdOutlinePrivacyTip, MdCookie, MdReceiptLong, MdSettings, MdBusiness } from 'react-icons/md'
import { ConsentPreferences } from './ConsentPreferences'
import { LEGAL_ENTITY } from '../../config/legalEntity'

export const LegalSettingsSection: React.FC = () => {
  const navigate = useNavigate()
  const [showConsentModal, setShowConsentModal] = useState(false)

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', borderRadius: '28px', border: '1px solid var(--border-color)', width: '100%', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.02)', textAlign: 'left' }}>
      <div style={{ padding: '16px 24px 8px', fontSize: '13px', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>
        Legal y Privacidad
      </div>

      <LegalItem onClick={() => navigate('/profile/legal?type=terms')} icon={MdGavel} label="Términos y Condiciones" />
      <LegalItem onClick={() => navigate('/profile/legal?type=privacy')} icon={MdOutlinePrivacyTip} label="Política de Privacidad" />
      <LegalItem onClick={() => navigate('/profile/legal?type=cookies')} icon={MdCookie} label="Política de Cookies y Almacenamiento" />
      <LegalItem onClick={() => navigate('/profile/legal?type=refunds')} icon={MdReceiptLong} label="Política de Reembolso y Cancelación" />
      <LegalItem onClick={() => setShowConsentModal(true)} icon={MdSettings} label="Preferencias de privacidad (cookies y diagnóstico)" last />

      <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--icon-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <MdBusiness size={20} color="var(--primary-color)" />
          <span style={{ fontWeight: 700, fontSize: '14px' }}>{LEGAL_ENTITY.tradeName}</span>
        </div>
        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-sub)' }}>Razón Social: {LEGAL_ENTITY.legalName} | RIF: {LEGAL_ENTITY.taxId}</p>
        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-sub)' }}>Domicilio: {LEGAL_ENTITY.address}</p>
        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-sub)' }}>Contacto: {LEGAL_ENTITY.contactEmail}</p>
      </div>

      {showConsentModal && <ConsentPreferences onClose={() => setShowConsentModal(false)} />}
    </div>
  )
}

const LegalItem = ({ icon: Icon, label, onClick, danger, last }: any) => (
  <div onClick={onClick} style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', borderBottom: last ? 'none' : '1px solid var(--border-color)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: danger ? 'rgba(186,26,26,0.1)' : 'var(--icon-bg)', color: danger ? '#ba1a1a' : 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} />
      </div>
      <span style={{ fontWeight: 600, fontSize: '14px', color: danger ? '#ba1a1a' : 'var(--text-color)' }}>{label}</span>
    </div>
  </div>
)
