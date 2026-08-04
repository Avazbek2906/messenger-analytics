/**
 * The label for a single-series chart.
 *
 * Direct labelling instead of a shared legend: each chart carries exactly one
 * series, so a detached legend would only add eye travel — and the caption
 * doubles as the y-axis label, which bare tick numbers do not provide.
 */
export function ChartCaption({
  label,
  color,
}: {
  label: string
  color: string
}) {
  return (
    <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-fg-muted">
      <span
        aria-hidden
        className="h-0.5 w-4 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </p>
  )
}
