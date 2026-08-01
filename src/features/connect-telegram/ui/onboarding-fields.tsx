import { useEmployees } from '@/entities/employee'
import type { TelegramAccountType } from '@/entities/integration'
import { useTranslation } from '@/shared/i18n'
import { Field } from '@/shared/ui/primitives/input'
import { Segmented } from '@/shared/ui/primitives/segmented'
import { Select } from '@/shared/ui/primitives/select'
import { Switch } from '@/shared/ui/primitives/switch'

const NONE = '__none__'

export interface OnboardingValues {
  account_type: TelegramAccountType
  legal_consent: boolean
  default_employee: string
}

/**
 * The onboarding fields carried by both login flows.
 *
 * A `personal` account REQUIRES `legal_consent: true` — the API rejects the
 * combination with `consent_required`, so the checkbox only appears for that
 * type and gates the submit button (docs/07).
 */
export function OnboardingFields({
  values,
  disabled,
  onChange,
}: {
  values: OnboardingValues
  disabled: boolean
  onChange: (values: OnboardingValues) => void
}) {
  const { t } = useTranslation()
  const employees = useEmployees()

  const patch = (part: Partial<OnboardingValues>) =>
    onChange({ ...values, ...part })

  return (
    <div className="space-y-4">
      <Field
        label={t('telegram.accountType')}
        hint={t('telegram.accountTypeHint')}
      >
        {() => (
          <Segmented
            aria-label={t('telegram.accountType')}
            className="w-full"
            value={values.account_type}
            onChange={(value) =>
              patch({
                account_type: value,
                // Consent only means something for a personal account.
                legal_consent:
                  value === 'company' ? false : values.legal_consent,
              })
            }
            options={[
              { value: 'company', label: t('telegram.typeCompany') },
              { value: 'personal', label: t('telegram.typePersonal') },
            ]}
          />
        )}
      </Field>

      {values.account_type === 'personal' ? (
        <Switch
          checked={values.legal_consent}
          disabled={disabled}
          onChange={(checked) => patch({ legal_consent: checked })}
          label={t('telegram.consent')}
          description={t('telegram.consentHint')}
        />
      ) : null}

      <Field
        label={t('telegram.defaultEmployee')}
        hint={t('telegram.defaultEmployeeHint')}
      >
        {(field) => (
          <Select
            {...field}
            disabled={disabled}
            value={values.default_employee || NONE}
            onChange={(value) =>
              patch({ default_employee: value === NONE ? '' : value })
            }
            options={[
              { value: NONE, label: t('telegram.noDefaultEmployee') },
              ...(employees.data?.results ?? []).map((employee) => ({
                value: employee.id,
                label: employee.full_name,
              })),
            ]}
          />
        )}
      </Field>
    </div>
  )
}

/** `consent_required` is a guaranteed 400 otherwise — block the submit early. */
export function isOnboardingValid(values: OnboardingValues): boolean {
  return values.account_type === 'company' || values.legal_consent
}

export function toLoginOptions(values: OnboardingValues) {
  return {
    account_type: values.account_type,
    legal_consent: values.legal_consent,
    default_employee: values.default_employee || null,
  }
}
