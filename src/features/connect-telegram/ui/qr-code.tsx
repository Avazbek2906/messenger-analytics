import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

import { useTranslation } from '@/shared/i18n'
import { Skeleton } from '@/shared/ui/primitives/skeleton'

/**
 * Renders a `tg://login?token=…` payload as a QR code.
 *
 * The token rotates about every 30 seconds, so this re-renders whenever the
 * url changes — a stale code simply will not scan (docs/07).
 */
export function QrCode({ value }: { value: string }) {
  const { t } = useTranslation()
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void QRCode.toDataURL(value, {
      width: 480,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0f172a', light: '#ffffff' },
    }).then((url) => {
      if (!cancelled) setDataUrl(url)
    })

    return () => {
      cancelled = true
    }
  }, [value])

  if (!dataUrl) return <Skeleton className="size-56 rounded-xl" />

  return (
    <img
      src={dataUrl}
      alt={t('telegram.qrAlt')}
      className="size-56 rounded-xl ring-1 ring-line"
    />
  )
}
