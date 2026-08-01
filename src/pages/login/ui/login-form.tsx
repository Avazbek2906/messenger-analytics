import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { ROUTES } from '@/app/router/routes'
import { useLogin } from '@/entities/session'
import { ApiError } from '@/shared/api'
import { useTranslation, type TranslateFn } from '@/shared/i18n'
import { Logo } from '@/shared/ui/brand/logo'
import { Button } from '@/shared/ui/primitives/button'
import { Field, Input } from '@/shared/ui/primitives/input'

/** Validation messages are translated too, so the schema depends on `t`. */
function buildSchema(t: TranslateFn) {
  return z.object({
    username: z.string().trim().min(1, t('auth.usernameRequired')),
    password: z.string().min(1, t('auth.passwordRequired')),
  })
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>

export function LoginForm() {
  const navigate = useNavigate()
  const login = useLogin()
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)

  const schema = useMemo(() => buildSchema(t), [t])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '' },
  })

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => navigate(ROUTES.dashboard, { replace: true }),
    })
  })

  return (
    <div className="w-full max-w-sm">
      <Logo className="mb-8 lg:hidden" />

      <header className="mb-7 space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight text-fg">
          {t('auth.welcome')}
        </h1>
        <p className="text-sm text-fg-muted">{t('auth.subtitle')}</p>
      </header>

      {login.isError ? <LoginError error={login.error} /> : null}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field
          label={t('auth.username')}
          error={errors.username?.message}
          hint={t('auth.usernameHint')}
          required
        >
          {(field) => (
            <Input
              {...field}
              {...register('username')}
              autoComplete="username"
              // This form is the login page's only purpose, so taking focus
              // immediately is the expected behaviour, not a distraction.
              // oxlint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              placeholder="aziza.k"
            />
          )}
        </Field>

        <Field
          label={t('auth.password')}
          error={errors.password?.message}
          required
        >
          {(field) => (
            <Input
              {...field}
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              trailing={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={
                    showPassword
                      ? t('auth.hidePassword')
                      : t('auth.showPassword')
                  }
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </Button>
              }
            />
          )}
        </Field>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={login.isPending}
        >
          {t('auth.submit')}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs leading-5 text-fg-subtle">
        {t('auth.forgot')}
      </p>
    </div>
  )
}

/**
 * Login xatosi.
 * Resolved by `code`: `no_active_account` covers both wrong credentials and a
 * disabled account (the backend deliberately does not distinguish them).
 */
function LoginError({ error }: { error: unknown }) {
  const { t } = useTranslation()

  return (
    <div
      role="alert"
      className="mb-5 flex items-start gap-2.5 rounded-md bg-danger-soft px-3.5 py-3 text-[13px] leading-5 text-danger-fg"
    >
      <AlertCircle className="mt-px size-4 shrink-0" aria-hidden />
      <span>{resolveMessage(error, t)}</span>
    </div>
  )
}

function resolveMessage(error: unknown, t: TranslateFn): string {
  if (!(error instanceof ApiError)) return t('error.unexpected.title')

  if (error.type === 'network_error') return t('error.network.description')
  if (error.has('no_active_account')) return t('auth.error.credentials')
  if (error.type === 'server_error') return t('error.server.description')

  return error.errors[0]?.detail ?? t('auth.error.generic')
}
