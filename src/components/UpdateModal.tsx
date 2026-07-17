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
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '2px',
          width: '100%',
          maxWidth: '300px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          padding: '24px 24px 12px 24px',
          boxSizing: 'border-box'
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 500, color: '#000' }}>
          ¡Actualización Disponible!
        </h3>
        <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#444', lineHeight: '1.4' }}>
          ¡Buenas noticias! Hay disponible una nueva versión <span style={{fontWeight:600}}>v{versionName}</span> de la App.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 4px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#00897B',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            MÁS TARDE
          </button>
          <button
            onClick={onUpdate}
            style={{
              padding: '8px 4px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#00897B',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            ACTUALIZAR
          </button>
        </div>
      </div>
    </div>
  );
};
