import { useTranslation } from '@/shared/i18n'

import { FUNNEL_SEGMENTS } from './funnel-segments'

export function FunnelLegend() {
  const { t } = useTranslation()

  return (
    <ul className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
      {FUNNEL_SEGMENTS.map((segment) => (
        <li
          key={segment.key}
          className="flex items-center gap-1.5 text-xs text-fg-muted"
        >
          <span
            aria-hidden
            className="size-2 rounded-full"
            style={{ backgroundColor: segment.color }}
          />
          {t(segment.labelKey)}
        </li>
      ))}
    </ul>
  )
}
