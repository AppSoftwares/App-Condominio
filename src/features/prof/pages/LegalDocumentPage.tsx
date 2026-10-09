import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MdGavel, MdOutlinePrivacyTip, MdCookie, MdReceiptLong, MdArrowBackIosNew } from 'react-icons/md';
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY } from '../LegalContent';
import { COOKIES_POLICY, REFUND_POLICY } from '../../legal/legalPolicies';
import { formatLegalBody } from '../../legal/LegalBody';

export const LegalDocumentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'cookies' | 'refunds'>('terms');

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'privacy') setActiveTab('privacy');
    else if (type === 'terms') setActiveTab('terms');
    else if (type === 'cookies') setActiveTab('cookies');
    else if (type === 'refunds') setActiveTab('refunds');
  }, [searchParams]);

  let currentContent: any = TERMS_AND_CONDITIONS;
  if (activeTab === 'privacy') currentContent = PRIVACY_POLICY;
  else if (activeTab === 'cookies') currentContent = COOKIES_POLICY;
  else if (activeTab === 'refunds') currentContent = REFUND_POLICY;

  return (
    <div
      className="min-h-screen animate-fadeIn"
      style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)', fontFamily: "'Inter', sans-serif" }}
    >
      <div className="px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-bold transition-opacity active:opacity-60"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary-color)' }}
        >
          <MdArrowBackIosNew size={18} />
          <span style={{ fontSize: '18px' }}>Volver</span>
        </button>
      </div>

      <div className="max-w-3xl mx-auto px-6 md:px-[22px] pb-24">
        <h1
          className="text-4xl font-bold mb-10 text-center"
          style={{ color: 'var(--primary-color)', fontFamily: "'EB Garamond', serif" }}
        >
          Información Legal
        </h1>

        <div
          className="flex p-1.5 mb-12 rounded-[14px] gap-2 overflow-x-auto"
          style={{ backgroundColor: 'var(--icon-bg)', border: '1px solid var(--border-color)' }}
        >
          {[
            { id: 'terms', label: 'Términos', icon: MdGavel },
            { id: 'privacy', label: 'Privacidad', icon: MdOutlinePrivacyTip },
            { id: 'cookies', label: 'Cookies', icon: MdCookie },
            { id: 'refunds', label: 'Reembolsos', icon: MdReceiptLong },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-[10px] transition-all duration-300 font-bold text-[14px] min-h-[44px] whitespace-nowrap`}
                style={{
                  backgroundColor: active ? 'var(--primary-color)' : 'transparent',
                  color: active ? 'white' : 'var(--text-sub)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        <div
          className="transition-opacity duration-500"
          key={activeTab}
          style={{ animation: 'contentFadeIn 0.6s ease-out' }}
        >
          <header className="mb-10 border-b pb-8" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-3xl font-bold mb-3 text-left leading-tight" style={{ color: 'var(--primary-color)', fontFamily: "'EB Garamond', serif" }}>
              {currentContent.title}
            </h2>
            <div className="flex items-center gap-2 opacity-60">
              <span className="w-8 h-px bg-current"></span>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                Última actualización: {currentContent.lastUpdate}
              </p>
            </div>
          </header>

          <div className="space-y-12">
            <p className="text-justify text-[16px] leading-[1.7] italic border-l-4 pl-6" style={{ borderColor: 'var(--primary-color)' }}>
              {currentContent.intro}
            </p>

            {currentContent.sections.map((section: any, idx: number) => (
              <div key={idx} className="legal-section">
                <h3
                  className="text-[22px] font-bold mb-5 leading-tight"
                  style={{ color: 'var(--primary-color)', fontFamily: "'EB Garamond', serif" }}
                >
                  {section.title}
                </h3>
                <div className="text-[16px] leading-[1.7] space-y-5 text-justify">
                  {formatLegalBody(section.body)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes contentFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .legal-section { animation: sectionSlideUp 0.8s ease-out both; }
        @keyframes sectionSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
