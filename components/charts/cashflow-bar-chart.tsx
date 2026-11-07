'use client'

import { useReducedMotion } from 'motion/react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMonthLabel, formatMonthShort } from '@/lib/finance/dates'
import { formatCompactMoney } from '@/lib/finance/money'
import type { MonthlyPoint } from '@/lib/finance/types'
import { ChartTooltip } from './chart-tooltip'

interface CashflowBarChartProps {
  data: readonly MonthlyPoint[]
  height?: number
}

const TICK = { fill: '#5f6879', fontSize: 12 }

export function CashflowBarChart({ data, height = 280 }: CashflowBarChartProps) {
  const reduceMotion = useReducedMotion()
  const chartData = data.map((point) => ({ ...point }))

  return (
    <div style={{ height }} className="w-full" role="img" aria-label="Money in and money out by month">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barGap={4}>
          <CartesianGrid vertical={false} stroke="#e5dfcf" strokeDasharray="3 4" />
          <XAxis
            dataKey="month"
            tickFormatter={(month: string) => formatMonthShort(month)}
            tick={TICK}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis
            tickFormatter={(value: number) => formatCompactMoney(value)}
            tick={TICK}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <Tooltip
            cursor={{ fill: 'rgba(12, 23, 48, 0.04)' }}
            content={<ChartTooltip formatLabel={(label) => formatMonthLabel(String(label))} />}
          />
          <Bar
            dataKey="income"
            name="Money in"
            fill="#5ed3b0"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
            isAnimationActive={!reduceMotion}
            animationDuration={700}
          />
          <Bar
            dataKey="expenses"
            name="Money out"
            fill="#0c1730"
            radius={[6, 6, 0, 0]}
            maxBarSize={28}
            isAnimationActive={!reduceMotion}
            animationDuration={700}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ChartLegend({ items }: { items: ReadonlyArray<{ label: string; color: string; dashed?: boolean }> }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="h-0.5 w-3.5 rounded-full"
            style={
              item.dashed
                ? { backgroundImage: `repeating-linear-gradient(90deg, ${item.color} 0 4px, transparent 4px 7px)` }
                : { backgroundColor: item.color, height: 10, width: 10, borderRadius: 9999 }
            }
          />
          {item.label}
        </li>
      ))}
    </ul>
  )
}
