import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, LogOut, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import {
  displayName,
  roleLabelKey,
  useSession,
  useSignOut,
} from '@/entities/session'
import { useTranslation } from '@/shared/i18n'
import { initials } from '@/shared/lib'
import { ThemeToggle } from '@/shared/ui/theme'

import { LanguageMenu } from './language-menu'

/** Profile menu: who is signed in, their role, language, settings and sign-out. */
export function UserMenu() {
  const session = useSession()
  const signOut = useSignOut()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const name = displayName(session.user)

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className="flex h-10 cursor-pointer items-center gap-2 rounded-md pr-2 pl-1 transition-colors hover:bg-surface-sunken"
          aria-label={t('user.menu')}
        >
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary"
          >
            {initials(name)}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block max-w-32 truncate text-[13px] leading-4 font-medium text-fg">
              {name}
            </span>
            <span className="block text-2xs leading-4 text-fg-muted">
              {t(roleLabelKey(session.user.role))}
            </span>
          </span>
          <ChevronDown className="size-4 text-fg-subtle" aria-hidden />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-60 rounded-lg bg-surface p-1.5 shadow-popover ring-1 ring-line"
        >
          <div className="px-2.5 py-2">
            <p className="truncate text-sm font-medium text-fg">{name}</p>
            <p className="truncate text-xs text-fg-muted">
              {session.user.email || session.user.username}
            </p>
            {session.company ? (
              <p className="mt-1 truncate text-xs text-fg-subtle">
                {session.company.name}
              </p>
            ) : null}
          </div>

          <DropdownMenu.Separator className="my-1 h-px bg-line" />

          <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
            <span className="text-2xs font-medium tracking-wide text-fg-subtle uppercase">
              {t('theme.label')}
            </span>
            <ThemeToggle />
          </div>

          <DropdownMenu.Separator className="my-1 h-px bg-line" />

          <LanguageMenu variant="inline" />

          <DropdownMenu.Separator className="my-1 h-px bg-line" />

          <DropdownMenu.Item
            onSelect={() => navigate(ROUTES.settings)}
            className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-fg outline-none data-[highlighted]:bg-surface-sunken"
          >
            <Settings className="size-4 text-fg-muted" aria-hidden />
            {t('nav.settings')}
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="my-1 h-px bg-line" />

          <DropdownMenu.Item
            onSelect={signOut}
            className="flex cursor-pointer items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm text-danger-fg outline-none data-[highlighted]:bg-danger-soft"
          >
            <LogOut className="size-4" aria-hidden />
            {t('user.signOut')}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
