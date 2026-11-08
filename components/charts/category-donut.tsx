'use client'

import { useState } from 'react'
import { getCategory } from '@/lib/finance/categories'
import { formatMoney, formatPercent } from '@/lib/finance/money'
import type { CategorySpend } from '@/lib/finance/types'
import { CategoryDot } from '@/components/common/category-icon'

interface CategoryDonutProps {
  data: readonly CategorySpend[]
  total: number
  legendLimit?: number
}

/** SVG segments are rendered directly; financial totals still come from existing Redux selectors. */
export function CategoryDonut({ data, total, legendLimit = 5 }: CategoryDonutProps) {
  const [hover, setHover] = useState<string | null>(null)
  const slices = data.map((item) => ({ ...item, name: getCategory(item.categoryId).label, color: getCategory(item.categoryId).color }))
  const legend = slices.slice(0, legendLimit)
  const restAmount = slices.slice(legendLimit).reduce((sum, item) => sum + item.amount, 0)
  const radius = 78
  const circumference = 2 * Math.PI * radius
  const totalSpend = slices.reduce((sum, item) => sum + item.amount, 0)
  let cumulative = 0

  return <div className="flex flex-col items-center gap-5">
    <div className="relative h-52 w-52" role="img" aria-label={`Spending by category, ${formatMoney(total)} in total`}>
      <svg viewBox="0 0 208 208" className="h-full w-full" aria-hidden="true">
        <circle cx="104" cy="104" r={radius} fill="none" stroke="#e8e5dc" strokeWidth="28"/>
        {slices.map((item) => {
          const fraction = totalSpend > 0 ? item.amount / totalSpend : 0
          const offset = cumulative
          cumulative += fraction * circumference
          const gap = slices.length > 1 ? 4 : 0
          const length = Math.max(0, fraction * circumference - gap)
          return <circle key={item.categoryId} cx="104" cy="104" r={radius} fill="none" stroke={item.color} strokeWidth="28" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} transform="rotate(-90 104 104)" tabIndex={0}
            onMouseEnter={() => setHover(`${item.name}: ${formatMoney(item.amount)} (${formatPercent(item.share * 100)})`)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(`${item.name}: ${formatMoney(item.amount)} (${formatPercent(item.share * 100)})`)} onBlur={() => setHover(null)}>
            <title>{item.name}: {formatMoney(item.amount)} ({formatPercent(item.share * 100)})</title>
          </circle>
        })}
      </svg>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-medium text-muted-foreground">{hover ? 'Category spending' : 'Total spent'}</span>
        <span className="tabular font-display text-2xl leading-tight text-foreground">{formatMoney(total)}</span>
      </div>
    </div>
    <ul className="w-full space-y-2.5">
      {legend.map((item) => <li key={item.categoryId} className="flex items-center gap-2.5 text-sm">
        <CategoryDot categoryId={item.categoryId}/>
        <span className="min-w-0 flex-1 truncate text-foreground">{item.name}</span>
        <span className="tabular text-muted-foreground">{formatPercent(item.share * 100)}</span>
        <span className="tabular w-20 text-right font-semibold text-foreground">{formatMoney(item.amount)}</span>
      </li>)}
      {restAmount > 0 && <li className="flex items-center gap-2.5 text-sm">
        <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-border"/>
        <span className="min-w-0 flex-1 truncate text-foreground">Everything else</span>
        <span className="tabular w-20 text-right font-semibold text-foreground">{formatMoney(restAmount)}</span>
      </li>}
    </ul>
  </div>
}
