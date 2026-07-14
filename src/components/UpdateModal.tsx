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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="relative flex w-full max-w-xs flex-col overflow-hidden rounded-[24px] border border-white/10 bg-slate-900 shadow-2xl animate-in fade-in zoom-in duration-300"
           style={{ maxHeight: '85vh' }}>

        {/* Header - Muy compacto */}
        <div className="p-5 pb-2 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 ring-1 ring-cyan-400/30">
            <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12" /><path d="M18 11l-6 6-6-6" /><path d="M5 21h14" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-white leading-tight">¡Nueva versión lista!</h3>
          <p className="mt-0.5 text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em]">v{versionName}</p>
        </div>

        {/* Área de Novedades - Scrollable y compacta */}
        <div className="flex-1 overflow-y-auto px-5 py-2 scrollbar-hide border-y border-white/5 mx-2">
          {releaseLines.length > 0 && (
            <div className="py-2">
              <ul className="space-y-2">
                {releaseLines.map((line, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-left">
                    <div className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-cyan-500" />
                    <span className="text-xs leading-relaxed text-slate-300 font-medium">
                      {line.replace(/^[•\-*\s]+/, '')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer - Botones siempre visibles */}
        <div className="p-5 pt-3 bg-slate-900 space-y-2">
          <button
            onClick={onUpdate}
            className="w-full rounded-xl bg-cyan-500 py-3 text-sm font-bold text-slate-950 shadow-lg active:scale-95 transition-all"
          >
            ACTUALIZAR AHORA
          </button>
          <button
            onClick={onClose}
            className="w-full py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
          >
            MÁS TARDE
          </button>
        </div>
      </div>
    </div>
  );
};
