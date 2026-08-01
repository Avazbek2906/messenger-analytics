import { create } from 'zustand'

interface AiState {
  /**
   * The deployment has no `GEMINI_API_KEY`.
   *
   * Once any AI endpoint answers `gemini_not_configured`, every later call will
   * fail the same way — so the flag is set once and every AI affordance is
   * hidden for the rest of the session (docs/06).
   */
  unavailable: boolean
  markUnavailable: () => void
}

export const useAiStore = create<AiState>((set) => ({
  unavailable: false,
  markUnavailable: () => set({ unavailable: true }),
}))
