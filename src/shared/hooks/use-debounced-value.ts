import { useEffect, useState } from 'react'

/**
 * Returns the value after a delay.
 *
 * Keeps a search box from firing one request per keystroke — the
 * `debounce-throttle` rule.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
