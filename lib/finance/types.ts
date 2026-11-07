export type TransactionType = 'income' | 'expense'

/** Calendar month identifier in `YYYY-MM` form. */
export type MonthKey = string

/** Calendar date in `YYYY-MM-DD` form. Dates carry no time zone. */
export type IsoDate = string

export interface Transaction {
  id: string
  description: string
  merchant: string
  /** Positive amount in pence. The sign is determined by `type`. */
  amount: number
  type: TransactionType
  categoryId: string
  date: IsoDate
  notes?: string
}

export interface Budget {
  id: string
  categoryId: string
  /** Monthly limit in pence. */
  limit: number
}

export interface PeriodSummary {
  income: number
  expenses: number
  net: number
  transactionCount: number
}

export interface CategorySpend {
  categoryId: string
  amount: number
  /** Share of total expenses, between 0 and 1. */
  share: number
  count: number
}

export type BudgetStatus = 'unused' | 'on-track' | 'near' | 'over'

export interface BudgetProgress {
  budget: Budget
  spent: number
  /** Limit minus spend. Negative when the budget has been exceeded. */
  remaining: number
  overBy: number
  /** Spend as a percentage of the limit. May exceed 100. */
  utilization: number
  status: BudgetStatus
}

export interface MonthlyPoint {
  month: MonthKey
  income: number
  expenses: number
  net: number
}

export interface Comparison {
  current: number
  previous: number
  change: number
  /** Percentage change, or null when there is no previous value to compare. */
  percent: number | null
}

export interface DailySpendPoint {
  day: number
  spent: number
  cumulative: number
}

export interface DailyBalancePoint {
  day: number
  balance: number
}

export interface PersistedData {
  version: 1
  openingBalance: number
  transactions: Transaction[]
  budgets: Budget[]
}
