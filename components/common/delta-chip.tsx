import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { Comparison } from '@/lib/finance/types'
import { cn } from '@/lib/utils'

interface DeltaChipProps {
  comparison: Comparison
  /** When true, an increase is treated as unfavourable (for example, spending). */
  higherIsWorse?: boolean
  /** Describes what the figure is compared with. */
  label?: string
  onDark?: boolean
  className?: string
}

export function DeltaChip({
  comparison,
  higherIsWorse = false,
  label = 'vs last month',
  onDark = false,
  className,
}: DeltaChipProps) {
  const { change, percent } = comparison

  if (percent === null && change === 0) {
    return (
      <span className={cn('text-xs text-muted-foreground', onDark && 'text-white/60', className)}>
        No earlier activity to compare
      </span>
    )
  }

  const direction = change === 0 ? 'flat' : change > 0 ? 'up' : 'down'
  const favourable = direction === 'flat' ? null : higherIsWorse ? direction === 'down' : direction === 'up'
  const Icon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus

  const tone =
    favourable === null
      ? onDark
        ? 'bg-white/10 text-white/80'
        : 'bg-muted text-muted-foreground'
      : favourable
        ? onDark
          ? 'bg-seafoam/15 text-seafoam'
          : 'bg-seafoam-soft text-seafoam-ink'
        : onDark
          ? 'bg-rose-soft/15 text-[#ffb4a5]'
          : 'bg-rose-soft text-rose-ink'

  const text =
    percent === null
      ? direction === 'up'
        ? 'New'
        : 'No change'
      : `${Math.abs(percent).toFixed(percent !== 0 && Math.abs(percent) < 10 ? 1 : 0)}%`

  const spoken =
    direction === 'flat'
      ? `No change ${label}`
      : `${direction === 'up' ? 'Up' : 'Down'} ${text} ${label}`

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold tabular',
          tone,
        )}
      >
        <Icon className="size-3.5" aria-hidden="true" />
        {text}
        <span className="sr-only">{spoken}</span>
      </span>
      <span
        aria-hidden="true"
        className={cn('text-xs text-muted-foreground', onDark && 'text-white/55')}
      >
        {label}
      </span>
    </span>
  )
}
