'use client'

import { useState } from 'react'
import { formatMonthName } from '@/lib/finance/dates'
import { formatCompactMoney, formatMoney } from '@/lib/finance/money'
import type { DailySpendPoint, MonthKey } from '@/lib/finance/types'
import { AXIS_COLOR, GRID_COLOR, ChartHover, chartCeiling, polylinePath, useChartWidth } from './svg-chart-utils'

interface SpendingTrendChartProps {
  current: readonly DailySpendPoint[]
  previous: readonly DailySpendPoint[]
  month: MonthKey
  previousMonth: MonthKey
  height?: number
}

export function SpendingTrendChart({ current, previous, month, previousMonth, height = 280 }: SpendingTrendChartProps) {
  const { ref, width } = useChartWidth()
  const [hover, setHover] = useState<string | null>(null)
  const length = Math.max(current.length, previous.length, 1)
  const currentName = formatMonthName(month)
  const previousName = formatMonthName(previousMonth)
  const margin = { left: 53, top: 16, right: 14, bottom: 38 }
  const plotWidth = Math.max(1, width - margin.left - margin.right)
  const plotHeight = Math.max(1, height - margin.top - margin.bottom)
  const bottom = margin.top + plotHeight
  const high = chartCeiling(Math.max(0, ...current.map((point) => point.cumulative), ...previous.map((point) => point.cumulative)))
  const xOf = (day: number) => margin.left + ((day - 1) / Math.max(length - 1, 1)) * plotWidth
  const yOf = (value: number) => bottom - (value / high) * plotHeight
  const series = [
    { key: 'previous', label: previousName, points: previous, color: '#8a97ab', dashed: true },
    { key: 'current', label: currentName, points: current, color: '#2b50e6', dashed: false },
  ]

  return <div ref={ref} style={{ height }} className="relative min-w-0 w-full" role="img" aria-label={`Cumulative spending through ${currentName} compared with ${previousName}`}>
    <ChartHover text={hover} />
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="block overflow-visible">
      {Array.from({ length: 5 }, (_, index) => {
        const value = (high / 4) * index
        const y = bottom - (plotHeight * index) / 4
        return <g key={index}><line x1={margin.left} x2={width - margin.right} y1={y} y2={y} stroke={GRID_COLOR} strokeDasharray="4 5"/><text x={margin.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill={AXIS_COLOR}>{formatCompactMoney(value)}</text></g>
      })}
      {Array.from({ length: Math.ceil(length / 5) + 1 }, (_, index) => {
        const day = 1 + index * 5
        if (day > length) return null
        return <text key={day} x={xOf(day)} y={height - 12} textAnchor="middle" fontSize="12" fill={AXIS_COLOR}>{day}</text>
      })}
      {series.map((item) => {
        const positions = item.points.filter((point) => Number.isFinite(point.cumulative)).map((point) => ({ x: xOf(point.day), y: yOf(point.cumulative), point }))
        return <g key={item.key}>
          {positions.length > 1 && <path d={polylinePath(positions)} fill="none" stroke={item.color} strokeWidth={item.dashed ? 2.2 : 2.8} strokeDasharray={item.dashed ? '6 6' : undefined} strokeLinecap="round" strokeLinejoin="round" />}
          {positions.map(({ x, y, point }) => <circle key={point.day} cx={x} cy={y} r="7" fill="transparent" stroke="transparent" tabIndex={0}
            onMouseEnter={() => setHover(`${item.label} ${point.day} · Spent: ${formatMoney(point.cumulative)}`)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(`${item.label} ${point.day} · Spent: ${formatMoney(point.cumulative)}`)} onBlur={() => setHover(null)}>
            <title>{item.label} {point.day}: {formatMoney(point.cumulative)}</title>
          </circle>)}
        </g>
      })}
    </svg>
  </div>
}
