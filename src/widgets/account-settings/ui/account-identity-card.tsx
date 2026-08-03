import { displayName, roleLabelKey, useSession } from '@/entities/session'
import { useTranslation } from '@/shared/i18n'
import { Badge } from '@/shared/ui/primitives/badge'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'

/** Who you are signed in as — the context for everything else on the page. */
export function AccountIdentityCard() {
  const { t } = useTranslation()
  const session = useSession()

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t('user.username'), value: session.user.username },
    { label: t('user.name'), value: displayName(session.user) },
    {
      label: t('user.role'),
      value: <Badge tone="neutral">{t(roleLabelKey(session.user.role))}</Badge>,
    },
    {
      label: t('user.cabinet'),
      value: session.hasEmployeeProfile
        ? t('user.cabinetLinked')
        : t('user.cabinetMissing'),
    },
  ]

  return (
    <Card>
      <CardHeader
        title={t('account.identity')}
        description={t('account.identityDescription')}
      />
      <CardBody>
        <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-[max-content_1fr]">
          {rows.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-[13px] text-fg-muted">{row.label}</dt>
              <dd className="text-[13px] text-fg">{row.value}</dd>
            </div>
          ))}
        </dl>
      </CardBody>
    </Card>
  )
}
