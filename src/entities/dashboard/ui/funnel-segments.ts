import type { MessageKey } from '@/shared/i18n'

/**
 * The four statuses of a funnel stage.
 *
 * Both the rows and the legend read from THIS source, so colour and order are
 * never duplicated in two places.
 */
export const FUNNEL_SEGMENTS = [
  {
    key: 'success',
    labelKey: 'funnel.status.success',
    color: 'var(--color-success)',
  },
  {
    key: 'neutral',
    labelKey: 'funnel.status.neutral',
    color: 'var(--color-warning)',
  },
  {
    key: 'drop_off',
    labelKey: 'funnel.status.drop_off',
    color: 'var(--color-danger)',
  },
  {
    key: 'not_reached',
    labelKey: 'funnel.status.not_reached',
    color: 'var(--color-line-strong)',
  },
] as const satisfies readonly {
  key: 'success' | 'neutral' | 'drop_off' | 'not_reached'
  labelKey: MessageKey
  color: string
}[]
