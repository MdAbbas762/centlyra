'use client'

import { useId, useState } from 'react'
import { formatMonthLabel, formatMonthShort } from '@/lib/finance/dates'
import { formatCompactMoney, formatSignedMoney } from '@/lib/finance/money'
import type { MonthlyPoint } from '@/lib/finance/types'
import { AXIS_COLOR, GRID_COLOR, ChartHover, chartCeiling, polylinePath, useChartWidth } from './svg-chart-utils'

export function NetCashflowChart({ data, height = 260 }: { data: readonly MonthlyPoint[]; height?: number }) {
  const { ref, width } = useChartWidth()
  const gradientId = useId().replace(/:/g, '')
  const [hover, setHover] = useState<string | null>(null)
  const margin = { left: 54, top: 16, right: 16, bottom: 38 }
  const plotWidth = Math.max(1, width - margin.left - margin.right)
  const plotHeight = Math.max(1, height - margin.top - margin.bottom)
  const bottom = margin.top + plotHeight
  const minNet = Math.min(0, ...data.map((point) => point.net))
  const maxNet = Math.max(0, ...data.map((point) => point.net))
  const upper = chartCeiling(maxNet)
  const lower = minNet < 0 ? -chartCeiling(Math.abs(minNet)) : 0
  const span = upper - lower
  const yOf = (value: number) => bottom - ((value - lower) / span) * plotHeight
  const step = plotWidth / Math.max(data.length - 1, 1)
  const positions = data.map((point, index) => ({ x: margin.left + index * step, y: yOf(point.net) }))
  const line = polylinePath(positions)
  const baseline = yOf(0)
  const fill = positions.length > 0 ? `${line} L ${positions[positions.length - 1].x} ${baseline} L ${positions[0].x} ${baseline} Z` : ''

  return <div ref={ref} style={{ height }} className="relative min-w-0 w-full" role="img" aria-label="Net cash flow by month">
    <ChartHover text={hover} />
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="block overflow-visible">
      <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2b50e6" stopOpacity="0.24"/><stop offset="100%" stopColor="#2b50e6" stopOpacity="0.02"/></linearGradient></defs>
      {Array.from({ length: 5 }, (_, index) => {
        const value = lower + (span * index) / 4
        const y = yOf(value)
        return <g key={index}><line x1={margin.left} x2={width - margin.right} y1={y} y2={y} stroke={GRID_COLOR} strokeDasharray="4 5"/><text x={margin.left - 10} y={y + 4} textAnchor="end" fontSize="12" fill={AXIS_COLOR}>{formatCompactMoney(value)}</text></g>
      })}
      {lower < 0 && <line x1={margin.left} x2={width - margin.right} y1={baseline} y2={baseline} stroke="#8a97ab" strokeDasharray="5 5"/>}
      {fill && <path d={fill} fill={`url(#${gradientId})`} />}
      {line && <path d={line} fill="none" stroke="#2b50e6" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" />}
      {data.map((point, index) => <g key={point.month}>
        <circle cx={positions[index].x} cy={positions[index].y} r="5" fill="#fffdf8" stroke="#2b50e6" strokeWidth="2.4" tabIndex={0}
          onMouseEnter={() => setHover(`${formatMonthLabel(point.month)} · Net cash flow: ${formatSignedMoney(point.net)}`)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(`${formatMonthLabel(point.month)} · Net cash flow: ${formatSignedMoney(point.net)}`)} onBlur={() => setHover(null)}>
          <title>{formatMonthLabel(point.month)}: {formatSignedMoney(point.net)}</title>
        </circle>
        <text x={positions[index].x} y={height - 12} textAnchor="middle" fontSize="12" fill={AXIS_COLOR}>{formatMonthShort(point.month)}</text>
      </g>)}
    </svg>
  </div>
}
