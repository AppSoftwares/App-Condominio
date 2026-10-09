import { Network } from '@capacitor/network'
import { supabase } from '../../shared/lib/supabase'
import { isBiometricEnabled } from '../../shared/lib/biometrics'
import { useAuthStore } from '../store/useAuthStore'
import { useThemeStore } from '../store/useThemeStore'

export const BOOT_TIMEOUT_MS = 7000            // rango pedido: 6-8 s

export class BootTimeoutError extends Error {
  constructor(ms: number) { super(`Boot timeout tras ${ms} ms`); this.name = 'BootTimeoutError' }
}

export function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let id: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, rej) => { id = setTimeout(() => rej(new BootTimeoutError(ms)), ms) })
  return Promise.race([p, timeout]).finally(() => { if (id) clearTimeout(id) })
}

type Persisted = { persist: { hasHydrated(): boolean; onFinishHydration(cb: () => void): () => void } }
const waitForHydration = (s: Persisted) => new Promise<void>((resolve) => {
  if (s.persist.hasHydrated()) return resolve()
  const un = s.persist.onFinishHydration(() => { un(); resolve() })
})

export interface BootResult {
  status: 'ready' | 'degraded'
  reason?: 'timeout' | 'offline' | 'error'
  hasSession: boolean
  locked: boolean                    // bloqueo biometrico ANTES del primer render protegido
}

export const FALLBACK_BOOT: BootResult = { status: 'degraded', reason: 'error', hasSession: false, locked: false }

export async function bootstrapApp(): Promise<BootResult> {
  try {
    const [, , sessionRes, biometric, net] = await withTimeout(
      Promise.all([
        waitForHydration(useAuthStore as unknown as Persisted),
        waitForHydration(useThemeStore as unknown as Persisted),
        supabase.auth.getSession(),                          // puede intentar refrescar token -> por eso el timeout
        isBiometricEnabled().catch(() => false),
        Network.getStatus().catch(() => ({ connected: true })),
      ]),
      BOOT_TIMEOUT_MS,
    )
    const hasSession = !!sessionRes.data.session
    const persistedUser = !!useAuthStore.getState().user
    return {
      status: net.connected ? 'ready' : 'degraded',
      reason: net.connected ? undefined : 'offline',
      hasSession,
      locked: biometric && persistedUser && hasSession,
    }
  } catch (err) {
    // Timeout o error: NO bloquear. Fallback seguro: mantener bloqueo si corresponde.
    const bio = await isBiometricEnabled().catch(() => false)     // lectura local, rapida
    const persistedUser = !!useAuthStore.getState().user
    return {
      status: 'degraded',
      reason: err instanceof BootTimeoutError ? 'timeout' : 'error',
      hasSession: persistedUser,
      locked: bio && persistedUser,
    }
  }
}
