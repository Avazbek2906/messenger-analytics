import { Search, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { useDebouncedValue } from '@/shared/hooks/use-debounced-value'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Input } from '@/shared/ui/primitives/input'

interface FilterSearchProps {
  value: string
  onChange: (value: string | null) => void
}

/**
 * Search field.
 *
 * The backend searches `display_name` and `username`. Input is debounced by
 * ~300 ms so a request does not go out per keystroke.
 */
export function FilterSearch({ value, onChange }: FilterSearchProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState(value)
  const debounced = useDebouncedValue(draft)

  // Re-sync when the URL changes from outside (a chip removed, filters reset).
  useEffect(() => setDraft(value), [value])

  useEffect(() => {
    if (debounced !== value) onChange(debounced || null)
    // `value` is deliberately not a dependency: it is the external source and
    // the effect above copies it into the draft.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  return (
    <Input
      type="search"
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      placeholder={t('conversationFilters.searchPlaceholder')}
      aria-label={t('conversationFilters.search')}
      leading={<Search />}
      className="sm:w-64"
      trailing={
        draft ? (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDraft('')}
            aria-label={t('conversationFilters.clearSearch')}
          >
            <X />
          </Button>
        ) : undefined
      }
    />
  )
}
