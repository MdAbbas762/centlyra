'use client'

import { ChartNoAxesCombined, Gauge, PiggyBank, Receipt, Scale, TrendingDown } from 'lucide-react'
import { CashflowBarChart, ChartLegend } from '@/components/charts/cashflow-bar-chart'
import { CategoryDonut } from '@/components/charts/category-donut'
import { NetCashflowChart } from '@/components/charts/net-cashflow-chart'
import { SpendingTrendChart } from '@/components/charts/spending-trend-chart'
import { AnimatedMoney } from '@/components/common/animated-money'
import { EmptyState } from '@/components/common/empty-state'
import { MetricCard } from '@/components/common/metric-card'
import { MonthSelector } from '@/components/common/month-selector'
import { PageGate } from '@/components/common/page-gate'
import { PageHeader } from '@/components/common/page-header'
import { Panel } from '@/components/common/panel'
import { StaggerGroup, StaggerItem } from '@/components/common/stagger'
import { DeltaChip } from '@/components/common/delta-chip'
import { addMonths, formatMonthLabel, formatMonthName } from '@/lib/finance/dates'
import { formatMoney, formatPercent, formatSignedMoney } from '@/lib/finance/money'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  selectAnalytics,
  selectAnalyticsRange,
  selectIsCurrentMonth,
  selectMonthComparison,
  selectSelectedMonth,
} from '@/store/selectors'
import { analyticsRangeSelected, type AnalyticsRange } from '@/store/slices/appSlice'
import { CategoryComparisonTable } from './category-comparison-table'
import { TopCategories } from './top-categories'

const RANGE_OPTIONS: ReadonlyArray<{ value: AnalyticsRange; label: string }> = [
  { value: 3, label: '3 months' },
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' },
]

