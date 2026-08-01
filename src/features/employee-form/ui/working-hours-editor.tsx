import { Plus, Trash2 } from 'lucide-react'

import type { WorkingHoursEntry } from '@/entities/employee'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Input } from '@/shared/ui/primitives/input'
import { Select } from '@/shared/ui/primitives/select'

const WEEKDAY_KEYS = [
  'weekday.mon',
  'weekday.tue',
  'weekday.wed',
  'weekday.thu',
  'weekday.fri',
  'weekday.sat',
  'weekday.sun',
] as const

/**
 * The shift schedule editor.
 *
 * Only meaningful under attribution mode 2. Times are wall-clock LOCAL in the
 * company timezone, and an `end` earlier than `start` is a legal overnight
 * shift — so no client-side ordering check is applied (docs/02, docs/07).
 *
 * Every `working_hours_*` validation error reports `attr: "working_hours"` with
 * the row index only in the human text, which is why the server message is
 * shown once for the whole editor rather than mapped onto a row.
 */
export function WorkingHoursEditor({
  entries,
  disabled,
  serverError,
  onChange,
}: {
  entries: WorkingHoursEntry[]
  disabled: boolean
  serverError: string | null
  onChange: (entries: WorkingHoursEntry[]) => void
}) {
  const { t } = useTranslation()

  const update = (index: number, part: Partial<WorkingHoursEntry>) =>
    onChange(
      entries.map((entry, i) => (i === index ? { ...entry, ...part } : entry)),
    )

  return (
    <div className="space-y-2">
      {entries.length === 0 ? (
        <p className="text-[13px] text-fg-subtle">
          {t('employeeForm.noShifts')}
        </p>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry, index) => (
            <li key={index} className="flex items-center gap-2">
              <Select
                aria-label={t('employeeForm.weekday')}
                className="h-9 min-w-32 flex-1 text-[13px]"
                disabled={disabled}
                value={String(entry.weekday)}
                onChange={(value) => update(index, { weekday: Number(value) })}
                options={WEEKDAY_KEYS.map((key, weekday) => ({
                  value: String(weekday),
                  label: t(key),
                }))}
              />

              <Input
                type="time"
                aria-label={t('employeeForm.start')}
                className="h-9 w-28 text-[13px]"
                disabled={disabled}
                value={entry.start}
                onChange={(event) =>
                  update(index, { start: event.target.value })
                }
              />
              <span className="text-fg-subtle">—</span>
              <Input
                type="time"
                aria-label={t('employeeForm.end')}
                className="h-9 w-28 text-[13px]"
                disabled={disabled}
                value={entry.end}
                onChange={(event) => update(index, { end: event.target.value })}
              />

              <Button
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                aria-label={t('employeeForm.removeShift')}
                onClick={() => onChange(entries.filter((_, i) => i !== index))}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {serverError ? (
        <p role="alert" className="text-xs text-danger-fg">
          {serverError}
        </p>
      ) : null}

      <Button
        size="sm"
        icon={<Plus />}
        disabled={disabled}
        onClick={() =>
          onChange([...entries, { weekday: 0, start: '09:00', end: '18:00' }])
        }
      >
        {t('employeeForm.addShift')}
      </Button>

      <p className="text-2xs leading-5 text-fg-subtle">
        {t('employeeForm.overnightHint')}
      </p>
    </div>
  )
}
