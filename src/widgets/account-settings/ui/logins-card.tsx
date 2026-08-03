import { UserPlus } from 'lucide-react'
import { useState } from 'react'

import { InviteUserDialog } from '@/features/invite-user'
import { useTranslation } from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Card, CardBody, CardHeader } from '@/shared/ui/primitives/card'

/**
 * Creating logins for the company.
 *
 * There is no "list users" endpoint, so this cannot be a table — the roster in
 * Settings → Employees is the closest thing, and it is where an existing
 * login's password gets reset. This card only covers the create side, including
 * the logins that belong to nobody on the roster (a manager, a stakeholder).
 */
export function LoginsCard() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Card>
      <CardHeader
        title={t('account.logins')}
        description={t('account.loginsDescription')}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<UserPlus />}
            onClick={() => setOpen(true)}
          >
            {t('inviteUser.submit')}
          </Button>
        }
      />
      <CardBody>
        <p className="text-[13px] leading-6 text-fg-muted">
          {t('account.loginsHint')}
        </p>
      </CardBody>

      <InviteUserDialog open={open} onOpenChange={setOpen} />
    </Card>
  )
}