function RangeSelector() {
  const dispatch = useAppDispatch()
  const range = useAppSelector(selectAnalyticsRange)

  return (
    <div role="radiogroup" aria-label="Reporting period length" className="grid w-full grid-cols-3 gap-1 rounded-xl border border-border bg-card p-1 shadow-xs sm:w-auto">
      {RANGE_OPTIONS.map((option) => {
        const selected = range === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => dispatch(analyticsRangeSelected(option.value))}
            className={cn(
              'h-8 rounded-lg px-3 text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40',
              selected ? 'bg-navy text-ivory' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function AnalyticsContent() {
  const month = useAppSelector(selectSelectedMonth)
  const range = useAppSelector(selectAnalyticsRange)
  const isCurrent = useAppSelector(selectIsCurrentMonth)
  const analytics = useAppSelector(selectAnalytics)
  const comparison = useAppSelector(selectMonthComparison)

  const firstMonth = analytics.months[0]
  const periodLabel = `${formatMonthLabel(firstMonth)} to ${formatMonthLabel(month)}`
  const previousMonth = addMonths(month, -1)
  const compareLabel = isCurrent ? 'vs same point last month' : `vs ${formatMonthName(previousMonth)}`
  const { totals } = analytics

  return (
    <StaggerGroup className="space-y-6">
      <StaggerItem>
        <PageHeader
          title="Analytics"
          description={`Review your spending over time. Showing ${periodLabel}.`}
          actions={
            <>
              <MonthSelector label="Period ending" />
              <RangeSelector />
            </>
          }
        />
      </StaggerItem>

      {!analytics.hasData ? (
        <StaggerItem>
          <div className="surface">
            <EmptyState
              icon={ChartNoAxesCombined}
              title="Nothing to analyse for this period"
              description="There are no transactions in the months you've selected. Try a longer period or a different month."
            />
          </div>
        </StaggerItem>
      ) : (
        <>
          <StaggerItem className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Average monthly spending"
              icon={Gauge}
              iconClassName="bg-navy text-ivory"
              value={<AnimatedMoney value={analytics.averageSpending} />}
              footer={
                <p className="text-xs text-muted-foreground">
                  Across {analytics.averageMonthCount} full {analytics.averageMonthCount === 1 ? 'month' : 'months'}
                </p>
              }
            />
            <MetricCard
              label="Net cash flow"
              icon={Scale}
              iconClassName="bg-cobalt-soft text-cobalt"
              value={
                <AnimatedMoney
                  value={totals.net}
                  format={formatSignedMoney}
                  className={totals.net < 0 ? 'text-rose-ink' : undefined}
                />
              }
              footer={
                <p className="text-xs text-muted-foreground">
                  {formatMoney(totals.income)} in, {formatMoney(totals.expenses)} out over {range} months
                </p>
              }
            />
            <MetricCard
              label="Savings rate"
              icon={PiggyBank}
              iconClassName="bg-seafoam-soft text-seafoam-ink"
              value={analytics.savingsRate === null ? '—' : formatPercent(analytics.savingsRate, 1)}
              footer={
                <p className="text-xs text-muted-foreground">
                  {analytics.savingsRate === null
                    ? 'No income recorded in this period'
                    : 'Share of income you kept'}
                </p>
              }
            />
            <MetricCard
              label="Largest expense"
              icon={Receipt}
              iconClassName="bg-amber-soft text-amber-ink"
              value={analytics.largestExpense ? formatMoney(analytics.largestExpense.amount) : '—'}
              footer={
                <p className="truncate text-xs text-muted-foreground">
                  {analytics.largestExpense
                    ? `${analytics.largestExpense.description} · ${analytics.largestExpense.merchant}`
                    : 'No spending in this period'}
                </p>
              }
            />
          </StaggerItem>

          <StaggerItem className="grid min-w-0 gap-4 lg:grid-cols-12">
            <Panel
              title="Income versus expenses"
              description="How much came in and went out each month."
              headingId="income-expenses-heading"
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
              <CashflowBarChart data={analytics.series} height={300} />
            </Panel>
            <Panel
              title="Net cash flow"
              description="What was left each month after spending."
              headingId="net-cashflow-heading"
              className="lg:col-span-5"
            >
              <NetCashflowChart data={analytics.series} height={300} />
            </Panel>
          </StaggerItem>

          <StaggerItem className="grid min-w-0 gap-4 lg:grid-cols-12">
            <Panel
              title="Spending trend"
              description={`Running total of spending through ${formatMonthLabel(month)}.`}
              headingId="spending-trend-heading"
              className="lg:col-span-7"
              action={
                <ChartLegend
                  items={[
                    { label: formatMonthName(month), color: '#2b50e6' },
                    { label: formatMonthName(previousMonth), color: '#8a97ab', dashed: true },
                  ]}
                />
              }
            >
              <SpendingTrendChart
                current={analytics.trend.current}
                previous={analytics.trend.previous}
                month={month}
                previousMonth={analytics.trend.previousMonth}
                height={380}
              />
            </Panel>
            <Panel
              title="Spending by category"
              description={`Where your money went over ${range} months.`}
              headingId="analytics-category-heading"
              className="lg:col-span-5"
            >
              {analytics.categories.length > 0 ? (
                <CategoryDonut data={analytics.categories} total={totals.expenses} />
              ) : (
                <EmptyState
                  icon={TrendingDown}
                  title="No spending recorded"
                  description="There's no spending in this period to break down."
                />
              )}
            </Panel>
          </StaggerItem>

          <StaggerItem className="grid min-w-0 gap-4 lg:grid-cols-12">
            <Panel
              title="Highest spending categories"
              description={`Your biggest areas of spending over ${range} months.`}
              headingId="top-categories-heading"
              className="lg:col-span-5"
            >
              <TopCategories categories={analytics.categories} />
            </Panel>
            <Panel
              title="Month-over-month comparison"
              description={`${formatMonthLabel(month)} ${isCurrent ? 'so far, against the same point in' : 'compared with'} ${formatMonthName(previousMonth)}.`}
              headingId="mom-heading"
              className="lg:col-span-7"
            >
              <dl className="mb-5 grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Money in', value: comparison.income, worse: false },
                  { label: 'Money out', value: comparison.expenses, worse: true },
                  { label: 'Net cash flow', value: comparison.net, worse: false },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl bg-muted/60 p-3.5">
                    <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
                    <dd className="tabular mt-1 text-base font-semibold text-foreground">
                      {formatSignedMoney(item.value.change)}
                    </dd>
                    <DeltaChip
                      comparison={item.value}
                      higherIsWorse={item.worse}
                      label={compareLabel}
                      className="mt-1.5 flex-wrap"
                    />
                  </div>
                ))}
              </dl>
              <CategoryComparisonTable
                rows={analytics.categoryComparison}
                currentLabel={formatMonthName(month)}
                previousLabel={formatMonthName(previousMonth)}
              />
            </Panel>
          </StaggerItem>
        </>
      )}
    </StaggerGroup>
  )
}

export function AnalyticsView() {
  return (
    <PageGate>
      <AnalyticsContent />
    </PageGate>
  )
}
