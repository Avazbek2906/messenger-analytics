import { useEffect } from 'react'

const APP_NAME = 'Messenger Analytics'

/**
 * Sets the document title for a page.
 *
 * More than cosmetics: the title is what a screen reader announces after a
 * route change, and it is what browser history and open tabs are labelled
 * with — without it every screen reads as the same app.
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
    return () => {
      document.title = APP_NAME
    }
  }, [title])
}
