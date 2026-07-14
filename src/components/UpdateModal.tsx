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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 p-2">
      <div className="relative flex w-[260px] flex-col overflow-hidden rounded-[20px] bg-slate-900 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-200">

        {/* Header - Minimalista y 50% más pequeño */}
        <div className="p-3 pb-1 text-center">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20">
            <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 3v12" /><path d="M18 11l-6 6-6-6" /><path d="M5 21h14" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-white leading-none">Nueva Versión</h3>
          <p className="mt-1 text-[9px] font-black text-cyan-400 tracking-tighter">V{versionName}</p>
        </div>

        {/* Novedades - Muy compacto y scrollable */}
        <div className="max-h-[120px] overflow-y-auto px-4 py-2 scrollbar-hide border-y border-white/5">
          <ul className="space-y-1.5">
            {releaseLines.map((line, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-cyan-500" />
                <span className="text-[10px] leading-tight text-slate-300 font-semibold">
                  {line.replace(/^[•\-*\s]+/, '')}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Botones - Redimensionados */}
        <div className="p-3 pt-2 space-y-1.5">
          <button
            onClick={onUpdate}
            className="w-full rounded-lg bg-cyan-500 py-2 text-[11px] font-black text-slate-950 active:scale-95 transition-all"
          >
            ACTUALIZAR AHORA
          </button>
          <button
            onClick={onClose}
            className="w-full py-1 text-[9px] font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest"
          >
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  );
};
