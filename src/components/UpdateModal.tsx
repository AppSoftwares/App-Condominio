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
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: '24px'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          width: '100%',
          maxWidth: '310px',
          borderRadius: '4px',
          boxShadow: '0 11px 15px -7px rgba(0,0,0,0.2), 0 24px 38px 3px rgba(0,0,0,0.14), 0 9px 46px 8px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ padding: '24px 24px 10px' }}>
          <h3 style={{
            margin: '0 0 12px',
            fontSize: '20px',
            fontWeight: 500,
            color: '#212121',
            fontFamily: 'Roboto, sans-serif'
          }}>
            ¡Actualización Disponible!
          </h3>
          <p style={{
            margin: 0,
            fontSize: '16px',
            color: '#757575',
            lineHeight: '1.4',
            fontFamily: 'Roboto, sans-serif'
          }}>
            ¡Buenas noticias! Hay disponible una nueva versión <span style={{ fontWeight: 'bold' }}>v{versionName}</span> de la App.
          </p>
        </div>

        <div style={{
          padding: '8px 8px 8px 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '4px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 12px',
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
