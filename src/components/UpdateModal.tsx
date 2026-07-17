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
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-[320px] bg-white rounded-sm shadow-xl animate-in zoom-in-95 duration-200">
        <div className="p-6 pb-4">
          <h3 className="text-xl font-medium text-gray-900 mb-3">
            ¡Actualización Disponible!
          </h3>
          <p className="text-[15px] leading-relaxed text-gray-600">
            ¡Buenas noticias! Hay disponible una nueva versión <span className="font-semibold text-gray-800">v{versionName}</span> de la App.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 p-2 px-4 pb-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-teal-700 uppercase tracking-wide active:bg-gray-100 transition-colors rounded"
          >
            MÁS TARDE
          </button>
          <button
            onClick={onUpdate}
            className="px-4 py-2 text-sm font-bold text-teal-700 uppercase tracking-wide active:bg-gray-100 transition-colors rounded"
          >
            ACTUALIZAR
          </button>
        </div>
      </div>
    </div>
  );
};
