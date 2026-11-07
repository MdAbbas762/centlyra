import type { IsoDate, Transaction, TransactionType } from './types'

export type SortOption = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

export interface TransactionFilters {
  query: string
  type: 'all' | TransactionType
  categoryId: 'all' | string
  from: IsoDate | ''
  to: IsoDate | ''
  sort: SortOption
}

export const DEFAULT_FILTERS: TransactionFilters = {
  query: '',
  type: 'all',
  categoryId: 'all',
  from: '',
  to: '',
  sort: 'date-desc',
}

export const SORT_LABELS: Record<SortOption, string> = {
  'date-desc': 'Newest first',
  'date-asc': 'Oldest first',
  'amount-desc': 'Highest amount',
  'amount-asc': 'Lowest amount',
}

export function hasActiveFilters(filters: TransactionFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.type !== 'all' ||
    filters.categoryId !== 'all' ||
    filters.from !== '' ||
    filters.to !== ''
  )
}

export function compareTransactions(a: Transaction, b: Transaction, sort: SortOption): number {
  let result = 0
  switch (sort) {
    case 'date-desc':
      result = b.date.localeCompare(a.date)
      break
    case 'date-asc':
      result = a.date.localeCompare(b.date)
      break
    case 'amount-desc':
      result = b.amount - a.amount
      break
    case 'amount-asc':
      result = a.amount - b.amount
      break
  }
  if (result !== 0) return result
  return a.id.localeCompare(b.id)
}

export function sortTransactions(
  transactions: readonly Transaction[],
  sort: SortOption,
): Transaction[] {
  return [...transactions].sort((a, b) => compareTransactions(a, b, sort))
}

export function matchesQuery(transaction: Transaction, query: string): boolean {
  const needle = query.trim().toLowerCase()
  if (needle === '') return true
  return (
    transaction.description.toLowerCase().includes(needle) ||
    transaction.merchant.toLowerCase().includes(needle)
  )
}

export function applyTransactionFilters(
  transactions: readonly Transaction[],
  filters: TransactionFilters,
): Transaction[] {
  const filtered = transactions.filter((t) => {
    if (!matchesQuery(t, filters.query)) return false
    if (filters.type !== 'all' && t.type !== filters.type) return false
    if (filters.categoryId !== 'all' && t.categoryId !== filters.categoryId) return false
    if (filters.from && t.date < filters.from) return false
    if (filters.to && t.date > filters.to) return false
    return true
  })
  return sortTransactions(filtered, filters.sort)
}
