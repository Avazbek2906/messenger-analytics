import { attributionModeLabelKey, useSession } from '@/entities/session'
import { useTranslation } from '@/shared/i18n'
import { InstagramAccounts } from '@/widgets/instagram-accounts'
import { TelegramAccounts } from '@/widgets/telegram-accounts'
import { WebAccounts } from '@/widgets/web-accounts'

/**
 * Channel connections.
 *
 * Read-only toward customers throughout: nothing on this page sends a message,
 * a reaction or a read receipt, and no endpoint exists to back one (docs/07).
 */
export function IntegrationsPage() {
  const { t } = useTranslation()
  const session = useSession()
  const mode = session.company?.attribution_mode

  return (
    <div className="space-y-5">
      {mode ? (
        <p className="rounded-lg bg-info-soft px-4 py-3 text-[13px] leading-6 text-info-fg">
          {t('integrations.modeNotice', {
            mode: t(attributionModeLabelKey(mode)),
          })}
        </p>
      ) : null}

      <TelegramAccounts />
      <InstagramAccounts />
      <WebAccounts />
    </div>
  )
}

export default IntegrationsPage
