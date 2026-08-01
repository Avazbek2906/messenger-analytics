import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '@/shared/ui/primitives/button'

import { ErrorState } from './states'

interface Props {
  children: ReactNode
  /** Fallback UI rendered when a render throws. */
  fallback?: (reset: () => void, error: unknown) => ReactNode
}

interface State {
  error: unknown
}

/**
 * Catches render-time errors so a single failure cannot turn the whole app
 * into a blank page. Used at route level and around heavy widgets.
 */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: unknown): State {
    return { error }
  }

  override componentDidCatch(error: unknown, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private reset = (): void => {
    this.setState({ error: null })
  }

  override render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children

    if (this.props.fallback) return this.props.fallback(this.reset, error)

    return (
      <div className="flex min-h-64 items-center justify-center">
        <ErrorState error={error} onRetry={this.reset} />
      </div>
    )
  }
}

/**
 * The outermost fallback, shown when the whole app crashes.
 *
 * This may render OUTSIDE `I18nProvider` (if the provider itself throws), so it
 * cannot call `useTranslation` — the copy arrives as a prop instead.
 */
export function AppCrashFallback({
  reset,
  messages,
}: {
  reset: () => void
  messages: {
    title: string
    description: string
    reload: string
    retry: string
  }
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <h1 className="text-lg font-semibold text-fg">{messages.title}</h1>
      <p className="max-w-md text-sm text-fg-muted">{messages.description}</p>
      <div className="flex gap-2">
        <Button variant="primary" onClick={() => window.location.reload()}>
          {messages.reload}
        </Button>
        <Button onClick={reset}>{messages.retry}</Button>
      </div>
    </div>
  )
}
