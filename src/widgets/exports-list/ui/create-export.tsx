import { FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'

import { useCreateExport, type ExportKind } from '@/entities/export'
import type { PeriodParams } from '@/shared/api'
import { useTranslation, type MessageKey } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Segmented } from '@/shared/ui/primitives/segmented'

const KINDS = [
  { value: 'conversations', labelKey: 'reports.kindConversations' },
  { value: 'ratings', labelKey: 'reports.kindRatings' },
] as const satisfies readonly { value: ExportKind; labelKey: MessageKey }[]

/**
 * Queues an export job.
 *
 * Duplicate submissions are NOT deduplicated server-side — two identical POSTs
 * build two files — so the button is disabled while a request is in flight
 * (docs/06). There is no PDF and no format option: `.xlsx` is the only output.
 */
export function CreateExport({ period }: { period: PeriodParams }) {
  const { t } = useTranslation()
  const [kind, setKind] = useState<ExportKind>('conversations')
  const create = useCreateExport()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Segmented
        aria-label={t('reports.kind')}
        size="sm"
        value={kind}
        onChange={setKind}
        options={KINDS.map((item) => ({
          value: item.value,
          label: t(item.labelKey),
        }))}
      />

      <Button
        variant="primary"
        size="sm"
        icon={<FileSpreadsheet />}
        loading={create.isPending}
        onClick={() => create.mutate({ kind, ...period })}
      >
        {t('reports.create')}
      </Button>
    </div>
  )
}
