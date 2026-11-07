import { getCategory } from './categories'
import { formatMonthName } from './dates'
import { formatMoney, formatPercent } from './money'
import type { BudgetProgress, CategorySpend, MonthKey, PeriodSummary } from './types'

export type InsightTone = 'positive' | 'caution' | 'alert' | 'neutral'

export interface Insight {
  id: string
  tone: InsightTone
  title: string
  body: string
}

export interface InsightInput {
  month: MonthKey
  isCurrentMonth: boolean
  summary: PeriodSummary
  previousSummary: PeriodSummary
  previousMonth: MonthKey
  budgetProgress: readonly BudgetProgress[]
  categorySpending: readonly CategorySpend[]
}

const MAX_INSIGHTS = 3

/** Builds short, data-driven observations about the selected month. */
export function buildInsights(input: InsightInput): Insight[] {
  const { month, isCurrentMonth, summary, previousSummary, previousMonth } = input
  const insights: Insight[] = []
  const monthName = formatMonthName(month)
  const periodWord = isCurrentMonth ? 'this month' : `in ${monthName}`

  if (summary.transactionCount === 0) {
    return [
      {
        id: 'empty-month',
        tone: 'neutral',
        title: `Nothing recorded for ${monthName} yet`,
        body: 'Add a transaction to start building a picture of this month.',
      },
    ]
  }

  const overBudgets = input.budgetProgress
    .filter((p) => p.status === 'over')
    .sort((a, b) => b.overBy - a.overBy)
  for (const progress of overBudgets.slice(0, 2)) {
    const label = getCategory(progress.budget.categoryId).label
    insights.push({
      id: `over-${progress.budget.id}`,
      tone: 'alert',
      title: `You've gone over your ${label} budget`,
      body: `You're ${formatMoney(progress.overBy)} above your ${formatMoney(progress.budget.limit)} limit ${periodWord}.`,
    })
  }

  const nearBudgets = input.budgetProgress
    .filter((p) => p.status === 'near')
    .sort((a, b) => b.utilization - a.utilization)
  for (const progress of nearBudgets.slice(0, 2)) {
    const label = getCategory(progress.budget.categoryId).label
    insights.push({
      id: `near-${progress.budget.id}`,
      tone: 'caution',
      title: `You're approaching your ${label} budget`,
      body: `${formatMoney(progress.spent)} of ${formatMoney(progress.budget.limit)} used, with ${formatMoney(progress.remaining)} left.`,
    })
  }

  const top = input.categorySpending[0]
  if (top) {
    insights.push({
      id: 'top-category',
      tone: 'neutral',
      title: `${getCategory(top.categoryId).label} is your biggest expense`,
      body: `${formatMoney(top.amount)} ${periodWord}, which is ${formatPercent(top.share * 100)} of everything you've spent.`,
    })
  }

  if (summary.income > 0 && summary.net > 0) {
    insights.push({
      id: 'saving',
      tone: 'positive',
      title: `You've kept ${formatMoney(summary.net)} ${periodWord}`,
      body: `That's ${formatPercent((summary.net / summary.income) * 100)} of the money you received.`,
    })
  } else if (summary.net < 0) {
    insights.push({
      id: 'overspending',
      tone: 'caution',
      title: `Spending is ahead of income ${periodWord}`,
      body: `You've spent ${formatMoney(Math.abs(summary.net))} more than you've received so far.`,
    })
  }

  if (previousSummary.expenses > 0 && summary.expenses < previousSummary.expenses) {
    insights.push({
      id: 'spending-down',
      tone: 'positive',
      title: `Spending is lower than in ${formatMonthName(previousMonth)}`,
      body: `You've spent ${formatMoney(previousSummary.expenses - summary.expenses)} less than ${
        isCurrentMonth ? 'at this point last month' : `in ${formatMonthName(previousMonth)}`
      }.`,
    })
  }

  const priority: Record<InsightTone, number> = { alert: 0, caution: 1, positive: 2, neutral: 3 }
  return insights.sort((a, b) => priority[a.tone] - priority[b.tone]).slice(0, MAX_INSIGHTS)
}
