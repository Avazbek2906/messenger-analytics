import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  integrationApi,
  type TelegramLoginOptions,
  type TelegramLoginResponse,
} from '@/entities/integration'
import { ApiError, queryKeys } from '@/shared/api'

export type LoginStep =
  'idle' | 'qr' | 'phone' | 'code' | 'password' | 'connected'

const POLL_INTERVAL_MS = 2500

interface LoginState {
  step: LoginStep
  /** The QR payload. It rotates roughly every 30 s and must be re-rendered. */
  qrUrl: string | null
  error: ApiError | null
  isBusy: boolean
}

/**
 * The Telegram userbot login flow.
 *
 * QR is the primary path: start, then poll every ~2.5 s and re-render the code
 * whenever a `pending` response carries a NEW url — Telegram rotates the token
 * about every 30 seconds. SMS is the fallback, and either path can branch into
 * a 2FA password step (docs/07).
 */
export function useTelegramLogin(onDone: () => void) {
  const queryClient = useQueryClient()

  const [state, setState] = useState<LoginState>({
    step: 'idle',
    qrUrl: null,
    error: null,
    isBusy: false,
  })
  const loginId = useRef<string | null>(null)
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollTimer.current) clearTimeout(pollTimer.current)
    pollTimer.current = null
  }, [])

  useEffect(() => stopPolling, [stopPolling])

  const finish = useCallback(() => {
    stopPolling()
    void queryClient.invalidateQueries({
      queryKey: queryKeys.integrations.telegram(),
    })
    setState((current) => ({ ...current, step: 'connected', isBusy: false }))
    onDone()
  }, [onDone, queryClient, stopPolling])

  const apply = useCallback(
    (response: TelegramLoginResponse) => {
      loginId.current = response.login_id

      if (response.status === 'connected') {
        finish()
        return
      }
      if (response.status === 'password_required') {
        stopPolling()
        setState({ step: 'password', qrUrl: null, error: null, isBusy: false })
        return
      }
      if (response.status === 'code_sent') {
        setState({ step: 'code', qrUrl: null, error: null, isBusy: false })
        return
      }
      // `pending` — keep the QR fresh with whatever url this poll returned.
      setState({
        step: 'qr',
        qrUrl: response.url ?? null,
        error: null,
        isBusy: false,
      })
    },
    [finish, stopPolling],
  )

  const fail = useCallback(
    (error: unknown) => {
      stopPolling()
      setState((current) => ({
        ...current,
        error: error instanceof ApiError ? error : null,
        isBusy: false,
      }))
    },
    [stopPolling],
  )

  const poll = useCallback(() => {
    const id = loginId.current
    if (!id) return

    pollTimer.current = setTimeout(() => {
      integrationApi
        .telegramQrPoll(id)
        .then((response) => {
          apply(response)
          if (response.status === 'pending') poll()
        })
        .catch(fail)
    }, POLL_INTERVAL_MS)
  }, [apply, fail])

  const startQr = useMutation({
    mutationFn: (options: TelegramLoginOptions) =>
      integrationApi.telegramQrStart(options),
    onMutate: () => setState((s) => ({ ...s, isBusy: true, error: null })),
    onSuccess: (response) => {
      apply(response)
      poll()
    },
    onError: fail,
  })

  const startSms = useMutation({
    mutationFn: ({
      phone,
      options,
    }: {
      phone: string
      options: TelegramLoginOptions
    }) => integrationApi.telegramSmsStart(phone, options),
    onMutate: () => setState((s) => ({ ...s, isBusy: true, error: null })),
    onSuccess: apply,
    onError: fail,
  })

  const verifyCode = useMutation({
    mutationFn: (code: string) =>
      integrationApi.telegramSmsVerify(loginId.current ?? '', code),
    onMutate: () => setState((s) => ({ ...s, isBusy: true, error: null })),
    onSuccess: apply,
    onError: fail,
  })

  const submitPassword = useMutation({
    mutationFn: (password: string) =>
      integrationApi.telegramPassword(loginId.current ?? '', password),
    onMutate: () => setState((s) => ({ ...s, isBusy: true, error: null })),
    onSuccess: apply,
    onError: fail,
  })

  const reset = useCallback(() => {
    stopPolling()
    loginId.current = null
    setState({ step: 'idle', qrUrl: null, error: null, isBusy: false })
  }, [stopPolling])

  return {
    ...state,
    startQr: startQr.mutate,
    startSms: startSms.mutate,
    verifyCode: verifyCode.mutate,
    submitPassword: submitPassword.mutate,
    goToPhone: () => {
      stopPolling()
      setState({ step: 'phone', qrUrl: null, error: null, isBusy: false })
    },
    reset,
  }
}
