import { CheckCircle2, QrCode as QrIcon, Smartphone } from 'lucide-react'
import { useEffect, useState } from 'react'

import type { ApiError } from '@/shared/api'
import {
  useTranslation,
  type MessageKey,
  type TranslateFn,
} from '@/shared/i18n'
import { Button } from '@/shared/ui/primitives/button'
import { Dialog } from '@/shared/ui/primitives/dialog'
import { Field, Input } from '@/shared/ui/primitives/input'

import { useTelegramLogin } from '../model/use-telegram-login'
import {
  OnboardingFields,
  isOnboardingValid,
  toLoginOptions,
  type OnboardingValues,
} from './onboarding-fields'
import { QrCode } from './qr-code'

const DEFAULTS: OnboardingValues = {
  account_type: 'company',
  legal_consent: false,
  default_employee: '',
}

/**
 * Connects a Telegram userbot.
 *
 * QR is the default path and SMS is offered as a fallback. On the first
 * successful connect the backend automatically creates a Tier 0 history job,
 * so a job appears in the backfill list right away (docs/07).
 */
export function TelegramConnectDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useTranslation()
  const [values, setValues] = useState(DEFAULTS)
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')

  const login = useTelegramLogin(() => {
    // Give the success state a beat to register before the dialog closes.
    setTimeout(() => onOpenChange(false), 1200)
  })

  useEffect(() => {
    if (open) return
    login.reset()
    setValues(DEFAULTS)
    setPhone('')
    setCode('')
    setPassword('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const valid = isOnboardingValid(values)

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('telegram.connectTitle')}
      description={t('telegram.connectDescription')}
    >
      <div className="space-y-5">
        {login.error ? <LoginError error={login.error} t={t} /> : null}

        {login.step === 'idle' ? (
          <>
            <OnboardingFields
              values={values}
              disabled={login.isBusy}
              onChange={setValues}
            />
            <Button
              variant="primary"
              className="w-full"
              icon={<QrIcon />}
              loading={login.isBusy}
              disabled={!valid}
              onClick={() => login.startQr(toLoginOptions(values))}
            >
              {t('telegram.startQr')}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              icon={<Smartphone />}
              disabled={!valid}
              onClick={login.goToPhone}
            >
              {t('telegram.useSms')}
            </Button>
          </>
        ) : null}

        {login.step === 'qr' ? (
          <div className="flex flex-col items-center gap-4">
            {login.qrUrl ? <QrCode value={login.qrUrl} /> : null}
            <p className="text-center text-[13px] leading-6 text-fg-muted">
              {t('telegram.qrInstructions')}
            </p>
            <Button variant="ghost" size="sm" onClick={login.goToPhone}>
              {t('telegram.useSms')}
            </Button>
          </div>
        ) : null}

        {login.step === 'phone' ? (
          <>
            <Field label={t('telegram.phone')} hint={t('telegram.phoneHint')}>
              {(field) => (
                <Input
                  {...field}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  placeholder="+998901234567"
                  onChange={(event) => setPhone(event.target.value)}
                />
              )}
            </Field>
            <Button
              variant="primary"
              className="w-full"
              loading={login.isBusy}
              disabled={phone.trim().length < 8}
              onClick={() =>
                login.startSms({
                  phone: phone.trim(),
                  options: toLoginOptions(values),
                })
              }
            >
              {t('telegram.sendCode')}
            </Button>
          </>
        ) : null}

        {login.step === 'code' ? (
          <>
            <Field label={t('telegram.code')} hint={t('telegram.codeHint')}>
              {(field) => (
                <Input
                  {...field}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                />
              )}
            </Field>
            <Button
              variant="primary"
              className="w-full"
              loading={login.isBusy}
              disabled={!code.trim()}
              onClick={() => login.verifyCode(code.trim())}
            >
              {t('telegram.verify')}
            </Button>
          </>
        ) : null}

        {login.step === 'password' ? (
          <>
            <Field
              label={t('telegram.password')}
              hint={t('telegram.passwordHint')}
            >
              {(field) => (
                <Input
                  {...field}
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              )}
            </Field>
            <Button
              variant="primary"
              className="w-full"
              loading={login.isBusy}
              disabled={!password}
              onClick={() => login.submitPassword(password)}
            >
              {t('telegram.submitPassword')}
            </Button>
          </>
        ) : null}

        {login.step === 'connected' ? (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <CheckCircle2 className="size-8 text-success" aria-hidden />
            <p className="text-sm font-medium text-fg">
              {t('telegram.connected')}
            </p>
            <p className="text-[13px] text-fg-muted">
              {t('telegram.tier0Note')}
            </p>
          </div>
        ) : null}
      </div>
    </Dialog>
  )
}

/** Each documented `code` gets its own message; the rest fall back to `detail`. */
const ERROR_KEYS: Record<string, MessageKey> = {
  consent_required: 'telegram.error.consent',
  phone_invalid: 'telegram.error.phoneInvalid',
  phone_taken: 'telegram.error.phoneTaken',
  phone_banned: 'telegram.error.phoneBanned',
  code_invalid: 'telegram.error.codeInvalid',
  code_send_failed: 'telegram.error.codeSendFailed',
  code_verify_failed: 'telegram.error.codeVerifyFailed',
  password_rejected: 'telegram.error.passwordRejected',
  password_not_required: 'telegram.error.passwordNotRequired',
  login_expired: 'telegram.error.loginExpired',
  flood_wait: 'telegram.error.floodWait',
  account_taken: 'telegram.error.accountTaken',
  qr_start_failed: 'telegram.error.qrFailed',
  qr_poll_failed: 'telegram.error.qrFailed',
  employee_other_company: 'assign.otherCompany',
}

function LoginError({ error, t }: { error: ApiError; t: TranslateFn }) {
  return (
    <p
      role="alert"
      className="rounded-md bg-danger-soft px-3 py-2 text-[13px] leading-5 text-danger-fg"
    >
      {describe(error, t)}
    </p>
  )
}

function describe(error: ApiError, t: TranslateFn): string {
  // The login endpoints are throttled at 10 requests per hour per company.
  if (error.status === 429) return t('telegram.error.throttled')

  const key = Object.keys(ERROR_KEYS).find((code) => error.has(code))
  if (key) return t(ERROR_KEYS[key] as MessageKey)

  return error.errors[0]?.detail ?? t('error.unknown.detail')
}
