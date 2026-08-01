import { History } from 'lucide-react'

import {
  outcomeLabelKey,
  type ManagerOverride,
  type Outcome,
} from '@/entities/conversation'
import {
  useTranslation,
  type MessageKey,
  type TranslateFn,
} from '@/shared/i18n'
import { formatDateTime, orDash } from '@/shared/lib'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'

const FIELD_LABELS: Record<ManagerOverride['field'], MessageKey> = {
  outcome: 'conversation.outcome',
  score: 'conversation.score',
  primary_reason: 'conversation.reason',
  employee: 'conversationTable.employee',
}

/**
 * Correction history.
 *
 * An append-only audit trail: nothing is ever updated or deleted, so the list
 * only grows. The `employee` rows are written by `/assign`.
 */
export function OverrideHistory({
  overrides,
}: {
  overrides: ManagerOverride[]
}) {
  const { t } = useTranslation()

  if (overrides.length === 0) return null

  return (
    <Card>
      <CardHeader
        title={t('overrideHistory.title')}
        description={t('overrideHistory.description')}
      />
      <CardBody>
        <ol className="space-y-4">
          {overrides.map((override) => (
            <li key={override.id} className="flex gap-3">
              <span
                aria-hidden
                className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-fg-muted"
              >
                <History className="size-3.5" />
              </span>

              <div className="min-w-0 space-y-0.5">
                <p className="text-[13px] leading-5 text-fg">
                  <span className="font-medium">
                    {t(FIELD_LABELS[override.field])}
                  </span>
                  {': '}
                  <span className="text-fg-subtle line-through">
                    {renderValue(override.field, override.old_value, t)}
                  </span>
                  {' → '}
                  <span className="font-medium">
                    {renderValue(override.field, override.new_value, t)}
                  </span>
                </p>
                <p className="text-2xs text-fg-subtle">
                  {orDash(override.overridden_by_name)} ·{' '}
                  {formatDateTime(override.created_at)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </CardBody>
    </Card>
  )
}

/**
 * The backend stores these values as strings. For `outcome` they are enum
 * members and get translated; the rest are shown raw (`""` means "was empty").
 */
function renderValue(
  field: ManagerOverride['field'],
  value: string,
  t: TranslateFn,
): string {
  if (!value) return t('overrideHistory.empty')
  if (field === 'outcome') return t(outcomeLabelKey(value as Outcome))
  return value
}
