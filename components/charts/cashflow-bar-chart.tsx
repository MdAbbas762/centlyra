'use client'

import { useState } from 'react'
import { formatMonthLabel, formatMonthShort } from '@/lib/finance/dates'
import { formatCompactMoney, formatMoney } from '@/lib/finance/money'
import type { MonthlyPoint } from '@/lib/finance/types'
import { AXIS_COLOR, GRID_COLOR, ChartHover, chartCeiling, useChartWidth } from './svg-chart-utils'

interface CashflowBarChartProps {
  data: readonly MonthlyPoint[]
  height?: number
}

export function CashflowBarChart({ data, height = 280 }: CashflowBarChartProps) {
  const { ref, width } = useChartWidth()
  const [hover, setHover] = useState<string | null>(null)
  const margin = { left: 53, top: 20, right: 14, bottom: 37 }
  const plotWidth = Math.max(1, width - margin.left - margin.right)
  const plotHeight = Math.max(1, height - margin.top - margin.bottom)
  const bottom = margin.top + plotHeight
  const maxValue = chartCeiling(Math.max(0, ...data.map((point) => Math.max(point.income, point.expenses))))
  const groupWidth = plotWidth / Math.max(data.length, 1)
  const barWidth = Math.min(26, Math.max(6, groupWidth * 0.29))
  const gap = Math.min(6, Math.max(3, groupWidth * 0.07))

  return (
    <div ref={ref} style={{ height }} className="relative min-w-0 w-full" role="img" aria-label="Money in and money out by month">
      <ChartHover text={hover} />
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="block overflow-visible">
        {Array.from({ length: 5 }, (_, index) => {
          const value = (maxValue / 4) * index
          const y = bottom - (plotHeight * index) / 4
          return <g key={index}>
            <line x1={margin.left} x2={width - margin.right} y1={y} y2={y} stroke={GRID_COLOR} strokeDasharray="4 5" />
            <text x={margin.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill={AXIS_COLOR}>{formatCompactMoney(value)}</text>
          </g>
        })}
        {data.map((point, index) => {
          const center = margin.left + groupWidth * (index + 0.5)
          return <g key={point.month}>
            {([{ key: 'income', value: point.income, color: '#5ed3b0', label: 'Money in', left: true }, { key: 'expenses', value: point.expenses, color: '#0c1730', label: 'Money out', left: false }] as const).map((bar) => {
              const barHeight = (Math.max(0, bar.value) / maxValue) * plotHeight
              return <rect key={bar.key} x={center + (bar.left ? -barWidth - gap / 2 : gap / 2)} y={bottom - barHeight} width={barWidth} height={barHeight} rx={Math.min(5, barHeight / 3)} fill={bar.color} tabIndex={0}
                onMouseEnter={() => setHover(`${formatMonthLabel(point.month)} · ${bar.label}: ${formatMoney(bar.value)}`)} onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(`${formatMonthLabel(point.month)} · ${bar.label}: ${formatMoney(bar.value)}`)} onBlur={() => setHover(null)}>
                <title>{formatMonthLabel(point.month)} — {bar.label}: {formatMoney(bar.value)}</title>
              </rect>
            })}
            <text x={center} y={height - 12} textAnchor="middle" fontSize="12" fill={AXIS_COLOR}>{formatMonthShort(point.month)}</text>
          </g>
        })}
      </svg>
    </div>
  )
}

export function ChartLegend({ items }: { items: ReadonlyArray<{ label: string; color: string; dashed?: boolean }> }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {items.map((item) => <li key={item.label} className="flex items-center gap-1.5">
        <span aria-hidden="true" className="h-0.5 w-3.5 rounded-full" style={item.dashed
          ? { backgroundImage: `repeating-linear-gradient(90deg, ${item.color} 0 4px, transparent 4px 7px)` }
          : { backgroundColor: item.color, height: 10, width: 10, borderRadius: 9999 }} />
        {item.label}
      </li>)}
    </ul>
  )
}
