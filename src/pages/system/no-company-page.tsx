import { Building2 } from 'lucide-react'

import { LanguageMenu } from '@/app/layouts/language-menu'
import { displayName, useSessionStore, useSignOut } from '@/entities/session'
import { useTranslation } from '@/shared/i18n'
import { LogoMark } from '@/shared/ui/brand/logo'
import { Button } from '@/shared/ui/primitives/button'
import { Card, CardBody } from '@/shared/ui/primitives/card'

/**
 * The account is not attached to any company.
 *
 * EVERY tenant endpoint answers `403 permission_denied` for such a user
 * (docs/01 §3), so a clearly explained screen is shown instead of a generic
 * error.
 */
export function NoCompanyPage() {
  const user = useSessionStore((s) => s.context?.user)
  const signOut = useSignOut()
  const { t } = useTranslation()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-5 py-10">
      <div className="absolute top-5 right-5">
        <LanguageMenu />
      </div>

      <LogoMark className="mb-8 size-10" />

      <Card className="w-full max-w-md">
        <CardBody className="flex flex-col items-center gap-4 pt-8 text-center">
          <span
            aria-hidden
            className="flex size-12 items-center justify-center rounded-full bg-warning-soft text-warning-fg"
          >
            <Building2 className="size-6" />
          </span>

          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold text-fg">
              {t('noCompany.title')}
            </h1>
            <p className="text-sm leading-6 text-fg-muted">
              {t('noCompany.description', {
                name: user ? displayName(user) : t('noCompany.fallbackName'),
              })}
            </p>
          </div>

          <Button onClick={signOut} className="mt-2">
            {t('user.switchAccount')}
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}

export default NoCompanyPage
