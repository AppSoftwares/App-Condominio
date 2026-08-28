import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MdGavel, MdOutlinePrivacyTip, MdArrowBackIosNew } from 'react-icons/md';
import { TERMS_AND_CONDITIONS, PRIVACY_POLICY } from '../LegalContent';

export const LegalDocumentPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'privacy') setActiveTab('privacy');
    else if (type === 'terms') setActiveTab('terms');
  }, [searchParams]);

  const currentContent = activeTab === 'terms' ? TERMS_AND_CONDITIONS : PRIVACY_POLICY;

  return (
    <div
      className="min-h-screen animate-fadeIn"
      style={{ backgroundColor: '#F4F0E6', color: '#2C2C2A', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Botón Volver - Estilo Premium y accesible */}
      <div className="px-4 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 font-bold transition-opacity active:opacity-60"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0D524D' }}
        >
          <MdArrowBackIosNew size={18} />
          <span style={{ fontSize: '18px' }}>Volver</span>
        </button>
      </div>

      {/* Contenedor con Padding Lateral Generoso (Paso 2) */}
      <div className="max-w-3xl mx-auto px-6 md:px-[22px] pb-24">
        <h1
          className="text-4xl font-bold mb-10 text-center"
          style={{ color: '#0D524D', fontFamily: "'EB Garamond', serif" }}
        >
          Información Legal
        </h1>

        {/* Tabs Selector - Segmented Control Centrado (Paso 4) */}
        <div
          className="flex p-1.5 mb-12 rounded-[14px] gap-2.5"
          style={{ backgroundColor: '#E4DED0', border: '1px solid rgba(13, 82, 77, 0.1)' }}
        >
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[10px] transition-all duration-300 font-bold text-[15px] min-h-[44px]`}
            style={{
              backgroundColor: activeTab === 'terms' ? '#0D524D' : 'transparent',
              color: activeTab === 'terms' ? '#EAF3E6' : '#5F5E5A',
              boxShadow: activeTab === 'terms' ? '0 4px 12px rgba(13, 82, 77, 0.2)' : 'none',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <MdGavel size={20} />
            Términos y Condiciones
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[10px] transition-all duration-300 font-bold text-[15px] min-h-[44px]`}
            style={{
              backgroundColor: activeTab === 'privacy' ? '#0D524D' : 'transparent',
              color: activeTab === 'privacy' ? '#EAF3E6' : '#5F5E5A',
              boxShadow: activeTab === 'privacy' ? '0 4px 12px rgba(13, 82, 77, 0.2)' : 'none',
              border: 'none',
              cursor: 'pointer'
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
          <header className="mb-10 border-b pb-8" style={{ borderColor: 'rgba(13, 82, 77, 0.12)' }}>
            <h2 className="text-3xl font-bold mb-3 text-left leading-tight" style={{ color: '#0D524D', fontFamily: "'EB Garamond', serif" }}>
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
            {/* Párrafo Justificado (Paso 3) */}
            <p className="text-justify text-[16px] text-[#3A3A36] leading-[1.7] italic border-l-4 pl-6" style={{ borderColor: '#0D524D' }}>
              {currentContent.intro}
            </p>

            {/* Secciones con Jerarquía Visual */}
            {currentContent.sections.map((section, idx) => (
              <div key={idx} className="legal-section">
                <h3
                  className="text-[22px] font-bold mb-5 leading-tight"
                  style={{ color: '#0D524D', fontFamily: "'EB Garamond', serif" }}
                >
                  {section.title}
                </h3>
                <div className="text-[#3A3A36] text-[16px] leading-[1.7] space-y-5 text-justify">
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

/**
 * Formatea el cuerpo del texto legal manejando listas y numeración (Paso 5)
 */
const formatLegalBody = (body: string) => {
  // Limpiamos espacios y manejamos el contenido como un bloque robusto
  return body.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return null;

    // Detectar viñetas (bullets)
    if (trimmed.startsWith('•')) {
      return (
        <div key={i} className="flex gap-3 ml-2 mb-4">
          <span className="text-[#0D524D] font-extrabold mt-0.5">•</span>
          <p className="flex-1 text-[#3A3A36] text-justify leading-[1.7]">
            {trimmed.substring(1).trim()}
          </p>
        </div>
      );
    }

    // Detectar numeración (ej. 1. 2. 3.)
    if (/^[0-9]+\./.test(trimmed)) {
      const parts = trimmed.split(' ');
      const number = parts[0];
      const text = parts.slice(1).join(' ');

      return (
        <div key={i} className="pl-6 mb-4 border-l-2 border-[#E4DED0]">
          <p className="font-bold text-[#0D524D] text-[17px] mb-1">{number}</p>
          <p className="text-[#2C2C2A] text-justify leading-[1.7]">{text}</p>
        </div>
      );
    }

    // Párrafo estándar justificado
    return <p key={i} className="mb-4 text-justify leading-[1.7] text-[#2C2C2A]">{trimmed}</p>;
  }).filter(Boolean);
};
