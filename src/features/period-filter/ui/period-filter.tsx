import * as Popover from '@radix-ui/react-popover'
import { CalendarRange, Check } from 'lucide-react'
import { useState } from 'react'

import { useTranslation } from '@/shared/i18n'
import { formatDate, toApiDate } from '@/shared/lib'
import { Button } from '@/shared/ui/primitives/button'
import { Field, Input } from '@/shared/ui/primitives/input'
import { Segmented } from '@/shared/ui/primitives/segmented'
import { Switch } from '@/shared/ui/primitives/switch'

import { PERIOD_PRESETS, type PeriodState } from '../model/use-period'

/**
 * The period filter control.
 *
 * A page renders exactly ONE of these and passes its state to every widget, so
 * the numbers on screen can never belong to different windows.
 */
export function PeriodFilter({ period }: { period: PeriodState }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Segmented
        aria-label={t('period.select')}
        value={period.preset}
        onChange={(value) => {
          if (value !== 'custom') period.setPreset(value)
        }}
        options={[
          ...PERIOD_PRESETS.map((preset) => ({
            value: preset.value,
            label: t(preset.labelKey),
          })),
          ...(period.preset === 'custom'
            ? [{ value: 'custom' as const, label: t('period.custom') }]
            : []),
        ]}
      />

      <CustomRangePopover period={period} />
      <ConfirmedPopover period={period} />
    </div>
  )
}

/* --------------------------------------------------------- Maxsus davr */

function CustomRangePopover({ period }: { period: PeriodState }) {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          size="sm"
          icon={<CalendarRange />}
          aria-label={t('period.pick')}
        >
          <span className="hidden sm:inline">
            {formatDate(period.range.from)} — {formatDate(period.range.to)}
          </span>
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-72 rounded-lg bg-surface p-4 shadow-popover ring-1 ring-line"
        >
          {/* The form restarts from the current period on every open: Radix
              unmounts the content on close, so the state cannot go stale. */}
          <CustomRangeForm period={period} onApply={() => setOpen(false)} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

function CustomRangeForm({
  period,
  onApply,
}: {
  period: PeriodState
  onApply: () => void
}) {
  const { t } = useTranslation()
  const [from, setFrom] = useState(() => toApiDate(period.range.from))
  const [to, setTo] = useState(() => toApiDate(period.range.to))

  const invalid = Boolean(from && to && from > to)
  const incomplete = !from || !to

  const apply = () => {
    if (invalid || incomplete) return
    period.setRange({
      from: new Date(`${from}T00:00:00`),
      to: new Date(`${to}T00:00:00`),
    })
    onApply()
  }

  return (
    <>
      <p className="mb-3 text-[13px] font-medium text-fg">
        {t('period.customTitle')}
      </p>

      <div className="space-y-3">
        <Field label={t('period.from')}>
          {(field) => (
            <Input
              {...field}
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => setFrom(event.target.value)}
            />
          )}
        </Field>
        <Field
          label={t('period.to')}
          error={invalid ? t('period.invalidRange') : null}
        >
          {(field) => (
            <Input
              {...field}
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => setTo(event.target.value)}
            />
          )}
        </Field>
      </div>

      <Button
        variant="primary"
        size="sm"
        className="mt-4 w-full"
        disabled={invalid || incomplete}
        onClick={apply}
      >
        {t('common.apply')}
      </Button>
    </>
  )
}

/* ------------------------------------------------- Tasdiqlangan natijalar */

function ConfirmedPopover({ period }: { period: PeriodState }) {
  const { t } = useTranslation()

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          size="sm"
          variant={period.confirmed ? 'soft' : 'secondary'}
          icon={period.confirmed ? <Check /> : undefined}
        >
          {t(period.confirmed ? 'period.confirmedOn' : 'period.confirmedOff')}
        </Button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-80 rounded-lg bg-surface p-4 shadow-popover ring-1 ring-line"
        >
          <Switch
            checked={period.confirmed}
            onChange={period.setConfirmed}
            label={t('period.confirmedLabel')}
            description={t('period.confirmedDescription')}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
