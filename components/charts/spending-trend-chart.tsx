'use client'

import { useReducedMotion } from 'motion/react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMonthName } from '@/lib/finance/dates'
import { formatCompactMoney } from '@/lib/finance/money'
import type { DailySpendPoint, MonthKey } from '@/lib/finance/types'
import { ChartTooltip } from './chart-tooltip'

interface SpendingTrendChartProps {
  current: readonly DailySpendPoint[]
  previous: readonly DailySpendPoint[]
  month: MonthKey
  previousMonth: MonthKey
  height?: number
}

const TICK = { fill: '#5f6879', fontSize: 12 }

export function SpendingTrendChart({
  current,
  previous,
  month,
  previousMonth,
  height = 280,
}: SpendingTrendChartProps) {
  const reduceMotion = useReducedMotion()
  const length = Math.max(current.length, previous.length)
  const currentName = formatMonthName(month)
  const previousName = formatMonthName(previousMonth)

  const data = Array.from({ length }, (_, index) => ({
    day: index + 1,
    current: current[index]?.cumulative ?? null,
    previous: previous[index]?.cumulative ?? null,
  }))

  return (
    <div
      style={{ height }}
      className="w-full"
      role="img"
      aria-label={`Cumulative spending through ${currentName} compared with ${previousName}`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="#e5dfcf" strokeDasharray="3 4" />
          <XAxis
            dataKey="day"
            tick={TICK}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            interval={4}
          />
          <YAxis
            tickFormatter={(value: number) => formatCompactMoney(value)}
            tick={TICK}
            tickLine={false}
            axisLine={false}
            width={52}
          />
          <Tooltip
            cursor={{ stroke: '#0c1730', strokeOpacity: 0.15 }}
            content={<ChartTooltip formatLabel={(label) => `Day ${label}`} />}
          />
          <Line
            type="monotone"
            dataKey="previous"
            name={previousName}
            stroke="#8a97ab"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            connectNulls={false}
            isAnimationActive={!reduceMotion}
            animationDuration={800}
          />
          <Line
            type="monotone"
            dataKey="current"
            name={currentName}
            stroke="#2b50e6"
            strokeWidth={2.75}
            dot={false}
            activeDot={{ r: 5, fill: '#2b50e6', stroke: '#fffdf8', strokeWidth: 2 }}
            connectNulls={false}
            isAnimationActive={!reduceMotion}
            animationDuration={800}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
