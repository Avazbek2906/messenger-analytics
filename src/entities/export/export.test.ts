import { afterEach, describe, expect, it, vi } from 'vitest'

import { canDownload, isExpired, type ExportFile } from './index'

const NOW = new Date('2026-07-29T12:00:00Z')

function row(patch: Partial<ExportFile> = {}): ExportFile {
  return {
    id: 'e1',
    kind: 'conversations',
    status: 'done',
    params: {},
    file_url: 'https://example.test/download',
    error: '',
    expires_at: new Date(NOW.getTime() + 3600_000).toISOString(),
    created_at: NOW.toISOString(),
    ...patch,
  }
}

afterEach(() => vi.useRealTimers())

function freeze() {
  vi.useFakeTimers()
  vi.setSystemTime(NOW)
}

describe('isExpired', () => {
  it('is false while the 24-hour window is still open', () => {
    freeze()
    expect(isExpired(row())).toBe(false)
  })

  it('is true once the window has passed', () => {
    freeze()
    expect(
      isExpired(
        row({ expires_at: new Date(NOW.getTime() - 1000).toISOString() }),
      ),
    ).toBe(true)
  })

  it('is false while pending, when there is no expiry yet', () => {
    freeze()
    expect(isExpired(row({ status: 'pending', expires_at: null }))).toBe(false)
  })
})

describe('canDownload', () => {
  it('allows a finished export with a file url', () => {
    freeze()
    expect(canDownload(row())).toBe(true)
  })

  it('blocks a running export', () => {
    // Gating on `file_url` rather than on `status` folds both server-side
    // requirements into one check (docs/06).
    freeze()
    expect(canDownload(row({ status: 'running', file_url: null }))).toBe(false)
  })

  it('blocks an export whose file has already been swept', () => {
    freeze()
    expect(
      canDownload(
        row({ expires_at: new Date(NOW.getTime() - 1000).toISOString() }),
      ),
    ).toBe(false)
  })
})
