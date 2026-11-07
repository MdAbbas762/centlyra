'use client'

import { ArrowRight, Target } from 'lucide-react'
import Link from 'next/link'
import { BudgetStatusBadge, budgetDetailText } from '@/components/budgets/budget-status'
import { CategoryIcon } from '@/components/common/category-icon'
import { EmptyState } from '@/components/common/empty-state'
import { Panel } from '@/components/common/panel'
import { ProgressBar } from '@/components/common/progress-bar'
import { buttonVariants } from '@/components/ui/button'
import { getCategory } from '@/lib/finance/categories'
import { formatMoney, formatPercent } from '@/lib/finance/money'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'
import { selectBudgetProgress, selectBudgetTotals } from '@/store/selectors'

const VISIBLE_BUDGETS = 4

export function BudgetSummary() {
  const progress = useAppSelector(selectBudgetProgress)
  const totals = useAppSelector(selectBudgetTotals)
  const visible = progress.slice(0, VISIBLE_BUDGETS)

  return (
    <Panel
      title="Monthly budget"
      description={
        progress.length > 0
          ? `${formatMoney(totals.spent)} of ${formatMoney(totals.limit)} used (${formatPercent(totals.utilization)}).`
          : 'Set limits to keep spending on track.'
      }
      headingId="budget-summary-heading"
      className="h-full"
      action={
        <Link
          href="/workspace/budgets"
          className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-md text-sm font-semibold text-cobalt transition-colors hover:text-navy focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          Manage budgets
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      }
    >
      {progress.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No budgets yet"
          description="Create a monthly budget for a category to see how you're pacing."
          action={
            <Link href="/workspace/budgets" className={cn(buttonVariants(), 'h-10 rounded-xl px-4 font-semibold')}>
              Create a budget
            </Link>
          }
        />
      ) : (
        <ul className="space-y-5">
          {visible.map((item) => {
            const category = getCategory(item.budget.categoryId)
            return (
              <li key={item.budget.id}>
                <div className="mb-2 flex items-center gap-3">
                  <CategoryIcon categoryId={item.budget.categoryId} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{category.label}</p>
                    <p className="tabular break-words text-xs text-muted-foreground">
                      {formatMoney(item.spent)} of {formatMoney(item.budget.limit)} · {budgetDetailText(item)}
                    </p>
                  </div>
                  <BudgetStatusBadge progress={item} className="hidden sm:inline-flex" />
                </div>
                <ProgressBar
                  value={item.utilization}
                  status={item.status}
                  label={`${category.label} budget used`}
                />
              </li>
            )
          })}
          {progress.length > VISIBLE_BUDGETS && (
            <li className="text-xs text-muted-foreground">
              Plus {progress.length - VISIBLE_BUDGETS} more on the budgets page.
            </li>
          )}
        </ul>
      )}
    </Panel>
  )
}
