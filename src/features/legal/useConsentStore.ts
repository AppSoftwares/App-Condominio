import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { capacitorStorage } from '../../shared/lib/capacitorStorage'
import { LEGAL_VERSIONS } from './consentConfig'

interface ConsentState {
  hydrated: boolean
  decided: boolean
  diagnostics: boolean
  policyVersion: string | null
  decidedAt: string | null
  acceptAll: () => void
  rejectOptional: () => void
  save: (p: { diagnostics: boolean }) => void
  setHydrated: () => void
}

const stamp = () => ({ decided: true, policyVersion: LEGAL_VERSIONS.cookies, decidedAt: new Date().toISOString() })

export const useConsentStore = create<ConsentState>()(persist((set) => ({
  hydrated: false,
  decided: false,
  diagnostics: false,
  policyVersion: null,
  decidedAt: null,
  acceptAll: () => set({ diagnostics: true, ...stamp() }),
  rejectOptional: () => set({ diagnostics: false, ...stamp() }),
  save: ({ diagnostics }) => set({ diagnostics, ...stamp() }),
  setHydrated: () => set({ hydrated: true }),
}), {
  name: 'consent-v1',
  storage: createJSONStorage(() => capacitorStorage),
  partialize: (s) => ({ decided: s.decided, diagnostics: s.diagnostics, policyVersion: s.policyVersion, decidedAt: s.decidedAt }),
  onRehydrateStorage: () => (state) => state?.setHydrated(),
}))

export const needsConsentDecision = (s: ConsentState) =>
  s.hydrated && (!s.decided || s.policyVersion !== LEGAL_VERSIONS.cookies)
