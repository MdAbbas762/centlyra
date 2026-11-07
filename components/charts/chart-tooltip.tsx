import { formatMoney } from '@/lib/finance/money'

interface TooltipEntry {
  name?: string | number
  value?: number | string | ReadonlyArray<number | string>
  color?: string
  dataKey?: string | number
  payload?: { color?: string }
}

interface ChartTooltipProps {
  active?: boolean
  payload?: ReadonlyArray<TooltipEntry>
  label?: string | number
  /** Turns the raw axis label into the heading shown in the tooltip. */
  formatLabel?: (label: string | number) => string
  /** Overrides the amount formatting for a given series. */
  formatValue?: (value: number, entry: TooltipEntry) => string
}

export function ChartTooltip({
  active,
  payload,
  label,
  formatLabel,
  formatValue = (value) => formatMoney(value),
}: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="min-w-40 rounded-xl border border-border bg-card/95 px-3.5 py-3 shadow-lg backdrop-blur-sm">
      {label !== undefined && (
        <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {formatLabel ? formatLabel(label) : label}
        </p>
      )}
      <ul className="space-y-1.5">
        {payload.map((entry) => (
          <li key={String(entry.dataKey ?? entry.name)} className="flex items-center gap-2 text-sm">
            <span
              aria-hidden="true"
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry.payload?.color ?? entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="tabular ml-auto pl-4 font-semibold text-foreground">
              {formatValue(Number(entry.value ?? 0), entry)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
