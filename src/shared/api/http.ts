/**
 * HTTP client.
 *
 * Backend constraints (docs/01):
 *  - paths must NEVER end in `/` (`APPEND_SLASH = False`, no redirect);
 *  - `Authorization: Bearer <access>`;
 *  - on 401 `token_not_valid` → refresh once, then replay the request;
 *  - concurrent requests queue behind a single in-flight refresh promise.
 */

import { env } from '@/shared/config/env'

import { ApiError, NetworkError } from './error'
import { tokenStore } from './token-store'

export type QueryValue =
  string | number | boolean | null | undefined | Array<string | number>

export type QueryParams = Record<string, QueryValue>

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  params?: QueryParams
  body?: unknown
  /** `FormData` — leave `Content-Type` to the browser so it writes the boundary. */
  formData?: FormData
  signal?: AbortSignal
  /** For endpoints that take no auth (login, health). */
  anonymous?: boolean
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 30_000

/** Only one refresh request is ever in flight. */
let refreshPromise: Promise<string> | null = null

function buildUrl(path: string, params?: QueryParams): string {
  // A trailing slash is a 404 on this API — normalising is mandatory.
  const cleanPath = `/${path.replace(/^\/+/, '').replace(/\/+$/, '')}`
  const url = new URL(env.apiBaseUrl + cleanPath)

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === null || value === undefined || value === '') continue
    if (Array.isArray(value)) {
      for (const item of value) url.searchParams.append(key, String(item))
    } else {
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

async function parseErrorBody(response: Response) {
  try {
    return (await response.json()) as { type?: never; errors?: never }
  } catch {
    return null
  }
}

async function refreshAccessToken(): Promise<string> {
  refreshPromise ??= (async () => {
    const refresh = tokenStore.getRefresh()
    if (!refresh) throw new ApiError(401, null)

    const response = await fetch(buildUrl('auth/token/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })

    if (!response.ok) {
      tokenStore.clear()
      throw new ApiError(response.status, await parseErrorBody(response))
    }

    const data = (await response.json()) as { access: string }
    // Rotation is off — the response carries no new `refresh`; the old one stays.
    tokenStore.set({ access: data.access })
    return data.access
  })().finally(() => {
    refreshPromise = null
  })

  return refreshPromise
}

async function send(
  path: string,
  options: RequestOptions,
  isRetry = false,
): Promise<Response> {
  const {
    method = 'GET',
    params,
    body,
    formData,
    signal,
    anonymous,
    timeoutMs = DEFAULT_TIMEOUT_MS,
  } = options

  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  if (!anonymous) {
    const access = tokenStore.getAccess()
    if (access) headers.Authorization = `Bearer ${access}`
  }

  const timeoutSignal = AbortSignal.timeout(timeoutMs)
  const composedSignal = signal
    ? AbortSignal.any([signal, timeoutSignal])
    : timeoutSignal

  let response: Response
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      headers,
      body: formData ?? (body === undefined ? null : JSON.stringify(body)),
      signal: composedSignal,
    })
  } catch (cause) {
    if (signal?.aborted) throw cause
    throw new NetworkError(cause)
  }

  // Expired access token — refresh once, then replay the original request.
  if (response.status === 401 && !anonymous && !isRetry) {
    try {
      await refreshAccessToken()
    } catch {
      tokenStore.clear()
      throw new ApiError(401, await parseErrorBody(response))
    }
    return send(path, options, true)
  }

  return response
}

async function request<T>(path: string, options: RequestOptions): Promise<T> {
  const response = await send(path, options)

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorBody(response))
  }
  if (response.status === 204) return null as T

  return (await response.json()) as T
}

/**
 * Authenticated binary download (audio, `.xlsx`).
 * A bare `<audio src>` or `<a download>` cannot work here — a JWT header is required.
 */
async function requestBlob(
  path: string,
  options: RequestOptions = {},
): Promise<{ blob: Blob; filename: string | null }> {
  const response = await send(path, options)

  if (!response.ok) {
    throw new ApiError(response.status, await parseErrorBody(response))
  }

  const disposition = response.headers.get('Content-Disposition')
  const filename = disposition?.match(/filename="?([^"]+)"?/)?.[1] ?? null

  return { blob: await response.blob(), filename }
}

export const http = {
  get: <T>(path: string, params?: QueryParams, signal?: AbortSignal) =>
    request<T>(path, { method: 'GET', params, signal }),

  post: <T>(
    path: string,
    body?: unknown,
    options?: { params?: QueryParams; timeoutMs?: number },
  ) =>
    request<T>(path, {
      method: 'POST',
      body: body ?? {},
      params: options?.params,
      timeoutMs: options?.timeoutMs,
    }),

  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body }),

  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body }),

  delete: <T = null>(path: string) => request<T>(path, { method: 'DELETE' }),

  upload: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', formData, timeoutMs: 120_000 }),

  /** Unauthenticated — login and health probes. */
  anonymousPost: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body, anonymous: true }),

  blob: requestBlob,
}
