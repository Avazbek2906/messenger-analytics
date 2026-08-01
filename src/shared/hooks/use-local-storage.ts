import { useCallback, useState } from 'react'

/**
 * State kept in sync with `localStorage`.
 * Falls back silently to in-memory state on private-mode or quota errors.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored === null ? initialValue : (JSON.parse(stored) as T)
    } catch {
      return initialValue
    }
  })

  const set = useCallback(
    (next: T) => {
      setValue(next)
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        /* ignore */
      }
    },
    [key],
  )

  return [value, set]
}
