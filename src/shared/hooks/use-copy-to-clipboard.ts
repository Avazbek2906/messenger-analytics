import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Copy-to-clipboard with a self-clearing "copied" flag.
 *
 * `navigator.clipboard` rejects on an insecure origin or a denied permission;
 * that is swallowed on purpose, because every caller also renders the value on
 * screen where it stays selectable by hand.
 */
export function useCopyToClipboard(resetAfterMs = 2000): {
  copied: boolean
  copy: (value: string) => void
} {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = useCallback(
    (value: string) => {
      void navigator.clipboard
        .writeText(value)
        .then(() => {
          setCopied(true)
          clearTimeout(timer.current)
          timer.current = setTimeout(() => setCopied(false), resetAfterMs)
        })
        .catch(() => undefined)
    },
    [resetAfterMs],
  )

  return { copied, copy }
}
