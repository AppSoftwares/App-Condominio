import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';

export const LegalDocument = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 pt-24" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 font-bold" style={{ color: 'var(--primary-color)' }}>
        <MdArrowBack /> Volver
      </button>

      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-color)' }}>Términos, Condiciones y Privacidad</h1>

      <section className="space-y-6 leading-relaxed" style={{ color: 'var(--text-sub)' }}>
        <div>
          <h2 className="text-xl font-bold uppercase" style={{ color: 'var(--primary-color)' }}>1. Reglas de Uso</h2>
          <p>Esta aplicación es para uso exclusivo de los residentes y personal autorizado de la copropiedad. Queda prohibido el uso de los códigos QR para fines distintos al acceso y seguridad del conjunto.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold uppercase" style={{ color: 'var(--primary-color)' }}>2. Limitación de Responsabilidad</h2>
          <p>La administración no se hace responsable por fallas técnicas en el dispositivo del usuario. El sistema de "Casillero Virtual" exime de responsabilidad al vigilante una vez que el residente firma o escanea la liberación del paquete.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold uppercase" style={{ color: 'var(--primary-color)' }}>3. Política de Privacidad</h2>
          <p>Recopilamos datos básicos (Nombre, Casa, Email) y tokens de notificación. Estos datos nunca serán compartidos con terceros y se utilizan exclusivamente para la gestión operativa del condominio. El usuario puede solicitar la eliminación de su cuenta escribiendo a la administración.</p>
        </div>

        <div>
          <h2 className="text-xl font-bold uppercase" style={{ color: 'var(--primary-color)' }}>4. Cancelación de Cuenta</h2>
          <p>El incumplimiento de las normas de convivencia o el uso indebido de la plataforma resultará en la suspensión inmediata del acceso digital, sin perjuicio de las sanciones establecidas en el reglamento de copropiedad.</p>
        </div>
      </section>

      <footer className="mt-12 pt-6 border-t text-xs text-center" style={{ color: 'var(--text-sub)', borderColor: 'var(--border-color)' }}>
        © 2024 Caminos de la Lagunita - Gestión Digital de Condominios
      </footer>
    </div>
  );
};
