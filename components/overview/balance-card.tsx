'use client'

import { useReducedMotion } from 'motion/react'
import { useId } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts'
import { ChartTooltip } from '@/components/charts/chart-tooltip'
import { AnimatedMoney } from '@/components/common/animated-money'
import { formatDayMonth, formatMonthLabel, makeIsoDate } from '@/lib/finance/dates'
import { formatMoney, formatSignedMoney } from '@/lib/finance/money'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'
import {
  selectBalanceTrend,
  selectIsCurrentMonth,
  selectMonthSummary,
  selectSelectedMonth,
  selectToday,
  selectTotalBalance,
} from '@/store/selectors'

export function BalanceCard() {
  const reduceMotion = useReducedMotion()
  const gradientId = useId()
  const month = useAppSelector(selectSelectedMonth)
  const today = useAppSelector(selectToday)
  const isCurrent = useAppSelector(selectIsCurrentMonth)
  const balance = useAppSelector(selectTotalBalance)
  const summary = useAppSelector(selectMonthSummary)
  const trend = useAppSelector(selectBalanceTrend)

  const asOf = isCurrent
    ? `As of ${formatDayMonth(today)}`
    : `At the end of ${formatMonthLabel(month)}`
  const netTone =
    summary.net > 0 ? 'bg-seafoam/15 text-seafoam' : summary.net < 0 ? 'bg-white/10 text-[#ffb4a5]' : 'bg-white/10 text-white/70'

  return (
    <section
      aria-labelledby="balance-heading"
      className="balance-surface relative flex h-full min-h-[300px] flex-col overflow-hidden rounded-3xl p-6 text-ivory shadow-[0_24px_48px_-24px_rgba(12,23,48,0.55)] sm:p-8"
    >
      <div className="relative z-10 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="balance-heading" className="text-sm font-medium text-ivory/70">
            Total balance
          </h2>
          <p className="mt-0.5 text-xs text-ivory/50">{asOf}</p>
        </div>
        <span
          className={cn(
            'tabular inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
            netTone,
          )}
        >
          {formatSignedMoney(summary.net)} in {formatMonthLabel(month).split(' ')[0]}
        </span>
      </div>

      <div className="relative z-10 mt-4">
        <AnimatedMoney
          value={balance}
          className="tabular block max-w-full break-words font-display text-[clamp(2.1rem,10vw,4.5rem)] leading-tight tracking-tight"
        />
        <p className="mt-3 max-w-sm text-sm text-ivory/60">
          Your opening balance plus everything you&apos;ve recorded, including{' '}
          <span className="tabular text-ivory/85">{formatMoney(summary.income)}</span> in and{' '}
          <span className="tabular text-ivory/85">{formatMoney(summary.expenses)}</span> out this
          month.
        </p>
      </div>

      <div
        className="relative z-10 -mx-2 mt-auto h-24 pt-4 sm:-mx-4"
        role="img"
        aria-label={`Daily balance through ${formatMonthLabel(month)}, ending at ${formatMoney(trend.at(-1)?.balance ?? balance)}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 6, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5ed3b0" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#5ed3b0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={['dataMin - 20000', 'dataMax + 20000']} />
            <Tooltip
              cursor={{ stroke: '#f6f2e9', strokeOpacity: 0.3 }}
              content={
                <ChartTooltip
                  formatLabel={(day) => formatDayMonth(makeIsoDate(month, Number(day)))}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="balance"
              name="Balance"
              stroke="#5ed3b0"
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 4, fill: '#5ed3b0', stroke: '#0c1730', strokeWidth: 2 }}
              isAnimationActive={!reduceMotion}
              animationDuration={800}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
