import { Link } from 'react-router-dom'

import { ROUTES } from '@/app/router/routes'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'

export function NotFoundPage() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-gradient-brand text-5xl font-bold tracking-tight">
        404
      </p>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-fg">{t('notFound.title')}</h1>
        <p className="max-w-sm text-sm text-fg-muted">
          {t('notFound.description')}
        </p>
      </div>
      <Button asChild variant="primary">
        <Link to={ROUTES.dashboard}>{t('notFound.action')}</Link>
      </Button>
    </div>
  )
}

export default NotFoundPage
