import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../../app/store/useAuthStore'
import { supabase } from '../../shared/lib/supabase'
import { LEGAL_VERSIONS } from './consentConfig'
import { ConsentCheckbox } from './ConsentCheckbox'
import { LegalLink } from './LegalLink'

export const ConsentGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const [needsConsent, setNeedsConsent] = useState<boolean | null>(null)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [confirmAdult, setConfirmAdult] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) {
      setNeedsConsent(false)
      return
    }
    void (async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('terms_version, privacy_version').eq('id', user.id).maybeSingle()
        if (error) {
          // Si la columna aún no existe en Supabase, no bloquear al usuario
          setNeedsConsent(false)
          return
        }
        if (!data || data.terms_version !== LEGAL_VERSIONS.terms || data.privacy_version !== LEGAL_VERSIONS.privacy) {
          setNeedsConsent(true)
        } else {
          setNeedsConsent(false)
        }
      } catch {
        setNeedsConsent(false)
      }
    })()
  }, [user])

  const handleAccept = async () => {
    if (!acceptTerms || !confirmAdult) {
      setError('Debes aceptar los términos y confirmar que eres mayor de edad para continuar.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error: rpcError } = await supabase.rpc('rpc_accept_legal', {
        p_terms: LEGAL_VERSIONS.terms,
        p_privacy: LEGAL_VERSIONS.privacy,
        p_app_version: '2.5.2',
        p_platform: 'web'
      })

      if (rpcError) {
        const { error: updateError } = await supabase.from('profiles').update({
          terms_version: LEGAL_VERSIONS.terms,
          privacy_version: LEGAL_VERSIONS.privacy,
          legal_accepted_at: new Date().toISOString()
        }).eq('id', user?.id)

        if (updateError) {
          console.warn('Columnas legales aún no migradas en Supabase, permitiendo acceso:', updateError.message)
        }
      }

      setNeedsConsent(false)
    } catch (err: any) {
      setNeedsConsent(false)
    } finally {
      setLoading(false)
    }
  }

  if (needsConsent) {
    return (
      <div role="dialog" aria-modal="true" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', borderRadius: '28px', width: '100%', maxWidth: '480px', padding: '32px', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>
          <h2 style={{ fontSize: '22px', fontFamily: "'EB Garamond', serif", color: 'var(--primary-color)', margin: '0 0 12px 0' }}>Actualización de Términos y Privacidad</h2>
          <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--text-sub)', marginBottom: '20px' }}>
            Hemos actualizado nuestros <LegalLink doc="terms">Términos y Condiciones</LegalLink> y nuestra <LegalLink doc="privacy">Política de Privacidad</LegalLink>. Para continuar utilizando App Condominio, por favor revísalos y acéptalos.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <ConsentCheckbox id="gate-terms" checked={acceptTerms} onChange={setAcceptTerms} required error={error && !acceptTerms ? 'Campo obligatorio' : null}>
              He leído y acepto los <LegalLink doc="terms">Términos y Condiciones</LegalLink> y la <LegalLink doc="privacy">Política de Privacidad</LegalLink>.
            </ConsentCheckbox>
            <ConsentCheckbox id="gate-adult" checked={confirmAdult} onChange={setConfirmAdult} required error={error && !confirmAdult ? 'Campo obligatorio' : null}>
              Declaro que soy mayor de 18 años.
            </ConsentCheckbox>
          </div>

          {error && <p role="alert" style={{ color: '#ba1a1a', fontSize: '13px', marginBottom: '16px' }}>{error}</p>}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => signOut()}
              style={{ flex: 1, padding: '16px', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', color: 'var(--text-color)' }}
            >
              Cerrar sesión
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={handleAccept}
              style={{ flex: 1, padding: '16px', background: 'var(--primary-color)', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', color: 'white' }}
            >
              {loading ? 'Guardando...' : 'Aceptar y continuar'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
