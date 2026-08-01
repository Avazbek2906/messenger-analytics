import * as LabelPrimitive from '@radix-ui/react-label'
import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  useId,
  forwardRef,
} from 'react'

import { cn } from '@/shared/lib'

const fieldBase = [
  'w-full bg-surface text-fg text-sm placeholder:text-fg-subtle',
  'ring-1 ring-line ring-inset rounded-md',
  'transition-[box-shadow,background-color] duration-(--duration-fast)',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-fg-subtle',
  'aria-[invalid=true]:ring-danger aria-[invalid=true]:focus-visible:ring-danger',
].join(' ')

/* ------------------------------------------------------------------ Field */

interface FieldProps {
  label: ReactNode
  /** Persistent helper text — not a placeholder (rule: `input-helper-text`). */
  hint?: ReactNode
  /** Error text. `errors[].detail` lands here. */
  error?: string | null
  required?: boolean
  children: (props: {
    id: string
    'aria-describedby': string | undefined
    'aria-invalid': boolean
  }) => ReactNode
  className?: string
}

/**
 * Form field wrapper: visible label, hint and error.
 * The error sits BELOW the field and is announced via `role="alert"`.
 */
export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: FieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

  return (
    <div className={cn('space-y-1.5', className)}>
      <LabelPrimitive.Root
        htmlFor={id}
        className="flex items-center gap-1 text-[13px] font-medium text-fg"
      >
        {label}
        {required ? (
          <span className="text-danger" aria-hidden>
            *
          </span>
        ) : null}
      </LabelPrimitive.Root>

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': Boolean(error),
      })}

      {error ? (
        <p id={errorId} role="alert" className="text-xs text-danger-fg">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-fg-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ Input */

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  /** Leading icon (a search glyph, for example). */
  leading?: ReactNode
  trailing?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, leading, trailing, ...props },
  ref,
) {
  const input = (
    <input
      ref={ref}
      className={cn(
        fieldBase,
        'h-10 px-3',
        leading && 'pl-9',
        trailing && 'pr-9',
        className,
      )}
      {...props}
    />
  )

  if (!leading && !trailing) return input

  return (
    <div className="relative">
      {leading ? (
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-fg-subtle [&_svg]:size-4">
          {leading}
        </span>
      ) : null}
      {input}
      {trailing ? (
        <span className="absolute top-1/2 right-2 -translate-y-1/2">
          {trailing}
        </span>
      ) : null}
    </div>
  )
})

/* --------------------------------------------------------------- Textarea */

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentPropsWithoutRef<'textarea'>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(fieldBase, 'min-h-24 resize-y px-3 py-2.5', className)}
      {...props}
    />
  )
})

export { fieldBase }
