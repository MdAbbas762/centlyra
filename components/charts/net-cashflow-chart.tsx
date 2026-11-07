'use client'

import { useId } from 'react'
import { useReducedMotion } from 'motion/react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMonthLabel, formatMonthShort } from '@/lib/finance/dates'
import { formatCompactMoney, formatSignedMoney } from '@/lib/finance/money'
import type { MonthlyPoint } from '@/lib/finance/types'
import { ChartTooltip } from './chart-tooltip'

const TICK = { fill: '#5f6879', fontSize: 12 }

export function NetCashflowChart({ data, height = 260 }: { data: readonly MonthlyPoint[]; height?: number }) {
  const reduceMotion = useReducedMotion()
  const gradientId = useId()
  const chartData = data.map((point) => ({ ...point }))

  return (
    <div style={{ height }} className="w-full" role="img" aria-label="Net cash flow by month">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2b50e6" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#2b50e6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
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
          <ReferenceLine y={0} stroke="#8a97ab" strokeDasharray="4 4" />
          <Tooltip
            cursor={{ stroke: '#2b50e6', strokeOpacity: 0.25 }}
            content={
              <ChartTooltip
                formatLabel={(label) => formatMonthLabel(String(label))}
                formatValue={(value) => formatSignedMoney(value)}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="net"
            name="Net cash flow"
            stroke="#2b50e6"
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={{ r: 3.5, fill: '#fffdf8', stroke: '#2b50e6', strokeWidth: 2 }}
            activeDot={{ r: 5.5, fill: '#2b50e6', stroke: '#fffdf8', strokeWidth: 2 }}
            isAnimationActive={!reduceMotion}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
