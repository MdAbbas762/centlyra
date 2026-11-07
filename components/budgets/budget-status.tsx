import { formatMoney } from '@/lib/finance/money'
import type { BudgetProgress, BudgetStatus } from '@/lib/finance/types'
import { cn } from '@/lib/utils'

export function budgetStatusLabel(progress: BudgetProgress): string {
  switch (progress.status) {
    case 'unused':
      return 'Not started'
    case 'on-track':
      return 'On track'
    case 'near':
      return 'Close to the limit'
    case 'over':
      return 'Over budget'
  }
}

export function budgetDetailText(progress: BudgetProgress): string {
  if (progress.status === 'over') return `${formatMoney(progress.overBy)} over`
  return `${formatMoney(progress.remaining)} left`
}

const BADGE_STYLES: Record<BudgetStatus, string> = {
  unused: 'bg-muted text-muted-foreground',
  'on-track': 'bg-seafoam-soft text-seafoam-ink',
  near: 'bg-amber-soft text-amber-ink',
  over: 'bg-rose-soft text-rose-ink',
}

export function BudgetStatusBadge({ progress, className }: { progress: BudgetProgress; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
        BADGE_STYLES[progress.status],
        className,
      )}
    >
      {budgetStatusLabel(progress)}
    </span>
  )
}
