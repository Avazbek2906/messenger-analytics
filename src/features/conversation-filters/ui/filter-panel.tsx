import { useProducts, useReasons } from '@/entities/catalog'
import { useEmployees } from '@/entities/employee'
import { useTranslation } from '@/shared/i18n'
import { Field, Input } from '@/shared/ui/primitives/input'
import { Select, type SelectOption } from '@/shared/ui/primitives/select'

import type { ConversationFilterState } from '../model/use-conversation-filters'
import {
  ALL_VALUE,
  ATTRIBUTION_OPTIONS,
  OUTCOME_OPTIONS,
  SENTIMENT_OPTIONS,
} from './filter-options'

/**
 * The advanced filter panel.
 *
 * Progressive disclosure: the everyday filters stay visible above, everything
 * else lives in this panel — nobody should face 15 controls at once.
 */
export function FilterPanel({ filters }: { filters: ConversationFilterState }) {
  const { t } = useTranslation()

  const employees = useEmployees()
  const reasons = useReasons()
  const products = useProducts()

  const anyOption = { value: ALL_VALUE, label: t('conversationFilters.any') }

  const toOptions = <T,>(
    items: T[] | undefined,
    getValue: (item: T) => string,
    getLabel: (item: T) => string,
  ): SelectOption[] => [
    anyOption,
    ...(items ?? []).map((item) => ({
      value: getValue(item),
      label: getLabel(item),
    })),
  ]

  /** `__all__` means "no filter", so it is removed from the URL. */
  const handle =
    (key: Parameters<ConversationFilterState['set']>[0]) => (value: string) =>
      filters.set(key, value === ALL_VALUE ? null : value)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label={t('conversationFilters.employee')}>
        {(field) => (
          <Select
            {...field}
            value={filters.active.employee ?? ALL_VALUE}
            onChange={handle('employee')}
            options={toOptions(
              employees.data?.results,
              (employee) => employee.id,
              (employee) => employee.full_name,
            )}
          />
        )}
      </Field>

      <Field label={t('conversationFilters.outcome')}>
        {(field) => (
          <Select
            {...field}
            value={filters.active.outcome ?? ALL_VALUE}
            onChange={handle('outcome')}
            options={[
              anyOption,
              ...OUTCOME_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              })),
            ]}
          />
        )}
      </Field>

      <Field label={t('conversationFilters.sentiment')}>
        {(field) => (
          <Select
            {...field}
            value={filters.active.sentiment ?? ALL_VALUE}
            onChange={handle('sentiment')}
            options={[
              anyOption,
              ...SENTIMENT_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              })),
            ]}
          />
        )}
      </Field>

      <Field label={t('conversationFilters.attribution')}>
        {(field) => (
          <Select
            {...field}
            value={filters.active.attribution_source ?? ALL_VALUE}
            onChange={handle('attribution_source')}
            options={[
              anyOption,
              ...ATTRIBUTION_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.labelKey),
              })),
            ]}
          />
        )}
      </Field>

      <Field label={t('conversationFilters.product')}>
        {(field) => (
          <Select
            {...field}
            value={filters.active.product ?? ALL_VALUE}
            onChange={handle('product')}
            options={toOptions(
              products.data?.results,
              (product) => product.id,
              (product) => product.name,
            )}
          />
        )}
      </Field>

      <Field label={t('conversationFilters.reason')}>
        {(field) => (
          <Select
            {...field}
            value={filters.active.reason ?? ALL_VALUE}
            onChange={handle('reason')}
            options={toOptions(
              reasons.data,
              (reason) => reason.id,
              (reason) => reason.label,
            )}
          />
        )}
      </Field>

      <Field
        label={t('conversationFilters.scoreRange')}
        hint={t('conversationFilters.scoreRangeHint')}
      >
        {(field) => (
          <div className="flex items-center gap-2">
            <Input
              {...field}
              type="number"
              min={0}
              max={100}
              inputMode="numeric"
              placeholder="0"
              value={filters.active.score_min ?? ''}
              onChange={(event) =>
                filters.set('score_min', event.target.value || null)
              }
            />
            <span className="text-fg-subtle">—</span>
            <Input
              type="number"
              min={0}
              max={100}
              inputMode="numeric"
              placeholder="100"
              aria-label={t('conversationFilters.scoreMax')}
              value={filters.active.score_max ?? ''}
              onChange={(event) =>
                filters.set('score_max', event.target.value || null)
              }
            />
          </div>
        )}
      </Field>

      <Field label={t('conversationFilters.closedRange')}>
        {(field) => (
          <div className="flex items-center gap-2">
            <Input
              {...field}
              type="date"
              value={filters.active.closed_from?.slice(0, 10) ?? ''}
              onChange={(event) =>
                filters.set('closed_from', event.target.value || null)
              }
            />
            <span className="text-fg-subtle">—</span>
            <Input
              type="date"
              aria-label={t('conversationFilters.closedTo')}
              value={filters.active.closed_to?.slice(0, 10) ?? ''}
              onChange={(event) =>
                filters.set('closed_to', event.target.value || null)
              }
            />
          </div>
        )}
      </Field>
    </div>
  )
}
