import * as Popover from '@radix-ui/react-popover'
import { ArrowUpDown, RotateCcw, SlidersHorizontal } from 'lucide-react'

import { useTranslation } from '@/shared/i18n'
import { cn } from '@/shared/lib'
import { Badge } from '@/shared/ui/primitives/badge'
import { Button } from '@/shared/ui/primitives/button'
import { Select } from '@/shared/ui/primitives/select'

import type { ConversationFilterState } from '../model/use-conversation-filters'
import { ORDERING_OPTIONS, QUICK_TOGGLES } from './filter-options'
import { FilterPanel } from './filter-panel'
import { FilterSearch } from './filter-search'

const DEFAULT_ORDERING = '-last_message_at'

/**
 * The filter bar.
 *
 * Priority order: search → the manager's daily queues (quick toggles) →
 * sorting → everything else behind a popover.
 */
export function FilterBar({ filters }: { filters: ConversationFilterState }) {
  const { t } = useTranslation()

  // `search` and `ordering` are not "advanced" — they are always visible, so
  // they must not count towards the badge.
  const advancedCount = Object.keys(filters.active).filter(
    (key) => key !== 'search' && key !== 'ordering',
  ).length

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSearch
        value={filters.active.search ?? ''}
        onChange={(value) => filters.set('search', value)}
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {QUICK_TOGGLES.map((toggle) => {
          const enabled = filters.active[toggle.key] === 'true'
          return (
            <Button
              key={toggle.key}
              size="sm"
              variant={enabled ? 'soft' : 'secondary'}
              aria-pressed={enabled}
              onClick={() => filters.set(toggle.key, enabled ? null : 'true')}
            >
              {t(toggle.labelKey)}
            </Button>
          )
        })}
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Select
          value={filters.active.ordering ?? DEFAULT_ORDERING}
          onChange={(value) =>
            filters.set('ordering', value === DEFAULT_ORDERING ? null : value)
          }
          aria-label={t('conversationFilters.ordering')}
          className="h-9 w-auto min-w-44 text-[13px]"
          options={ORDERING_OPTIONS.map((option) => ({
            value: option.value,
            label: (
              <span className="flex items-center gap-1.5">
                <ArrowUpDown className="size-3.5 text-fg-subtle" aria-hidden />
                {t(option.labelKey)}
              </span>
            ),
            textValue: t(option.labelKey),
          }))}
        />

        <Popover.Root>
          <Popover.Trigger asChild>
            <Button size="sm" icon={<SlidersHorizontal />}>
              {t('conversationFilters.more')}
              {advancedCount > 0 ? (
                <Badge tone="brand" size="sm" className="ml-0.5">
                  {advancedCount}
                </Badge>
              ) : null}
            </Button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={8}
              className={cn(
                'z-50 w-[min(34rem,calc(100vw-2rem))] rounded-xl bg-surface p-5 shadow-popover ring-1 ring-line',
                'scrollbar-slim max-h-[70vh] overflow-y-auto',
              )}
            >
              <FilterPanel filters={filters} />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        {filters.activeCount > 0 ? (
          <Button
            size="sm"
            variant="ghost"
            icon={<RotateCcw />}
            onClick={filters.clear}
          >
            <span className="hidden sm:inline">
              {t('conversationFilters.reset')}
            </span>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
