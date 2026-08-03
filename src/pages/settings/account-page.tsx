import { useSession } from '@/entities/session'
import { ChangePasswordForm } from '@/features/change-password'
import { AccountIdentityCard, LoginsCard } from '@/widgets/account-settings'

/**
 * Logins and passwords.
 *
 * Changing your OWN password needs no role, so this tab is open to everyone;
 * only the invite card is manager-gated.
 */
export function AccountSettingsPage() {
  const session = useSession()

  return (
    <div className="space-y-5">
      <AccountIdentityCard />
      <ChangePasswordForm />
      {session.canWrite ? <LoginsCard /> : null}
    </div>
  )
}

export default AccountSettingsPage
