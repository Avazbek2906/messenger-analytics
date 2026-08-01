import * as SwitchPrimitive from '@radix-ui/react-switch'
import { useId, type ReactNode } from 'react'

import { cn } from '@/shared/lib'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  /** Short text explaining what the toggle changes. */
  description?: ReactNode
  disabled?: boolean
  className?: string
}

/** Labelled switch — clicking the label toggles it too. */
export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  className,
}: SwitchProps) {
  const id = useId()
  const descriptionId = description ? `${id}-desc` : undefined

  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <SwitchPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        disabled={disabled}
        aria-describedby={descriptionId}
        className={cn(
          'peer relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors',
          'data-[state=checked]:bg-primary data-[state=unchecked]:bg-line-strong',
          'disabled:cursor-not-allowed disabled:opacity-45',
        )}
      >
        <SwitchPrimitive.Thumb className="block size-4 translate-x-0.5 rounded-full bg-white shadow-sm transition-transform duration-(--duration-fast) data-[state=checked]:translate-x-[1.125rem]" />
      </SwitchPrimitive.Root>

      <label htmlFor={id} className="cursor-pointer select-none">
        <span className="block text-[13px] leading-5 font-medium text-fg">
          {label}
        </span>
        {description ? (
          <span
            id={descriptionId}
            className="block text-xs leading-5 text-fg-muted"
          >
            {description}
          </span>
        ) : null}
      </label>
    </div>
  )
}
