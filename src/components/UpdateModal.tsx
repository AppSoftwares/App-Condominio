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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
            ¡Actualización disponible!
          </h3>

          <p className="text-center text-gray-500 dark:text-gray-400 mb-4">
            La versión <span className="font-semibold text-blue-600">{versionName}</span> ya está lista para descargar.
          </p>

          {releaseNotes && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Novedades:</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                {releaseNotes}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={onUpdate}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
            >
              Actualizar ahora
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 px-4 text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Más tarde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
