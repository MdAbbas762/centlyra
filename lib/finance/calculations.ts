import { getCategoryOrder } from './categories'
import {
  addMonths,
  getDayOfMonth,
  getDaysInMonth,
  getMonthRange,
  toMonthKey,
} from './dates'
import type {
  Budget,
  BudgetProgress,
  BudgetStatus,
  CategorySpend,
  Comparison,
  DailyBalancePoint,
  DailySpendPoint,
  IsoDate,
  MonthKey,
  MonthlyPoint,
  PeriodSummary,
  Transaction,
} from './types'

/** Share of a budget used at which it is considered close to its limit. */
export const NEAR_LIMIT_THRESHOLD = 80

export function totalIncome(transactions: readonly Transaction[]): number {
  return transactions.reduce((sum, t) => (t.type === 'income' ? sum + t.amount : sum), 0)
}

export function totalExpenses(transactions: readonly Transaction[]): number {
  return transactions.reduce((sum, t) => (t.type === 'expense' ? sum + t.amount : sum), 0)
}

export function netCashFlow(transactions: readonly Transaction[]): number {
  return totalIncome(transactions) - totalExpenses(transactions)
}

export function summarize(transactions: readonly Transaction[]): PeriodSummary {
  const income = totalIncome(transactions)
  const expenses = totalExpenses(transactions)
  return { income, expenses, net: income - expenses, transactionCount: transactions.length }
}

export function filterByMonth(
  transactions: readonly Transaction[],
  month: MonthKey,
): Transaction[] {
  return transactions.filter((t) => toMonthKey(t.date) === month)
}

export function filterByMonthRange(
  transactions: readonly Transaction[],
  months: readonly MonthKey[],
): Transaction[] {
  if (months.length === 0) return []
  const first = months[0]
  const last = months[months.length - 1]
  return transactions.filter((t) => {
    const key = toMonthKey(t.date)
    return key >= first && key <= last
  })
}

/**
 * Balance from the opening balance plus every transaction dated on or before `throughDate`.
 * When no date is given, all transactions are included.
 */
export function calculateBalance(
  openingBalance: number,
  transactions: readonly Transaction[],
  throughDate?: IsoDate,
): number {
  return transactions.reduce((balance, t) => {
    if (throughDate && t.date > throughDate) return balance
    return t.type === 'income' ? balance + t.amount : balance - t.amount
  }, openingBalance)
}

export function spendingByCategory(transactions: readonly Transaction[]): CategorySpend[] {
  const totals = new Map<string, { amount: number; count: number }>()
  let overall = 0
  for (const t of transactions) {
    if (t.type !== 'expense') continue
    const entry = totals.get(t.categoryId) ?? { amount: 0, count: 0 }
    entry.amount += t.amount
    entry.count += 1
    totals.set(t.categoryId, entry)
    overall += t.amount
  }
  return [...totals.entries()]
    .map(([categoryId, { amount, count }]) => ({
      categoryId,
      amount,
      count,
      share: overall > 0 ? amount / overall : 0,
    }))
    .sort((a, b) => b.amount - a.amount || getCategoryOrder(a.categoryId) - getCategoryOrder(b.categoryId))
}

export function budgetUtilization(spent: number, limit: number): number {
  return limit > 0 ? (spent / limit) * 100 : 0
}

export function getBudgetStatus(spent: number, limit: number): BudgetStatus {
  if (spent === 0) return 'unused'
  if (spent > limit) return 'over'
  return budgetUtilization(spent, limit) >= NEAR_LIMIT_THRESHOLD ? 'near' : 'on-track'
}

/** Calculates progress for one budget using only the expense transactions passed in. */
export function calculateBudgetProgress(
  budget: Budget,
  monthTransactions: readonly Transaction[],
): BudgetProgress {
  const spent = monthTransactions.reduce(
    (sum, t) => (t.type === 'expense' && t.categoryId === budget.categoryId ? sum + t.amount : sum),
    0,
  )
  return {
    budget,
    spent,
    remaining: budget.limit - spent,
    overBy: Math.max(0, spent - budget.limit),
    utilization: budgetUtilization(spent, budget.limit),
    status: getBudgetStatus(spent, budget.limit),
  }
}

export function calculateAllBudgetProgress(
  budgets: readonly Budget[],
  monthTransactions: readonly Transaction[],
): BudgetProgress[] {
  return budgets.map((budget) => calculateBudgetProgress(budget, monthTransactions))
}

export interface BudgetTotals {
  limit: number
  spent: number
  remaining: number
  utilization: number
  nearCount: number
  overCount: number
}

export function calculateBudgetTotals(progress: readonly BudgetProgress[]): BudgetTotals {
  const limit = progress.reduce((sum, p) => sum + p.budget.limit, 0)
  const spent = progress.reduce((sum, p) => sum + p.spent, 0)
  return {
    limit,
    spent,
    remaining: limit - spent,
    utilization: budgetUtilization(spent, limit),
    nearCount: progress.filter((p) => p.status === 'near').length,
    overCount: progress.filter((p) => p.status === 'over').length,
  }
}

