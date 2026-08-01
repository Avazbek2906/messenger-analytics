import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cn } from '@/shared/lib'

const buttonVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center gap-2',
    'font-medium whitespace-nowrap select-none',
    'transition-[background-color,box-shadow,color,opacity] duration-(--duration-fast) ease-(--ease-out-soft)',
    'cursor-pointer disabled:pointer-events-none disabled:opacity-45',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-fg shadow-xs hover:bg-primary-hover active:bg-primary-hover',
        secondary:
          'bg-surface text-fg ring-1 ring-line shadow-xs ring-inset hover:bg-surface-muted',
        ghost: 'text-fg-muted hover:bg-surface-sunken hover:text-fg',
        soft: 'bg-primary-soft text-primary hover:bg-brand-100',
        danger: 'bg-danger text-fg-inverse shadow-xs hover:bg-danger-fg',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 rounded-md px-3 text-[13px] [&_svg]:size-4',
        md: 'h-10 rounded-md px-4 text-sm [&_svg]:size-4',
        lg: 'h-11 rounded-lg px-5 text-sm [&_svg]:size-[18px]',
        /* Icon buttons: the rounded-square style from the reference design.
           Vizual o'lcham 40px, lekin tap-target 44px gacha kengaytiriladi. */
        icon: 'size-10 rounded-md [&_svg]:size-[18px] after:absolute after:-inset-0.5 after:content-[""]',
        'icon-sm':
          'size-8 rounded-sm [&_svg]:size-4 after:absolute after:-inset-1.5 after:content-[""]',
      },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
)

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  /** Icon before the label. Swapped for a spinner while `loading`. */
  icon?: ReactNode
}

export function Button({
  className,
  variant,
  size,
  asChild,
  loading,
  icon,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const Component = asChild ? Slot : 'button'

  return (
    <Component
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden /> : icon}
      {children}
    </Component>
  )
}

export { buttonVariants }
