import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/shared/lib'

export interface SelectOption<T extends string = string> {
  value: T
  label: ReactNode
  /** Plain text for type-ahead (needed when the label is a ReactNode). */
  textValue?: string
  disabled?: boolean
}

interface SelectProps<T extends string> {
  value: T | undefined
  onChange: (value: T) => void
  options: readonly SelectOption<T>[]
  placeholder?: string
  id?: string
  disabled?: boolean
  className?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

/**
 * A thin wrapper over Radix Select so every dropdown looks the same.
 * Chosen over a native select because options need ReactNode labels (badges,
 * icons).
 */
export function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder = 'Tanlang',
  id,
  disabled,
  className,
  ...aria
}: SelectProps<T>) {
  return (
    <SelectPrimitive.Root
      value={value}
      onValueChange={(next) => onChange(next as T)}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        id={id}
        className={cn(
          'flex h-10 w-full items-center justify-between gap-2 rounded-md bg-surface px-3 text-sm text-fg ring-1 ring-line ring-inset',
          'cursor-pointer transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          'disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-fg-subtle',
          'aria-[invalid=true]:ring-danger data-[placeholder]:text-fg-subtle',
          className,
        )}
        {...aria}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="size-4 text-fg-subtle" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={cn(
            'z-50 max-h-72 min-w-(--radix-select-trigger-width) overflow-hidden rounded-lg bg-surface shadow-popover ring-1 ring-line',
            'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
          )}
        >
          <SelectPrimitive.Viewport className="scrollbar-slim p-1.5">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                textValue={option.textValue}
                className={cn(
                  'relative flex cursor-pointer items-center gap-2 rounded-sm py-2 pr-8 pl-2.5 text-sm text-fg outline-none select-none',
                  'data-[highlighted]:bg-surface-sunken data-[state=checked]:font-medium data-[state=checked]:text-primary',
                  'data-[disabled]:pointer-events-none data-[disabled]:text-fg-subtle',
                )}
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-2.5">
                  <Check className="size-4 text-primary" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}
