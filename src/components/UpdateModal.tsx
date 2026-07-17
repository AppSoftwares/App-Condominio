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
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '4px',
          width: '100%',
          maxWidth: '320px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
        }}
      >
        <div style={{ padding: '24px 24px 12px 24px' }}>
          <h2 style={{
            margin: '0 0 16px 0',
            fontSize: '20px',
            fontWeight: 600,
            color: '#212121',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            ¡Actualización Disponible!
          </h2>
          <p style={{
            margin: 0,
            fontSize: '15px',
            color: '#616161',
            lineHeight: '1.5',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            ¡Buenas noticias! Hay disponible una nueva versión <span style={{ fontWeight: 700, color: '#000' }}>v{versionName}</span> de la App.
          </p>
        </div>

        <div style={{
          padding: '8px 16px 16px 16px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 700,
              color: '#00796B',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            CANCELAR
          </button>
          <button
            onClick={onUpdate}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 700,
              color: '#00796B',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            ACTUALIZAR
          </button>
        </div>
      </div>
    </div>
  );
};