/** Income, expenses and net for each of the `count` months ending at `endMonth`. */
export function monthlySeries(
  transactions: readonly Transaction[],
  endMonth: MonthKey,
  count: number,
): MonthlyPoint[] {
  const months = getMonthRange(endMonth, count)
  const buckets = new Map<MonthKey, { income: number; expenses: number }>(
    months.map((month) => [month, { income: 0, expenses: 0 }]),
  )
  for (const t of transactions) {
    const bucket = buckets.get(toMonthKey(t.date))
    if (!bucket) continue
    if (t.type === 'income') bucket.income += t.amount
    else bucket.expenses += t.amount
  }
  return months.map((month) => {
    const { income, expenses } = buckets.get(month)!
    return { month, income, expenses, net: income - expenses }
  })
}

export function compareValues(current: number, previous: number): Comparison {
  const change = current - previous
  return {
    current,
    previous,
    change,
    percent: previous === 0 ? null : (change / Math.abs(previous)) * 100,
  }
}

export interface ComparablePeriod {
  month: MonthKey
  transactions: Transaction[]
}

/**
 * The previous month's transactions to compare against. While `month` is still in
 * progress, only the same number of days is included so the comparison is like for like.
 */
export function getComparablePrevious(
  transactions: readonly Transaction[],
  month: MonthKey,
  today: IsoDate,
): ComparablePeriod {
  const previousMonth = addMonths(month, -1)
  const previous = filterByMonth(transactions, previousMonth)
  if (toMonthKey(today) !== month) return { month: previousMonth, transactions: previous }
  const cutoff = Math.min(getDayOfMonth(today), getDaysInMonth(previousMonth))
  return {
    month: previousMonth,
    transactions: previous.filter((t) => getDayOfMonth(t.date) <= cutoff),
  }
}

export interface CategoryComparison {
  categoryId: string
  current: number
  previous: number
  change: number
  percent: number | null
}

export function compareCategorySpending(
  currentTransactions: readonly Transaction[],
  previousTransactions: readonly Transaction[],
): CategoryComparison[] {
  const current = new Map(spendingByCategory(currentTransactions).map((c) => [c.categoryId, c.amount]))
  const previous = new Map(spendingByCategory(previousTransactions).map((c) => [c.categoryId, c.amount]))
  const ids = new Set([...current.keys(), ...previous.keys()])
  return [...ids]
    .map((categoryId) => {
      const comparison = compareValues(current.get(categoryId) ?? 0, previous.get(categoryId) ?? 0)
      return { categoryId, ...comparison }
    })
    .sort(
      (a, b) =>
        b.current - a.current ||
        b.previous - a.previous ||
        getCategoryOrder(a.categoryId) - getCategoryOrder(b.categoryId),
    )
}

/** Day-by-day and cumulative spending for a month, up to `lastDay` when given. */
export function dailySpending(
  transactions: readonly Transaction[],
  month: MonthKey,
  lastDay: number = getDaysInMonth(month),
): DailySpendPoint[] {
  const length = Math.min(lastDay, getDaysInMonth(month))
  const perDay = new Array<number>(length).fill(0)
  for (const t of transactions) {
    if (t.type !== 'expense' || toMonthKey(t.date) !== month) continue
    const day = getDayOfMonth(t.date)
    if (day <= length) perDay[day - 1] += t.amount
  }
  let cumulative = 0
  return perDay.map((spent, index) => {
    cumulative += spent
    return { day: index + 1, spent, cumulative }
  })
}

/** End-of-day balance for each day of a month, up to `lastDay` when given. */
export function dailyBalance(
  openingBalance: number,
  transactions: readonly Transaction[],
  month: MonthKey,
  lastDay: number = getDaysInMonth(month),
): DailyBalancePoint[] {
  const length = Math.min(lastDay, getDaysInMonth(month))
  const monthStart = `${month}-01`
  let balance = transactions.reduce(
    (sum, t) =>
      t.date < monthStart ? (t.type === 'income' ? sum + t.amount : sum - t.amount) : sum,
    openingBalance,
  )
  const perDay = new Array<number>(length).fill(0)
  for (const t of transactions) {
    if (toMonthKey(t.date) !== month) continue
    const day = getDayOfMonth(t.date)
    if (day <= length) perDay[day - 1] += t.type === 'income' ? t.amount : -t.amount
  }
  return perDay.map((delta, index) => {
    balance += delta
    return { day: index + 1, balance }
  })
}

export function largestExpense(transactions: readonly Transaction[]): Transaction | null {
  let largest: Transaction | null = null
  for (const t of transactions) {
    if (t.type === 'expense' && (!largest || t.amount > largest.amount)) largest = t
  }
  return largest
}

/** Share of income kept, as a percentage. Null when there was no income. */
export function savingsRate(income: number, net: number): number | null {
  return income > 0 ? (net / income) * 100 : null
}

export function averagePerMonth(total: number, monthCount: number): number {
  return monthCount > 0 ? Math.round(total / monthCount) : 0
}
