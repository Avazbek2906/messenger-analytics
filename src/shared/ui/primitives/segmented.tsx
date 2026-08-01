import { useRef, type ReactNode } from 'react'

import { cn } from '@/shared/lib'

export interface SegmentedOption<T extends string> {
  value: T
  label: ReactNode
  /** Required for icon-only options. */
  ariaLabel?: string
}

interface SegmentedProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: readonly SegmentedOption<T>[]
  size?: 'sm' | 'md'
  className?: string
  'aria-label': string
}

/**
 * Segmented control — for 2–5 mutually exclusive options.
 *
 * The reference style: inside a soft container the active item lifts out as a
 * white card.
 *
 * Keyboard support follows the radiogroup pattern: only the selected option is
 * in the tab order and arrow keys move between options — plain tabbing would
 * make a five-option control cost five tab stops.
 */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = 'md',
  className,
  'aria-label': ariaLabel,
}: SegmentedProps<T>) {
  const container = useRef<HTMLDivElement>(null)

  const move = (delta: number) => {
    const index = options.findIndex((option) => option.value === value)
    if (index === -1) return

    const nextIndex = (index + delta + options.length) % options.length
    const next = options[nextIndex]
    if (!next) return

    onChange(next.value)
    // Focus follows selection, as in a radiogroup — otherwise the focus ring
    // would be left behind on the previous option.
    container.current?.querySelectorAll('button')[nextIndex]?.focus()
  }

  return (
    <div
      ref={container}
      role="radiogroup"
      aria-label={ariaLabel}
      tabIndex={-1}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault()
          move(1)
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault()
          move(-1)
        }
      }}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-md bg-surface-sunken p-0.5 ring-1 ring-line ring-inset',
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.ariaLabel}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={cn(
              'cursor-pointer rounded-[0.55rem] font-medium whitespace-nowrap',
              'transition-[background-color,color,box-shadow] duration-(--duration-fast)',
              size === 'sm' ? 'h-7 px-2.5 text-xs' : 'h-8 px-3 text-[13px]',
              active
                ? 'bg-surface text-fg shadow-xs'
                : 'text-fg-muted hover:text-fg',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
