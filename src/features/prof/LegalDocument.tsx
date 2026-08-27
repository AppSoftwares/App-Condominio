import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MdGavel, MdOutlinePrivacyTip } from 'react-icons/md';
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY } from './LegalContent';

export const LegalDocument = () => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'privacy') setActiveTab('privacy');
    else if (type === 'terms') setActiveTab('terms');
  }, [searchParams]);

  const currentContent = activeTab === 'terms' ? TERMS_AND_CONDITIONS : PRIVACY_POLICY;

  return (
    <div
      className="min-h-screen p-6 pb-24 animate-fadeIn"
      style={{ backgroundColor: '#F5F1E8', color: '#2E2E2E', fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-2xl mx-auto">
        <h1
          className="text-4xl font-bold mb-10 text-center"
          style={{ color: '#1B4B4A', fontFamily: "'EB Garamond', serif" }}
        >
          Información Legal
        </h1>

        {/* Tabs Selector - Segmented Control / Pill Style */}
        <div
          className="flex p-1.5 mb-12 rounded-2xl shadow-inner"
          style={{ backgroundColor: '#EAE5D8', border: '1px solid rgba(27, 75, 74, 0.08)' }}
        >
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl transition-all duration-500 font-bold text-sm`}
            style={{
              backgroundColor: activeTab === 'terms' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'terms' ? '#1B4B4A' : 'rgba(46, 46, 46, 0.5)',
              boxShadow: activeTab === 'terms' ? '0 8px 20px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <MdGavel size={20} />
            Términos y Condiciones
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl transition-all duration-500 font-bold text-sm`}
            style={{
              backgroundColor: activeTab === 'privacy' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'privacy' ? '#1B4B4A' : 'rgba(46, 46, 46, 0.5)',
              boxShadow: activeTab === 'privacy' ? '0 8px 20px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <MdOutlinePrivacyTip size={20} />
            Privacidad
          </button>
        </div>

        <div
          className="transition-opacity duration-500"
          key={activeTab}
          style={{ animation: 'contentFadeIn 0.6s ease-out' }}
        >
          <header className="mb-10 border-b pb-8" style={{ borderColor: 'rgba(27, 75, 74, 0.12)' }}>
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#1B4B4A', fontFamily: "'EB Garamond', serif", lineHeight: 1.2 }}>
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
            {/* Intro */}
            <p className="leading-relaxed text-lg text-[#4A4A4A] italic border-l-4 pl-6" style={{ borderColor: '#1B4B4A' }}>
              {currentContent.intro}
            </p>

            {/* Sections */}
            {currentContent.sections.map((section, idx) => (
              <div key={idx} className="legal-section">
                <h3
                  className="text-2xl font-bold mb-5 leading-tight"
                  style={{ color: '#1B4B4A', fontFamily: "'EB Garamond', serif" }}
                >
                  {section.title}
                </h3>
                <div className="text-[#2E2E2E] text-[16px] leading-[1.6] space-y-4">
                  {formatLegalBody(section.body)}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <footer className="mt-20 pt-12 border-t" style={{ borderColor: 'rgba(27, 75, 74, 0.12)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
              <div className="p-6 rounded-3xl" style={{ backgroundColor: '#EAE5D8', border: '1px solid rgba(27, 75, 74, 0.05)' }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-[#1B4B4A] opacity-60">Atención al Cliente</p>
                <p className="text-sm font-bold text-[#1B4B4A]">{currentContent.footer.contactEmail}</p>
              </div>
              <div className="p-6 rounded-3xl" style={{ backgroundColor: '#EAE5D8', border: '1px solid rgba(27, 75, 74, 0.05)' }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-[#1B4B4A] opacity-60">Portal Oficial</p>
                <p className="text-sm font-bold text-[#1B4B4A] truncate">{currentContent.footer.webPortal}</p>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-[11px] font-medium opacity-60">
                {currentContent.footer.location}
              </p>
              <p className="text-[10px] font-black tracking-[0.15em] text-[#1B4B4A] uppercase opacity-40">
                {currentContent.footer.copy}
              </p>
            </div>
          </footer>
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

const formatLegalBody = (body: string) => {
  return body.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('•')) {
      return (
        <div key={i} className="flex gap-3 ml-2 mb-4 group">
          <span className="text-[#1B4B4A] font-bold mt-0.5">•</span>
          <p className="flex-1 text-[#444444] leading-relaxed">
            {trimmed.substring(1).trim()}
          </p>
        </div>
      );
    }
    // Handle sub-numbering (e.g. 1. 2. 3.)
    if (/^[0-9]+\./.test(trimmed)) {
      return (
        <div key={i} className="pl-4 mb-4">
          <p className="font-bold text-[#1B4B4A] mb-1">{trimmed.split(' ')[0]}</p>
          <p className="text-[#2E2E2E]">{trimmed.split(' ').slice(1).join(' ')}</p>
        </div>
      );
    }
    if (trimmed.length === 0) return null;
    return <p key={i} className="mb-4 leading-relaxed text-[#2E2E2E]">{trimmed}</p>;
  }).filter(Boolean);
};
