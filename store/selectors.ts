import { createSelector } from '@reduxjs/toolkit'
import {
  averagePerMonth,
  calculateAllBudgetProgress,
  calculateBalance,
  calculateBudgetTotals,
  compareCategorySpending,
  compareValues,
  dailyBalance,
  dailySpending,
  filterByMonth,
  filterByMonthRange,
  getComparablePrevious,
  largestExpense,
  monthlySeries,
  savingsRate,
  spendingByCategory,
  summarize,
} from '@/lib/finance/calculations'
import {
  addMonths,
  getDayOfMonth,
  getMonthEnd,
  getMonthRange,
  getMonthsBetween,
  toMonthKey,
} from '@/lib/finance/dates'
import { buildInsights } from '@/lib/finance/insights'
import { sortTransactions } from '@/lib/finance/filtering'
import type { RootState } from './index'

const createAppSelector = createSelector.withTypes<RootState>()

export const OVERVIEW_MONTHS = 6
export const RECENT_TRANSACTION_COUNT = 6

export const selectHydrated = (state: RootState) => state.app.hydrated
export const selectToday = (state: RootState) => state.app.today
export const selectTransactions = (state: RootState) => state.transactions.items
export const selectOpeningBalance = (state: RootState) => state.transactions.openingBalance
export const selectBudgets = (state: RootState) => state.budgets.items
export const selectAnalyticsRange = (state: RootState) => state.app.analyticsRange

export const selectCurrentMonth = createAppSelector([selectToday], (today) => toMonthKey(today))

export const selectSelectedMonth = createAppSelector(
  [(state: RootState) => state.app.selectedMonth, selectCurrentMonth],
  (selected, current) => (selected && selected <= current ? selected : current),
)

export const selectIsCurrentMonth = createAppSelector(
  [selectSelectedMonth, selectCurrentMonth],
  (selected, current) => selected === current,
)

/** Last day to chart for the selected month: today when in progress, otherwise the full month. */
export const selectLastDayToShow = createAppSelector(
  [selectIsCurrentMonth, selectToday],
  (isCurrent, today) => (isCurrent ? getDayOfMonth(today) : undefined),
)

export const selectAvailableMonths = createAppSelector(
  [selectTransactions, selectCurrentMonth, selectSelectedMonth],
  (transactions, current, selected) => {
    const earliest = transactions.reduce(
      (min, t) => (toMonthKey(t.date) < min ? toMonthKey(t.date) : min),
      selected < current ? selected : current,
    )
    return getMonthsBetween(earliest, current)
  },
)

export const selectMonthTransactions = createAppSelector(
  [selectTransactions, selectSelectedMonth],
  (transactions, month) => filterByMonth(transactions, month),
)

export const selectMonthSummary = createAppSelector([selectMonthTransactions], summarize)

export const selectComparablePrevious = createAppSelector(
  [selectTransactions, selectSelectedMonth, selectToday],
  getComparablePrevious,
)

export const selectPreviousSummary = createAppSelector(
  [selectComparablePrevious],
  (previous) => summarize(previous.transactions),
)

export const selectMonthComparison = createAppSelector(
  [selectMonthSummary, selectPreviousSummary],
  (current, previous) => ({
    income: compareValues(current.income, previous.income),
    expenses: compareValues(current.expenses, previous.expenses),
    net: compareValues(current.net, previous.net),
  }),
)

export const selectTotalBalance = createAppSelector(
  [selectOpeningBalance, selectTransactions, selectSelectedMonth],
  (opening, transactions, month) => calculateBalance(opening, transactions, getMonthEnd(month)),
)

export const selectBalanceTrend = createAppSelector(
  [selectOpeningBalance, selectTransactions, selectSelectedMonth, selectLastDayToShow],
  (opening, transactions, month, lastDay) => dailyBalance(opening, transactions, month, lastDay),
)

export const selectCategorySpending = createAppSelector(
  [selectMonthTransactions],
  spendingByCategory,
)

export const selectBudgetProgress = createAppSelector(
  [selectBudgets, selectMonthTransactions],
  (budgets, monthTransactions) =>
    calculateAllBudgetProgress(budgets, monthTransactions).sort(
      (a, b) => b.utilization - a.utilization || a.budget.categoryId.localeCompare(b.budget.categoryId),
    ),
)

export const selectBudgetTotals = createAppSelector([selectBudgetProgress], calculateBudgetTotals)

/** Spending in the selected month in categories that have no budget. */
export const selectUnbudgetedSpending = createAppSelector(
  [selectCategorySpending, selectBudgets],
  (spending, budgets) => {
    const budgeted = new Set(budgets.map((b) => b.categoryId))
    const unbudgeted = spending.filter((s) => !budgeted.has(s.categoryId))
    return { items: unbudgeted, total: unbudgeted.reduce((sum, s) => sum + s.amount, 0) }
  },
)

export const selectRecentTransactions = createAppSelector([selectMonthTransactions], (items) =>
  sortTransactions(items, 'date-desc').slice(0, RECENT_TRANSACTION_COUNT),
)

export const selectOverviewCashflow = createAppSelector(
  [selectTransactions, selectSelectedMonth],
  (transactions, month) => monthlySeries(transactions, month, OVERVIEW_MONTHS),
)

export const selectInsights = createAppSelector(
  [
    selectSelectedMonth,
    selectIsCurrentMonth,
    selectMonthSummary,
    selectPreviousSummary,
    selectComparablePrevious,
    selectBudgetProgress,
    selectCategorySpending,
  ],
  (month, isCurrentMonth, summary, previousSummary, previous, budgetProgress, categorySpending) =>
    buildInsights({
      month,
      isCurrentMonth,
      summary,
      previousSummary,
      previousMonth: previous.month,
      budgetProgress,
      categorySpending,
    }),
)

export const selectAnalytics = createAppSelector(
  [
    selectTransactions,
    selectSelectedMonth,
    selectAnalyticsRange,
    selectIsCurrentMonth,
    selectToday,
    selectComparablePrevious,
    selectMonthTransactions,
  ],
  (transactions, month, range, isCurrent, today, previous, monthTransactions) => {
    const months = getMonthRange(month, range)
    const periodTransactions = filterByMonthRange(transactions, months)
    const series = monthlySeries(transactions, month, range)
    const totals = summarize(periodTransactions)

    const fullMonths = isCurrent && range > 1 ? series.slice(0, -1) : series
    const averageSpending = averagePerMonth(
      fullMonths.reduce((sum, p) => sum + p.expenses, 0),
      fullMonths.length,
    )
    const averageIncome = averagePerMonth(
      fullMonths.reduce((sum, p) => sum + p.income, 0),
      fullMonths.length,
    )

    const lastDay = isCurrent ? getDayOfMonth(today) : undefined
    const previousMonth = addMonths(month, -1)

    return {
      months,
      series,
      totals,
      averageSpending,
      averageIncome,
      averageMonthCount: fullMonths.length,
      savingsRate: savingsRate(totals.income, totals.net),
      largestExpense: largestExpense(periodTransactions),
      categories: spendingByCategory(periodTransactions),
      trend: {
        current: dailySpending(transactions, month, lastDay),
        previous: dailySpending(transactions, previousMonth),
        previousMonth,
      },
      categoryComparison: compareCategorySpending(monthTransactions, previous.transactions),
      hasData: periodTransactions.length > 0,
    }
  },
)
