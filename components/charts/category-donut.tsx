'use client'

import { useReducedMotion } from 'motion/react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { getCategory } from '@/lib/finance/categories'
import { formatMoney, formatPercent } from '@/lib/finance/money'
import type { CategorySpend } from '@/lib/finance/types'
import { CategoryDot } from '@/components/common/category-icon'
import { ChartTooltip } from './chart-tooltip'

interface CategoryDonutProps {
  data: readonly CategorySpend[]
  total: number
  /** How many categories to list before grouping the rest. */
  legendLimit?: number
}

export function CategoryDonut({ data, total, legendLimit = 5 }: CategoryDonutProps) {
  const reduceMotion = useReducedMotion()
  const slices = data.map((item) => ({
    ...item,
    name: getCategory(item.categoryId).label,
    color: getCategory(item.categoryId).color,
  }))
  const legend = slices.slice(0, legendLimit)
  const restAmount = slices.slice(legendLimit).reduce((sum, s) => sum + s.amount, 0)

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className="relative h-52 w-52"
        role="img"
        aria-label={`Spending by category, ${formatMoney(total)} in total`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={
                <ChartTooltip
                  formatValue={(value) => formatMoney(value)}
                />
              }
            />
            <Pie
              data={slices}
              dataKey="amount"
              nameKey="name"
              innerRadius={68}
              outerRadius={96}
              paddingAngle={slices.length > 1 ? 2 : 0}
              cornerRadius={5}
              stroke="none"
              isAnimationActive={!reduceMotion}
              animationDuration={800}
            >
              {slices.map((slice) => (
                <Cell key={slice.categoryId} fill={slice.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-medium text-muted-foreground">Total spent</span>
          <span className="tabular font-display text-2xl leading-tight text-foreground">
            {formatMoney(total)}
          </span>
        </div>
      </div>

      <ul className="w-full space-y-2.5">
        {legend.map((item) => (
          <li key={item.categoryId} className="flex items-center gap-2.5 text-sm">
            <CategoryDot categoryId={item.categoryId} />
            <span className="min-w-0 flex-1 truncate text-foreground">{item.name}</span>
            <span className="tabular text-muted-foreground">{formatPercent(item.share * 100)}</span>
            <span className="tabular w-20 text-right font-semibold text-foreground">
              {formatMoney(item.amount)}
            </span>
          </li>
        ))}
        {restAmount > 0 && (
          <li className="flex items-center gap-2.5 text-sm">
            <span aria-hidden="true" className="size-2.5 rounded-full bg-border" />
            <span className="min-w-0 flex-1 truncate text-foreground">Everything else</span>
            <span className="tabular w-20 text-right font-semibold text-foreground">
              {formatMoney(restAmount)}
            </span>
          </li>
        )}
      </ul>
    </div>
  )
}
