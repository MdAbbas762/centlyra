'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { motion } from 'motion/react'
import { CategoryIcon } from '@/components/common/category-icon'
import { ProgressBar } from '@/components/common/progress-bar'
import { Button } from '@/components/ui/button'
import { getCategory } from '@/lib/finance/categories'
import { formatMoney, formatPercent } from '@/lib/finance/money'
import type { BudgetProgress } from '@/lib/finance/types'
import { cn } from '@/lib/utils'
import { BudgetStatusBadge, budgetDetailText } from './budget-status'

interface BudgetCardProps {
  progress: BudgetProgress
  onEdit: () => void
  onDelete: () => void
}

export function BudgetCard({ progress, onEdit, onDelete }: BudgetCardProps) {
  const category = getCategory(progress.budget.categoryId)

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="surface flex min-w-0 flex-col gap-4 p-4 sm:gap-5 sm:p-5"
      aria-label={`${category.label} budget`}
    >
      <header className="flex items-start gap-3">
        <CategoryIcon categoryId={progress.budget.categoryId} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold text-foreground">{category.label}</h3>
          <p className="tabular text-xs text-muted-foreground">
            {formatMoney(progress.budget.limit)} a month
          </p>
        </div>
        <div className="-mr-1.5 flex shrink-0 gap-0.5">
          <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={onEdit}>
            <Pencil aria-hidden="true" />
            <span className="sr-only">Edit {category.label} budget</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-rose-ink hover:bg-rose-soft hover:text-rose-ink"
            onClick={onDelete}
          >
            <Trash2 aria-hidden="true" />
            <span className="sr-only">Delete {category.label} budget</span>
          </Button>
        </div>
      </header>

      <div>
        <div className="mb-3 flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
          <p className="tabular font-display text-[clamp(1.55rem,6vw,2rem)] leading-tight text-foreground">
            {formatMoney(progress.spent)}
            <span className="ml-1.5 font-sans text-sm text-muted-foreground">spent</span>
          </p>
          <BudgetStatusBadge progress={progress} />
        </div>
        <ProgressBar
          value={progress.utilization}
          status={progress.status}
          label={`${category.label} budget used`}
        />
      </div>

      <footer className="flex items-center justify-between border-t border-border pt-3.5 text-sm">
        <span
          className={cn(
            'tabular font-semibold',
            progress.status === 'over' ? 'text-rose-ink' : 'text-foreground',
          )}
        >
          {budgetDetailText(progress)}
        </span>
        <span className="tabular text-muted-foreground">{formatPercent(progress.utilization)} used</span>
      </footer>
    </motion.article>
  )
}
