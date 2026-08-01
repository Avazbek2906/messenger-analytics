import { AlertTriangle, Check, Copy } from 'lucide-react'
import { useState } from 'react'

import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Dialog } from '@/shared/ui/primitives/dialog'

/**
 * Shows a freshly minted widget key.
 *
 * This is the ONLY moment the full key is ever visible — listings return it
 * masked and there is no way to read it back. Anyone holding it can post
 * fabricated messages, so the warning is explicit and the key must live on the
 * customer's server, never in page JavaScript (docs/07).
 */
export function WidgetKeyDialog({
  widgetKey,
  onClose,
}: {
  widgetKey: string | null
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!widgetKey) return
    try {
      await navigator.clipboard.writeText(widgetKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — the key is selectable on screen anyway */
    }
  }

  return (
    <Dialog
      open={widgetKey !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={t('web.keyTitle')}
      description={t('web.keyDescription')}
      footer={
        <Button variant="primary" onClick={onClose}>
          {t('web.keySaved')}
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg bg-surface-sunken px-3 py-2.5">
          <code className="min-w-0 flex-1 font-mono text-[13px] break-all text-fg">
            {widgetKey}
          </code>
          <Button
            size="icon-sm"
            variant="ghost"
            aria-label={t('web.copyKey')}
            onClick={() => void copy()}
          >
            {copied ? <Check className="text-success" /> : <Copy />}
          </Button>
        </div>

        <p className="flex items-start gap-2 rounded-md bg-danger-soft px-3 py-2.5 text-xs leading-5 text-danger-fg">
          <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
          {t('web.keyWarning')}
        </p>
      </div>
    </Dialog>
  )
}
