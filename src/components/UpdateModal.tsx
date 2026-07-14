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
  onUpdate,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="w-full max-w-[320px] bg-white rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2">¡Actualización Disponible!</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            ¡Buenas noticias! Hay disponible una nueva versión de la App ({versionName}).
          </p>
        </div>

        <div className="flex justify-end gap-4 px-6 pb-6">
          <button
            onClick={onClose}
            className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-wide"
          >
            CANCELAR
          </button>
          <button
            onClick={onUpdate}
            className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-wide"
          >
            ACTUALIZAR
          </button>
        </div>
      </div>
    </div>
  );
};
