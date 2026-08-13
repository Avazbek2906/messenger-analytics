import { useSyncExternalStore } from 'react'

/**
 * Reactive `matchMedia`.
 *
 * For the rare case where a breakpoint must change BEHAVIOUR, not just style —
 * picking a docked panel over a modal sheet, for instance. Anything that can be
 * expressed in CSS should stay in CSS.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
