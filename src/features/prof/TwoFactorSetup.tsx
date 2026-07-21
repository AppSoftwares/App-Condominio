import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'

interface Props {
  onClose: () => void
  onEnabled: () => void
}

export const TwoFactorSetup: React.FC<Props> = ({ onClose, onEnabled }) => {
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [factorId, setFactorId] = useState<string | null>(null)
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'start' | 'verify'>('start')
  const [loading, setLoading] = useState(false)

  const handleStart = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })
      if (error) throw error
      setQrCode(data.totp.qr_code)
      setFactorId(data.id)
      setStep('verify')
    } catch (err: any) {
      alert('Error iniciando 2FA: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!factorId) return
    setLoading(true)
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId })
      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      })
      if (verifyError) throw verifyError

      alert('Verificación en 2 pasos activada correctamente')
      onEnabled()
      onClose()
    } catch (err: any) {
      alert('Código incorrecto o expirado: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      {step === 'start' ? (
        <>
          <p style={{ color: 'var(--text-sub)', marginBottom: '25px', fontSize: '14px' }}>
            Aumenta la seguridad de tu cuenta activando la verificación en 2 pasos. Necesitarás una aplicación como Google Authenticator o Authy.
          </p>
          <button
            onClick={handleStart}
            disabled={loading}
            style={{ width: '100%', padding: '15px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            {loading ? 'Iniciando...' : 'Comenzar Configuración'}
          </button>
        </>
      ) : (
        <>
          <p style={{ color: 'var(--text-sub)', marginBottom: '20px', fontSize: '14px' }}>
            Escanea este código QR con tu aplicación de autenticación:
          </p>
          {qrCode && (
            <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '15px', display: 'inline-block', marginBottom: '20px', border: '1px solid #eee' }}>
              <QRCodeSVG value={qrCode} size={180} />
            </div>
          )}
          <div style={{ textAlign: 'left', marginBottom: '20px' }}>
             <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>Código de 6 dígitos</label>
             <input
                type="text"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)', textAlign: 'center', fontSize: '24px', letterSpacing: '5px', marginTop: '10px' }}
             />
          </div>
          <button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            style={{ width: '100%', padding: '15px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', opacity: (loading || code.length !== 6) ? 0.6 : 1 }}
          >
            {loading ? 'Verificando...' : 'Activar Verificación'}
          </button>
        </>
      )}
    </div>
  )
}
