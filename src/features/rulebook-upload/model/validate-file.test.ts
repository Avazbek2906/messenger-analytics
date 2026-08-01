import { describe, expect, it } from 'vitest'

import { RULEBOOK_MAX_BYTES, checkRulebookFile } from './validate-file'

function fakeFile(name: string, size = 1024): File {
  const file = new File(['x'], name)
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('checkRulebookFile', () => {
  it('accepts the supported modern formats', () => {
    for (const name of ['rules.pdf', 'rules.docx', 'rules.XLSX']) {
      expect(checkRulebookFile(fakeFile(name))).toEqual({
        error: null,
        warning: null,
      })
    }
  })

  it('warns about legacy formats instead of blocking them', () => {
    // `.doc` passes the server's extension check and returns 201, then flips
    // the row to `error` during processing — warn before spending the upload.
    const check = checkRulebookFile(fakeFile('rules.doc'))

    expect(check.error).toBeNull()
    expect(check.warning).toBe('rulebook.legacyFormat')
  })

  it('blocks an unsupported extension', () => {
    expect(checkRulebookFile(fakeFile('rules.txt')).error).toBe(
      'rulebook.typeUnsupported',
    )
  })

  it('blocks a file over 20 MB', () => {
    expect(
      checkRulebookFile(fakeFile('rules.pdf', RULEBOOK_MAX_BYTES + 1)).error,
    ).toBe('rulebook.tooLarge')
  })

  it('reports the type error first for an oversized unsupported file', () => {
    // The server checks the extension before the size, so the messages match.
    expect(
      checkRulebookFile(fakeFile('rules.txt', RULEBOOK_MAX_BYTES + 1)).error,
    ).toBe('rulebook.typeUnsupported')
  })
})
