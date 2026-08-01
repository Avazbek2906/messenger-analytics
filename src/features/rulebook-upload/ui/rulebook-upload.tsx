import { AlertTriangle, CheckCircle2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'

import { useRulebookStatus, useUploadRulebook } from '@/entities/catalog'
import { useTranslation, type MessageKey } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'

import { checkRulebookFile } from '../model/validate-file'

/**
 * Rulebook upload with status polling.
 *
 * There is no update endpoint: changing the rules means uploading a new file,
 * which generates a fresh prompt version and deactivates the previous one. The
 * button is therefore labelled "upload", never "edit" (docs/04).
 */
export function RulebookUpload() {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  const [localError, setLocalError] = useState<MessageKey | null>(null)
  const [warning, setWarning] = useState<MessageKey | null>(null)
  const [trackedId, setTrackedId] = useState<string | null>(null)
  const [startedAt, setStartedAt] = useState(0)

  const upload = useUploadRulebook()
  const tracked = useRulebookStatus(trackedId, startedAt)

  const pick = (file: File | undefined) => {
    if (!file) return

    const check = checkRulebookFile(file)
    setLocalError(check.error)
    setWarning(check.warning)
    if (check.error) return

    upload.mutate(file, {
      onSuccess: (row) => {
        setTrackedId(row.id)
        setStartedAt(Date.now())
      },
    })
  }

  const status = tracked.data?.status

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        accept=".pdf,.docx,.xlsx,.doc,.xls"
        onChange={(event) => {
          pick(event.target.files?.[0])
          // Reset so picking the same file twice fires a change event again.
          event.target.value = ''
        }}
      />

      <Button
        variant="primary"
        icon={<Upload />}
        loading={upload.isPending}
        onClick={() => inputRef.current?.click()}
      >
        {t('rulebook.upload')}
      </Button>

      <p className="text-xs leading-5 text-fg-subtle">
        {t('rulebook.formats')}
      </p>

      {localError ? (
        <Notice tone="danger" text={t(localError)} />
      ) : warning ? (
        <Notice tone="warning" text={t(warning)} />
      ) : null}

      {upload.isError ? (
        <Notice tone="danger" text={t('rulebook.uploadFailed')} />
      ) : null}

      {trackedId && status !== 'ready' && status !== 'error' ? (
        <Notice tone="info" text={t('rulebook.processing')} />
      ) : null}

      {status === 'ready' ? (
        <Notice tone="success" text={t('rulebook.ready')} />
      ) : null}

      {status === 'error' ? (
        <Notice
          tone="danger"
          // The backend writes these messages for humans and they are
          // actionable ("re-save as .docx"), so they are shown verbatim.
          text={tracked.data?.error || t('rulebook.processingFailed')}
        />
      ) : null}
    </div>
  )
}

const TONES = {
  danger: 'bg-danger-soft text-danger-fg',
  warning: 'bg-warning-soft text-warning-fg',
  info: 'bg-info-soft text-info-fg',
  success: 'bg-success-soft text-success-fg',
} as const

function Notice({ tone, text }: { tone: keyof typeof TONES; text: string }) {
  const Icon = tone === 'success' ? CheckCircle2 : AlertTriangle

  return (
    <p
      role={tone === 'danger' ? 'alert' : undefined}
      aria-live="polite"
      className={`flex items-start gap-2 rounded-md px-3 py-2 text-xs leading-5 ${TONES[tone]}`}
    >
      <Icon className="mt-px size-3.5 shrink-0" aria-hidden />
      {text}
    </p>
  )
}
