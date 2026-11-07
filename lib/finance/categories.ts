import type { TransactionType } from './types'

export interface CategoryDefinition {
  id: string
  label: string
  kind: TransactionType
  /** Chart and indicator colour. */
  color: string
}

export const CATEGORIES: readonly CategoryDefinition[] = [
  { id: 'housing', label: 'Housing', kind: 'expense', color: '#0c1730' },
  { id: 'groceries', label: 'Groceries', kind: 'expense', color: '#2b50e6' },
  { id: 'dining', label: 'Dining out', kind: 'expense', color: '#d9806a' },
  { id: 'transport', label: 'Transport', kind: 'expense', color: '#5ed3b0' },
  { id: 'shopping', label: 'Shopping', kind: 'expense', color: '#8e7cb3' },
  { id: 'bills', label: 'Bills & utilities', kind: 'expense', color: '#c9a66b' },
  { id: 'entertainment', label: 'Entertainment', kind: 'expense', color: '#7fb2e5' },
  { id: 'health', label: 'Health', kind: 'expense', color: '#4d9a86' },
  { id: 'travel', label: 'Travel', kind: 'expense', color: '#8a97ab' },
  { id: 'other-expense', label: 'Other', kind: 'expense', color: '#b9b2a0' },
  { id: 'salary', label: 'Salary', kind: 'income', color: '#2b50e6' },
  { id: 'freelance', label: 'Freelance', kind: 'income', color: '#5ed3b0' },
  { id: 'interest', label: 'Interest', kind: 'income', color: '#c9a66b' },
  { id: 'other-income', label: 'Other income', kind: 'income', color: '#8a97ab' },
]

const CATEGORY_INDEX = new Map(CATEGORIES.map((category) => [category.id, category]))

const FALLBACK_CATEGORY: CategoryDefinition = {
  id: 'unknown',
  label: 'Uncategorised',
  kind: 'expense',
  color: '#b9b2a0',
}

export function getCategory(id: string): CategoryDefinition {
  return CATEGORY_INDEX.get(id) ?? FALLBACK_CATEGORY
}

export function getCategoriesByKind(kind: TransactionType): CategoryDefinition[] {
  return CATEGORIES.filter((category) => category.kind === kind)
}

export function isCategoryOfKind(id: string, kind: TransactionType): boolean {
  return CATEGORY_INDEX.get(id)?.kind === kind
}

export function getCategoryOrder(id: string): number {
  const index = CATEGORIES.findIndex((category) => category.id === id)
  return index === -1 ? CATEGORIES.length : index
}
