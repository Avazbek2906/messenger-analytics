/** Environment config in one place — `import.meta.env` is read nowhere else. */

const DEFAULT_API_BASE = 'https://monitoring.jakhongir.dev/api/v1'

/** Strips the trailing `/`: the backend runs with `APPEND_SLASH = False`. */
function normalizeBase(value: string): string {
  return value.replace(/\/+$/, '')
}

export const env = {
  apiBaseUrl: normalizeBase(
    import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE,
  ),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const
