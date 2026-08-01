/**
 * Saves a blob to a file.
 *
 * Audio and export downloads require a JWT, so a plain `<a download>` cannot
 * work — fetch into a blob first, then hand it here (docs/03, docs/06).
 */

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  // Give the browser a tick to start the download before revoking the URL.
  setTimeout(() => URL.revokeObjectURL(url), 0)
}
