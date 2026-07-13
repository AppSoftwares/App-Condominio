import React from 'react';

interface UpdateModalProps {
  isOpen: boolean;
  versionName: string;
  releaseNotes?: string;
  onUpdate: () => void;
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  versionName,
  releaseNotes,
  onUpdate,
  onClose
}) => {
  if (!isOpen) return null;

  const releaseLines = releaseNotes?.split('\n').map(line => line.trim()).filter(Boolean) ?? [];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/95 text-white shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.18),_transparent_55%)]" />

        <div className="relative flex-1 overflow-y-auto p-6 pt-10 scrollbar-hide">
          <div className="mx-auto mb-6 flex h-20 w-24 items-center justify-center rounded-[28px] bg-cyan-500/10 ring-1 ring-cyan-400/20 shadow-[0_24px_60px_rgba(20,184,166,0.18)]">
            <svg className="w-10 h-10 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12" />
              <path d="M18 11l-6 6-6-6" />
              <path d="M5 21h14" />
            </svg>
          </div>

          <h3 className="text-center text-2xl font-semibold tracking-tight text-white">¡Actualización disponible!</h3>
          <p className="mt-2 text-center text-sm text-slate-300">
            Versión: <span className="font-semibold text-cyan-300">{versionName}</span>
          </p>

          {releaseLines.length > 0 && (
            <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-900/80 p-5 shadow-[0_20px_45px_rgba(0,0,0,0.14)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 mb-4">Novedades:</p>
              <ul className="space-y-3 text-sm text-slate-200">
                {releaseLines.map((line, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="mt-1.5 inline-flex h-2 w-2 flex-shrink-0 rounded-full bg-cyan-300" />
                    <span>{line.replace(/^[•\-*\s]+/, '')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="relative p-6 pt-0 mt-2 bg-slate-950/95 grid gap-3 border-t border-white/5">
          <button
            onClick={onUpdate}
            className="w-full rounded-2xl bg-cyan-500 px-5 py-3.5 text-base font-semibold text-slate-950 shadow-[0_20px_40px_rgba(20,184,166,0.28)] transition hover:bg-cyan-400 active:scale-95"
          >
            Actualizar ahora
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300 hover:text-white active:scale-95"
          >
            Más tarde
          </button>
        </div>
      </div>
    </div>
  );
};
