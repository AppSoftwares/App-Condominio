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
        padding: '24px',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          width: '100%',
          maxWidth: '300px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          padding: '24px',
          boxSizing: 'border-box'
        }}
      >
        <h3 style={{ margin: '0 0 12px 0', fontSize: '19px', fontWeight: 600, color: '#212121', fontFamily: 'sans-serif' }}>
          ¡Actualización Disponible!
        </h3>
        <p style={{ margin: '0 0 24px 0', fontSize: '15px', color: '#616161', lineHeight: '1.5', fontFamily: 'sans-serif' }}>
          ¡Buenas noticias! Hay disponible una nueva versión <span style={{fontWeight:700, color:'#000'}}>v{versionName}</span> de la App.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 12px',
              fontSize: '14px',
              fontWeight: 700,
              color: '#00796B',
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
              padding: '10px 12px',
              fontSize: '14px',
              fontWeight: 700,
              color: '#00796B',
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
