'use client'

import { motion } from 'motion/react'
import { Inbox } from 'lucide-react'
import { CategoryIcon } from '@/components/common/category-icon'
import { EmptyState } from '@/components/common/empty-state'
import { getCategory } from '@/lib/finance/categories'
import { formatMoney, formatPercent } from '@/lib/finance/money'
import type { CategorySpend } from '@/lib/finance/types'

const MAX_ROWS = 6

export function TopCategories({ categories }: { categories: readonly CategorySpend[] }) {
  if (categories.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No spending recorded"
        description="Your highest spending categories will appear here."
      />
    )
  }

  const top = categories.slice(0, MAX_ROWS)
  const largest = top[0].amount

  return (
    <ol className="space-y-4">
      {top.map((item, index) => {
        const category = getCategory(item.categoryId)
        return (
          <li key={item.categoryId}>
            <div className="mb-1.5 flex items-center gap-3">
              <span className="w-4 text-xs font-semibold text-muted-foreground tabular">{index + 1}</span>
              <CategoryIcon categoryId={item.categoryId} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
                {category.label}
              </span>
              <span className="tabular text-xs text-muted-foreground">{formatPercent(item.share * 100)}</span>
              <span className="tabular w-20 text-right text-sm font-semibold">{formatMoney(item.amount)}</span>
            </div>
            <div className="ml-7 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: category.color }}
                initial={false}
                animate={{ width: `${(item.amount / largest) * 100}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 24 }}
              />
            </div>
          </li>
        )
      })}
    </ol>
  )
}
