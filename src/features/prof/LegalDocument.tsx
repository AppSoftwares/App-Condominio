import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MdArrowBack, MdGavel, MdOutlinePrivacyTip } from 'react-icons/md';

export const LegalDocument = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'privacy') setActiveTab('privacy');
    else if (type === 'terms') setActiveTab('terms');
  }, [searchParams]);

  return (
    <div className="min-h-screen p-6 pt-24" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 font-bold" style={{ color: 'var(--primary-color)' }}>
        <MdArrowBack /> Volver
      </button>

      <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-color)', fontFamily: "'EB Garamond', serif" }}>
        Información Legal
      </h1>

      {/* Tabs Selector */}
      <div className="flex p-1 mb-8 rounded-2xl" style={{ backgroundColor: 'var(--icon-bg)', border: '1px solid var(--border-color)' }}>
        <button
          onClick={() => setActiveTab('terms')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 font-bold text-sm ${activeTab === 'terms' ? 'bg-white shadow-sm' : ''}`}
          style={{
            backgroundColor: activeTab === 'terms' ? 'var(--card-bg)' : 'transparent',
            color: activeTab === 'terms' ? 'var(--primary-color)' : 'var(--text-sub)'
          }}
        >
          <MdGavel size={18} />
          Términos y Condiciones
        </button>
        <button
          onClick={() => setActiveTab('privacy')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 font-bold text-sm ${activeTab === 'privacy' ? 'bg-white shadow-sm' : ''}`}
          style={{
            backgroundColor: activeTab === 'privacy' ? 'var(--card-bg)' : 'transparent',
            color: activeTab === 'privacy' ? 'var(--primary-color)' : 'var(--text-sub)'
          }}
        >
          <MdOutlinePrivacyTip size={18} />
          Privacidad
        </button>
      </div>

      <div className="animate-fadeIn">
        {activeTab === 'terms' ? (
          <section className="space-y-6 leading-relaxed text-sm md:text-base" style={{ color: 'var(--text-sub)' }}>
            <div>
              <h2 className="text-xl font-bold uppercase mb-2" style={{ color: 'var(--primary-color)' }}>1. Aceptación de los términos</h2>
              <p>Al descargar e ingresar a la aplicación Caminos de la Lagunita, aceptas cumplir con estos términos y condiciones de uso.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold uppercase mb-2" style={{ color: 'var(--primary-color)' }}>2. Descripción del servicio</h2>
              <p>La plataforma ofrece herramientas integrales para la gestión digital del condominio, incluyendo control de acceso inteligente, registro de pagos, reservaciones de áreas comunes y reportes de incidentes.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold uppercase mb-2" style={{ color: 'var(--primary-color)' }}>3. Uso de la plataforma</h2>
              <ul className="list-disc ml-5 space-y-2">
                <li>El acceso es personal e intransferible para residentes y personal autorizado.</li>
                <li>El usuario es estrictamente responsable de mantener la confidencialidad de sus credenciales de acceso.</li>
                <li>Queda prohibido el uso de la plataforma para actividades ilegales o que perturben la sana convivencia del condominio.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold uppercase mb-2" style={{ color: 'var(--primary-color)' }}>4. Gestión de pagos</h2>
              <p>La aplicación facilita el registro de pagos, pero la validación final queda a cargo de la administración. Es responsabilidad del residente adjuntar comprobantes legítimos y veraces.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold uppercase mb-2" style={{ color: 'var(--primary-color)' }}>5. Limitación de responsabilidad</h2>
              <p>Caminos de la Lagunita no se hace responsable por:</p>
              <ul className="list-disc ml-5 space-y-2 mt-2">
                <li>Fallas en la conexión a internet o fallas técnicas del dispositivo del usuario.</li>
                <li>Pérdida de dispositivos con sesiones abiertas.</li>
                <li>Acciones de terceros que resulten del mal uso de las credenciales del usuario o códigos QR de acceso.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold uppercase mb-2" style={{ color: 'var(--primary-color)' }}>6. Modificaciones</h2>
              <p>Nos reservamos el derecho de modificar estos términos en cualquier momento para mejorar el servicio. Los cambios significativos serán notificados a través de la aplicación.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold uppercase mb-2" style={{ color: 'var(--primary-color)' }}>7. Jurisdicción</h2>
              <p>Cualquier controversia derivada del uso de la plataforma será resuelta bajo las leyes de la República Bolivariana de Venezuela.</p>
            </div>
          </section>
        ) : (
          <section className="space-y-6 leading-relaxed text-sm md:text-base" style={{ color: 'var(--text-sub)' }}>
            <p>En Caminos de la Lagunita, valoramos tu privacidad. Esta política describe cómo manejamos tu información personal para garantizar transparencia y seguridad.</p>

            <div>
              <h2 className="text-xl font-bold uppercase mb-2" style={{ color: 'var(--primary-color)' }}>1. Información que recopilamos</h2>
              <p className="font-bold mb-1" style={{ color: 'var(--text-color)' }}>• Datos proporcionados por el usuario:</p>
              <p className="mb-3">Nombre, correo electrónico, número de teléfono, número de casa y datos bancarios para registro de pagos.</p>

              <p className="font-bold mb-1" style={{ color: 'var(--text-color)' }}>• Información recopilada automáticamente:</p>
              <p>Dirección IP, tipo de dispositivo (modelo, fabricante), sistema operativo y navegador. Registramos las fechas y horas exactas de acceso a la plataforma por motivos de auditoría y seguridad.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold uppercase mb-2" style={{ color: 'var(--primary-color)' }}>2. Uso de la información</h2>
              <p>Utilizamos tus datos exclusivamente para:</p>
              <ul className="list-disc ml-5 space-y-2 mt-2">
                <li>Gestionar el acceso y fortalecer la seguridad del condominio.</li>
                <li>Procesar, validar y mantener un historial de pagos de mantenimiento.</li>
                <li>Enviar notificaciones importantes, alertas de seguridad y anuncios de la administración.</li>
                <li>Mejorar la funcionalidad y estabilidad técnica de nuestra plataforma.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold uppercase mb-2" style={{ color: 'var(--primary-color)' }}>3. Seguridad de los datos</h2>
              <p>Implementamos rigurosas medidas de seguridad técnicas como encriptación SSL de grado bancario y Row Level Security (RLS) en nuestra infraestructura de Supabase para proteger tu información contra cualquier acceso no autorizado.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold uppercase mb-2" style={{ color: 'var(--primary-color)' }}>4. Compartir información</h2>
              <p>No vendemos, alquilamos ni comercializamos tus datos con terceros. Solo compartimos la información necesaria con la administración del condominio para fines estrictamente operativos.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold uppercase mb-2" style={{ color: 'var(--primary-color)' }}>5. Derechos del usuario</h2>
              <p>Tienes derecho a acceder, rectificar o solicitar la eliminación de tus datos personales enviando una solicitud formal a la administración a través de la sección de Soporte en la App.</p>
            </div>

            <div className="pt-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--icon-bg)' }}>
              <p className="text-xs font-bold uppercase mb-1" style={{ color: 'var(--accent-gold)' }}>Plataforma Oficial</p>
              <p className="text-xs truncate">https://app-condominio-six.vercel.app/</p>
            </div>
          </section>
        )}
      </div>

      <footer className="mt-12 pt-6 border-t text-xs text-center" style={{ color: 'var(--text-sub)', borderColor: 'var(--border-color)' }}>
        © 2024 Caminos de la Lagunita - Gestión Digital de Condominios
      </footer>
    </div>
  );
};
