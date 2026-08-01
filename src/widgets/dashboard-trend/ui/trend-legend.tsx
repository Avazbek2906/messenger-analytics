import { useTranslation, type MessageKey } from '@/shared/i18n'

const ITEMS = [
  {
    key: 'volume',
    labelKey: 'trend.legend.volume',
    color: 'var(--color-chart-2)',
  },
  {
    key: 'score',
    labelKey: 'trend.legend.score',
    color: 'var(--color-chart-1)',
  },
] as const satisfies readonly {
  key: string
  labelKey: MessageKey
  color: string
}[]

/** Grafik ustidagi legend — chartga yaqin turadi, pastga tushib ketmaydi. */
export function TrendLegend() {
  const { t } = useTranslation()

  return (
    <ul className="mb-3 flex flex-wrap items-center gap-4">
      {ITEMS.map((item) => (
        <li
          key={item.key}
          className="flex items-center gap-1.5 text-xs text-fg-muted"
        >
          <span
            aria-hidden
            className="h-0.5 w-4 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          {t(item.labelKey)}
        </li>
      ))}
    </ul>
  )
}
