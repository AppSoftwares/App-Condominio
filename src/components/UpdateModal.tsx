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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 sm:p-6">
      <div className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-900 shadow-2xl animate-in fade-in zoom-in duration-300"
           style={{ maxHeight: 'calc(100% - 40px)' }}>

        {/* Header con Gradiente Sutil */}
        <div className="bg-gradient-to-b from-cyan-500/10 to-transparent p-6 pb-0 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500/20 ring-1 ring-cyan-400/30">
            <svg className="w-8 h-8 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12" />
              <path d="M18 11l-6 6-6-6" />
              <path d="M5 21h14" />
            </svg>
          </div>
          <h3 className="text-xl font-bold tracking-tight text-white">¡Actualización Lista!</h3>
          <p className="mt-1 text-xs font-medium text-cyan-400 uppercase tracking-widest">Versión {versionName}</p>
        </div>

        {/* Área de Contenido Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
          {releaseLines.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">¿Qué hay de nuevo?</p>
              <ul className="space-y-2.5">
                {releaseLines.map((line, index) => (
                  <li key={index} className="flex items-start gap-3 text-left">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-500" />
                    <span className="text-sm leading-snug text-slate-300 font-medium">
                      {line.replace(/^[•\-*\s]+/, '')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer de Botones Fijos */}
        <div className="p-6 pt-2 bg-slate-900/80 border-t border-white/5 space-y-2">
          <button
            onClick={onUpdate}
            className="flex w-full items-center justify-center rounded-xl bg-cyan-500 py-3.5 text-sm font-bold text-slate-950 shadow-lg active:scale-[0.98] transition-all"
          >
            Actualizar ahora
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Recordar más tarde
          </button>
        </div>
      </div>
    </div>
  );
};
