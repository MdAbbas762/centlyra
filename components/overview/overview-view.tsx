'use client'

import { Plus, ReceiptText, ArrowRight, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { CashflowBarChart, ChartLegend } from '@/components/charts/cashflow-bar-chart'
import { CategoryDonut } from '@/components/charts/category-donut'
import { EmptyState } from '@/components/common/empty-state'
import { MonthSelector } from '@/components/common/month-selector'
import { MotionButton } from '@/components/common/motion-button'
import { PageGate } from '@/components/common/page-gate'
import { PageHeader } from '@/components/common/page-header'
import { Panel } from '@/components/common/panel'
import { StaggerGroup, StaggerItem } from '@/components/common/stagger'
import { USER_FIRST_NAME } from '@/components/layout/account-menu'
import { useTransactionDialog } from '@/components/transactions/transaction-dialog-context'
import { formatMonthLabel } from '@/lib/finance/dates'
import { useAppSelector } from '@/store/hooks'
import {
  OVERVIEW_MONTHS,
  selectCategorySpending,
  selectHydrated,
  selectMonthSummary,
  selectOverviewCashflow,
  selectSelectedMonth,
  selectTransactions,
} from '@/store/selectors'
import { BalanceCard } from './balance-card'
import { BudgetSummary } from './budget-summary'
import { InsightsStrip } from './insights-strip'
import { QuickActions } from './quick-actions'
import { RecentTransactions } from './recent-transactions'
import { StatCards } from './stat-cards'

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function OverviewContent() {
  const { openCreate } = useTransactionDialog()
  const hydrated = useAppSelector(selectHydrated)
  const month = useAppSelector(selectSelectedMonth)
  const summary = useAppSelector(selectMonthSummary)
  const cashflow = useAppSelector(selectOverviewCashflow)
  const categorySpending = useAppSelector(selectCategorySpending)
  const transactions = useAppSelector(selectTransactions)

  const greeting = useMemo(() => (hydrated ? getGreeting(new Date().getHours()) : ''), [hydrated])
  const hasCashflow = cashflow.some((point) => point.income > 0 || point.expenses > 0)

  return (
    <StaggerGroup className="space-y-6">
      <StaggerItem>
        <PageHeader
          title={`${greeting}, ${USER_FIRST_NAME}`}
          description="A closer look at your balance, spending, and plans for the month."
          actions={
            <>
              <MonthSelector />
              <MotionButton onClick={() => openCreate()} className="bg-navy text-ivory hover:bg-navy-soft">
                <Plus className="size-4" aria-hidden="true" />
                Add transaction
              </MotionButton>
            </>
          }
        />
      </StaggerItem>

      {transactions.length === 0 && <StaggerItem>
        <section className="relative flex min-w-0 flex-col gap-4 overflow-hidden rounded-3xl border border-seafoam/30 bg-seafoam-soft/50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6" aria-label="Get started">
          <div className="relative z-10 flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-seafoam/25 text-seafoam-ink"><Sparkles size={20} aria-hidden="true"/></span>
            <div className="min-w-0"><h2 className="font-semibold text-navy">Your workspace is ready.</h2><p className="mt-1 max-w-lg text-sm leading-relaxed text-muted-foreground">Add your first transaction to start building your financial picture. Charts and budgets will follow your activity.</p></div>
          </div>
          <button onClick={() => openCreate()} className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-soft sm:self-auto">Get started <ArrowRight size={16} aria-hidden="true"/></button>
        </section>
      </StaggerItem>}
      <StaggerItem className="grid min-w-0 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <BalanceCard />
        </div>
        <div className="lg:col-span-5">
          <QuickActions />
        </div>
      </StaggerItem>

      <StaggerItem>
        <StatCards />
      </StaggerItem>

      {transactions.length > 0 && <StaggerItem>
        <InsightsStrip />
      </StaggerItem>}

      <StaggerItem className="grid min-w-0 gap-4 lg:grid-cols-12">
        <Panel
          title="Your monthly overview"
          description={`Money in and money out over the last ${OVERVIEW_MONTHS} months.`}
          headingId="monthly-overview-heading"
          className="lg:col-span-7"
          action={
            <ChartLegend
              items={[
                { label: 'Money in', color: '#5ed3b0' },
                { label: 'Money out', color: '#0c1730' },
              ]}
            />
          }
        >
          {hasCashflow ? (
            <CashflowBarChart data={cashflow} height={350} />
          ) : (
            <EmptyState
              icon={ReceiptText}
              title="No activity to chart yet"
              description="Once you record some transactions, your monthly activity will appear here."
            />
          )}
        </Panel>

        <Panel
          title="Spending by category"
          description={`Where your money went in ${formatMonthLabel(month)}.`}
          headingId="category-spending-heading"
          className="lg:col-span-5"
        >
          {categorySpending.length > 0 ? (
            <CategoryDonut data={categorySpending} total={summary.expenses} />
          ) : (
            <EmptyState
              icon={ReceiptText}
              title="No spending recorded"
              description="Nothing has gone out this month, so there's no breakdown to show."
            />
          )}
        </Panel>
      </StaggerItem>

      <StaggerItem className="grid min-w-0 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <RecentTransactions />
        </div>
        <div className="lg:col-span-5">
          <BudgetSummary />
        </div>
      </StaggerItem>
    </StaggerGroup>
  )
}

export function OverviewView() {
  return (
    <PageGate>
      <OverviewContent />
    </PageGate>
  )
}
