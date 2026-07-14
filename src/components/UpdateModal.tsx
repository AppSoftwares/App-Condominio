import React from 'react';

interface UpdateModalProps {
  isOpen: boolean;
  versionName: string;
  onUpdate: () => void;
  onClose: () => void;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  isOpen,
  versionName,
  onUpdate,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-6">
      <div className="w-full max-w-[280px] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-5 text-center">
          <h3 className="text-lg font-bold text-slate-900 mb-1">¡Actualización!</h3>
          <p className="text-sm text-slate-500">
            Nueva versión disponible ({versionName})
          </p>
        </div>

        <div className="flex flex-col border-t border-slate-100">
          <button
            onClick={onUpdate}
            className="w-full py-3.5 text-sm font-bold text-teal-600 active:bg-slate-50 transition-colors border-b border-slate-100"
          >
            DESCARGAR E INSTALAR
          </button>
          <button
            onClick={onClose}
            className="w-full py-3.5 text-sm font-semibold text-slate-400 active:bg-slate-50 transition-colors"
          >
            MÁS TARDE
          </button>
        </div>
      </div>
    </div>
  );
};
