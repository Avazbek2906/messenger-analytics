import { AlertTriangle } from 'lucide-react'

import { useTranslation } from '@/shared/i18n'
import { SecretField } from '@/shared/ui/data/secret-field'
import { Button } from '@/shared/ui/primitives/button'
import { Dialog } from '@/shared/ui/primitives/dialog'

import type { Credentials } from '../model/types'

/**
 * Shows a login and its one-time password.
 *
 * The password is hashed at rest and no route reads it back, so this dialog is
 * the only moment it exists in the UI — hence the deliberate friction: no
 * outside-click dismissal path is offered beyond the explicit confirm button,
 * and the warning states plainly that it will not be shown again
 * (CHANGELOG 2026-08-02 §1).
 */
export function CredentialsDialog({
  credentials,
  onClose,
}: {
  credentials: Credentials | null
  onClose: () => void
}) {
  const { t } = useTranslation()

  return (
    <Dialog
      open={credentials !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title={t('credentials.title')}
      description={t('credentials.description')}
      footer={
        <Button variant="primary" onClick={onClose}>
          {t('credentials.saved')}
        </Button>
      }
    >
      {credentials ? (
        <div className="space-y-3">
          <SecretField
            value={credentials.username}
            label={t('credentials.username')}
            copyLabel={t('credentials.copyUsername')}
          />
          <SecretField
            value={credentials.password}
            label={t('credentials.password')}
            copyLabel={t('credentials.copyPassword')}
          />

          <p className="flex items-start gap-2 rounded-md bg-danger-soft px-3 py-2.5 text-xs leading-5 text-danger-fg">
            <AlertTriangle className="mt-px size-3.5 shrink-0" aria-hidden />
            {t('credentials.warning')}
          </p>
        </div>
      ) : null}
    </Dialog>
  )
}
