import type { MessageKey } from '@/shared/i18n'

/** The upload check accepts these; `.doc` / `.xls` then fail during processing. */
const ALLOWED = new Set(['.pdf', '.docx', '.xlsx', '.doc', '.xls'])

/** Legacy binary formats: they upload fine and then flip the row to `error`. */
const LEGACY = new Set(['.doc', '.xls'])

const MAX_BYTES = 20 * 1024 * 1024

export interface FileCheck {
  /** Blocks the upload entirely. */
  error: MessageKey | null
  /** Uploads would succeed but processing would fail — warn before spending it. */
  warning: MessageKey | null
}

/**
 * Client-side pre-checks before touching the network.
 *
 * `.doc` and `.xls` pass the server's extension check, return `201`, and only
 * then flip to `status: "error"` — so they are warned about at file-pick time
 * and steered towards `.docx` / `.xlsx` / `.pdf` (docs/04).
 */
export function checkRulebookFile(file: File): FileCheck {
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()

  if (!ALLOWED.has(extension)) {
    return { error: 'rulebook.typeUnsupported', warning: null }
  }
  // The size check runs after the extension check on the server too.
  if (file.size > MAX_BYTES) {
    return { error: 'rulebook.tooLarge', warning: null }
  }
  if (LEGACY.has(extension)) {
    return { error: null, warning: 'rulebook.legacyFormat' }
  }

  return { error: null, warning: null }
}

export { MAX_BYTES as RULEBOOK_MAX_BYTES }
