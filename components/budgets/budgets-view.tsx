'use client'

import { Plus, Target } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { AnimatedMoney } from '@/components/common/animated-money'
import { CategoryIcon } from '@/components/common/category-icon'
import { EmptyState } from '@/components/common/empty-state'
import { MonthSelector } from '@/components/common/month-selector'
import { MotionButton } from '@/components/common/motion-button'
import { PageGate } from '@/components/common/page-gate'
import { PageHeader } from '@/components/common/page-header'
import { Panel } from '@/components/common/panel'
import { ProgressBar } from '@/components/common/progress-bar'
import { StaggerGroup, StaggerItem } from '@/components/common/stagger'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { getBudgetStatus } from '@/lib/finance/calculations'
import { getCategory } from '@/lib/finance/categories'
import { formatMonthLabel } from '@/lib/finance/dates'
import { formatMoney, formatPercent } from '@/lib/finance/money'
import type { Budget } from '@/lib/finance/types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectBudgetProgress,
  selectBudgetTotals,
  selectSelectedMonth,
  selectUnbudgetedSpending,
} from '@/store/selectors'
import { budgetDeleted } from '@/store/slices/budgetsSlice'
import { BudgetCard } from './budget-card'
import { BudgetFormDialog, type BudgetDialogState } from './budget-form-dialog'

function BudgetsContent() {
  const dispatch = useAppDispatch()
  const month = useAppSelector(selectSelectedMonth)
  const progress = useAppSelector(selectBudgetProgress)
  const totals = useAppSelector(selectBudgetTotals)
  const unbudgeted = useAppSelector(selectUnbudgetedSpending)

  const [dialog, setDialog] = useState<BudgetDialogState | null>(null)
  const [deleting, setDeleting] = useState<Budget | null>(null)

  const monthLabel = formatMonthLabel(month)
  const status = getBudgetStatus(totals.spent, totals.limit)

  const confirmDelete = () => {
    if (!deleting) return
    dispatch(budgetDeleted(deleting.id))
    toast.success('Budget deleted.', {
      description: `${getCategory(deleting.categoryId).label} no longer has a monthly limit.`,
    })
    setDeleting(null)
  }

  return (
    <StaggerGroup className="space-y-6">
      <StaggerItem>
        <PageHeader
          title="Budgets"
          description={`See how your spending compares with your monthly limits for ${monthLabel}.`}
          actions={
            <>
              <MonthSelector />
              <MotionButton
                onClick={() => setDialog({ mode: 'create' })}
                className="bg-navy text-ivory hover:bg-navy-soft"
              >
                <Plus className="size-4" aria-hidden="true" />
                Create budget
              </MotionButton>
            </>
          }
        />
      </StaggerItem>

      {progress.length === 0 ? (
        <StaggerItem>
          <div className="surface">
            <EmptyState
              icon={Target}
              title="You haven't set any budgets yet"
              description="Choose a category and a monthly limit, and Centlyra will show how you're pacing each month."
              action={<MotionButton onClick={() => setDialog({ mode: 'create' })}>Create your first budget</MotionButton>}
            />
          </div>
        </StaggerItem>
      ) : (
        <>
          <StaggerItem>
            <section
              aria-labelledby="budget-totals-heading"
              className="balance-surface grid min-w-0 gap-6 rounded-3xl p-5 text-ivory shadow-[0_24px_48px_-24px_rgba(12,23,48,0.55)] sm:p-8 lg:grid-cols-[1.3fr_1fr] lg:items-end"
            >
              <div>
                <h2 id="budget-totals-heading" className="text-sm font-medium text-ivory/70">
                  Remaining this month
                </h2>
                <p className="mt-3">
                  <AnimatedMoney
                    value={totals.remaining}
                    className="tabular block break-words font-display text-[clamp(2rem,9vw,4rem)] leading-tight"
                  />
                </p>
                <p className="mt-3 text-sm text-ivory/60">
                  {totals.remaining >= 0
                    ? `You've used ${formatPercent(totals.utilization)} of what you planned to spend in ${monthLabel}.`
                    : `You're ${formatMoney(Math.abs(totals.remaining))} above your combined limits in ${monthLabel}.`}
                </p>
              </div>
              <div>
                <dl className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-ivory/55">Total budgeted</dt>
                    <dd className="tabular mt-0.5 text-lg font-semibold">{formatMoney(totals.limit)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-ivory/55">Spent so far</dt>
                    <dd className="tabular mt-0.5 text-lg font-semibold">{formatMoney(totals.spent)}</dd>
                  </div>
                </dl>
                <ProgressBar
                  value={totals.utilization}
                  status={status === 'unused' ? 'on-track' : status}
                  label="All budgets combined"
                  className="bg-white/15"
                />
                <p className="mt-3 text-xs text-ivory/60">
                  {totals.overCount > 0
                    ? `${totals.overCount} ${totals.overCount === 1 ? 'budget is' : 'budgets are'} over the limit`
                    : totals.nearCount > 0
                      ? `${totals.nearCount} ${totals.nearCount === 1 ? 'budget is' : 'budgets are'} close to the limit`
                      : totals.spent === 0
                        ? 'Nothing spent against your budgets yet'
                        : 'Every budget is on track'}
                </p>
              </div>
            </section>
          </StaggerItem>

          <StaggerItem>
            <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {progress.map((item) => (
                <li key={item.budget.id} className="contents">
                  <BudgetCard
                    progress={item}
                    onEdit={() => setDialog({ mode: 'edit', budget: item.budget })}
                    onDelete={() => setDeleting(item.budget)}
                  />
                </li>
              ))}
            </ul>
          </StaggerItem>
        </>
      )}

      {unbudgeted.items.length > 0 && (
        <StaggerItem>
          <Panel
            title="Spending without a budget"
            description={`${formatMoney(unbudgeted.total)} in ${monthLabel} isn't covered by a monthly limit.`}
            headingId="unbudgeted-heading"
          >
            <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {unbudgeted.items.map((item) => (
                <li key={item.categoryId} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] sm:grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-2 gap-y-2 border-b border-border/70 py-3 last:border-b-0 sm:gap-x-3 sm:[&:nth-last-child(2):nth-child(odd)]:border-b-0">
                  <CategoryIcon categoryId={item.categoryId} size="sm" />
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">
                    {getCategory(item.categoryId).label}
                  </span>
                  <span className="tabular text-right text-xs font-semibold sm:text-sm">{formatMoney(item.amount)}</span>
                  {getCategory(item.categoryId).kind === 'expense' && (
                    <Button
                      variant="ghost"
                      className="col-start-2 col-span-2 h-8 w-fit whitespace-nowrap rounded-lg px-0 text-xs font-semibold text-cobalt sm:col-start-auto sm:col-span-1 sm:px-2"
                      onClick={() => setDialog({ mode: 'create', categoryId: item.categoryId })}
                    >
                      Set budget
                      <span className="sr-only"> for {getCategory(item.categoryId).label}</span>
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </Panel>
        </StaggerItem>
      )}

      <BudgetFormDialog state={dialog} onClose={() => setDialog(null)} />

      <AlertDialog open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this budget?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? `The ${getCategory(deleting.categoryId).label} limit of ${formatMoney(deleting.limit)} will be removed. Your transactions won't change.`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep budget</AlertDialogCancel>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete budget
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StaggerGroup>
  )
}

export function BudgetsView() {
  return (
    <PageGate>
      <BudgetsContent />
    </PageGate>
  )
}
