import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Props {
  onVerified: () => void
}

export const MfaChallenge: React.FC<Props> = ({ onVerified }) => {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async () => {
    setLoading(true)
    setError('')
    try {
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const factor = factors?.all?.find(f => f.status === 'verified')
      if (!factor) throw new Error('No se encontró un factor de 2FA activo')

      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id })
      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: factor.id,
        challengeId: challenge.id,
        code,
      })
      if (verifyError) throw verifyError

      onVerified()
    } catch (err: any) {
      setError(err.message || 'Código incorrecto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)', padding: '20px' }}>
      <div style={{ backgroundColor: 'var(--card-bg)', padding: '40px', borderRadius: '32px', maxWidth: '400px', width: '100%', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid var(--border-color)' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'var(--primary-color)', marginBottom: '20px' }}>verified_user</span>
        <h2 style={{ fontFamily: "' Cinzel', serif", marginBottom: '10px', color: 'var(--primary-color)' }}>Verificación en 2 pasos</h2>
        <p style={{ color: 'var(--text-sub)', marginBottom: '30px', fontSize: '14px' }}>Ingresa el código de 6 dígitos de tu aplicación de autenticación para continuar.</p>

        <div style={{ textAlign: 'left', marginBottom: '25px' }}>
             <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>Código de Verificación</label>
             <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={6}
                placeholder="000000"
                style={{ width: '100%', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--icon-bg)', color: 'var(--text-color)', textAlign: 'center', fontSize: '32px', letterSpacing: '8px', marginTop: '10px', outline: 'none' }}
             />
        </div>

        {error && <p style={{ color: '#ba1a1a', fontSize: '13px', marginBottom: '20px', fontWeight: 600 }}>⚠️ {error}</p>}

        <button
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
            style={{ width: '100%', padding: '18px', backgroundColor: 'var(--primary-color)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 700, fontSize: '16px', cursor: 'pointer', opacity: (loading || code.length !== 6) ? 0.6 : 1 }}
        >
          {loading ? 'Verificando...' : 'Acceder'}
        </button>

        <button
            onClick={() => supabase.auth.signOut()}
            style={{ marginTop: '20px', background: 'none', border: 'none', color: '#ba1a1a', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
        >
            Cancelar y Salir
        </button>
      </div>
    </div>
  )
}
