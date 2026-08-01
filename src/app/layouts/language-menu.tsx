import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Check, Languages } from 'lucide-react'

import { LOCALES, LOCALE_NAMES, useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'

/**
 * Language switcher.
 *
 * Language names are ALWAYS written in their own language ("Русский",
 * "English") so a user stranded in a language they cannot read can still find
 * their own.
 */
export function LanguageMenu({
  variant = 'button',
}: {
  /** `button` for the topbar and login; `inline` inside the profile menu. */
  variant?: 'button' | 'inline'
}) {
  const { locale, setLocale, t } = useTranslation()

  if (variant === 'inline') {
    return (
      <div className="px-1 py-0.5">
        <p className="px-1.5 pt-1 pb-1.5 text-2xs font-medium tracking-wide text-fg-subtle uppercase">
          {t('user.language')}
        </p>
        {LOCALES.map((value) => (
          <DropdownMenu.Item
            key={value}
            onSelect={() => setLocale(value)}
            className="flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2.5 py-2 text-sm text-fg outline-none data-[highlighted]:bg-surface-sunken"
          >
            {LOCALE_NAMES[value]}
            {value === locale ? (
              <Check className="size-4 text-primary" aria-hidden />
            ) : null}
          </DropdownMenu.Item>
        ))}
      </div>
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="sm"
          icon={<Languages />}
          aria-label={t('user.language')}
        >
          {LOCALE_NAMES[locale]}
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-44 rounded-lg bg-surface p-1.5 shadow-popover ring-1 ring-line"
        >
          {LOCALES.map((value) => (
            <DropdownMenu.Item
              key={value}
              onSelect={() => setLocale(value)}
              className="flex cursor-pointer items-center justify-between gap-2 rounded-sm px-2.5 py-2 text-sm text-fg outline-none data-[highlighted]:bg-surface-sunken"
            >
              {LOCALE_NAMES[value]}
              {value === locale ? (
                <Check className="size-4 text-primary" aria-hidden />
              ) : null}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
