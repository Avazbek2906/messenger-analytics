import { useId } from 'react'

import { cn } from '@/shared/lib'

/**
 * Brand mark: a bar chart inside a chat bubble.
 *
 * The concept is a two-sided conversation (customer + employee) plus the
 * analytics chart. Gradient: indigo → cyan.
 */
export function LogoMark({
  className,
  gradient = true,
}: {
  className?: string
  gradient?: boolean
}) {
  const id = useId()
  const fill = gradient ? `url(#${id})` : 'currentColor'

  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label="Messenger Analytics"
      className={cn('size-8', className)}
    >
      {gradient ? (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      ) : null}

      {/* Chat pufakchasi — pastki chap burchakda "dum" bilan. */}
      <path
        fill={fill}
        d="M9 2h14a7 7 0 0 1 7 7v9a7 7 0 0 1-7 7h-8.6l-6.2 4.6A1.4 1.4 0 0 1 6 28.5V23h-.2A5.8 5.8 0 0 1 2 17.2V9a7 7 0 0 1 7-7Z"
      />
      {/* Ichkaridagi bar-chart — o'suvchi ustunlar. */}
      <g fill="#fff">
        <rect x="9" y="14.5" width="3.2" height="5.5" rx="1.4" />
        <rect x="14.4" y="10.5" width="3.2" height="9.5" rx="1.4" />
        <rect x="19.8" y="6.5" width="3.2" height="13.5" rx="1.4" />
      </g>
    </svg>
  )
}

/** Wordmark — Inter Bold, indigo→cyan gradient. */
export function LogoWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'text-gradient-brand text-[15px] leading-none font-bold tracking-tight',
        className,
      )}
    >
      Messenger Analytics
    </span>
  )
}

/** Combined lockup: mark and wordmark side by side. */
export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string
  showWordmark?: boolean
}) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className="size-8 shrink-0" />
      {showWordmark ? <LogoWordmark /> : null}
    </span>
  )
}
