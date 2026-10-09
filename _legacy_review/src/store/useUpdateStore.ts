import create from 'zustand'

type UpdateState = {
  isUpdateAvailable: boolean
  versionName?: string | null
  setAvailable: (v: boolean, version?: string | null) => void
}

export const useUpdateStore = create<UpdateState>((set) => ({
  isUpdateAvailable: false,
  versionName: null,
  setAvailable: (v, version) => set({ isUpdateAvailable: v, versionName: version ?? null })
}))
