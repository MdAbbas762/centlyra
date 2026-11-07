'use client'

import { ArrowDown, ArrowUp, ChevronsUpDown, Eye, Pencil, Trash2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { AmountText } from '@/components/common/amount-text'
import { CategoryIcon } from '@/components/common/category-icon'
import { Button } from '@/components/ui/button'
import { getCategory } from '@/lib/finance/categories'
import { formatTableDate } from '@/lib/finance/dates'
import type { SortOption } from '@/lib/finance/filtering'
import type { Transaction } from '@/lib/finance/types'

interface TransactionActions {
  onView: (transaction: Transaction) => void
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

interface TransactionTableProps extends TransactionActions {
  transactions: readonly Transaction[]
  sort: SortOption
  onSortChange: (sort: SortOption) => void
}

function SortHeader({
  label,
  field,
  sort,
  onSortChange,
  align = 'left',
}: {
  label: string
  field: 'date' | 'amount'
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  align?: 'left' | 'right'
}) {
  const active = sort.startsWith(field)
  const descending = sort === `${field}-desc`
  const next = (active && descending ? `${field}-asc` : `${field}-desc`) as SortOption
  const Icon = !active ? ChevronsUpDown : descending ? ArrowDown : ArrowUp

  return (
    <th
      scope="col"
      aria-sort={active ? (descending ? 'descending' : 'ascending') : 'none'}
      className={align === 'right' ? 'px-4 py-3 text-right' : 'px-4 py-3 text-left'}
    >
      <button
        type="button"
        onClick={() => onSortChange(next)}
        className="inline-flex items-center gap-1 rounded-md text-xs font-semibold tracking-wide text-muted-foreground uppercase transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        {label}
        <Icon className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Sort by {label.toLowerCase()}</span>
      </button>
    </th>
  )
}

export function TransactionTable({
  transactions,
  sort,
  onSortChange,
  onView,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  return (
    <div className="surface hidden overflow-hidden md:block">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">Your transactions</caption>
        <thead className="border-b border-border bg-muted/50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Transaction
            </th>
            <th scope="col" className="hidden px-4 py-3 text-left text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell">
              Category
            </th>
            <SortHeader label="Date" field="date" sort={sort} onSortChange={onSortChange} />
            <SortHeader label="Amount" field="amount" sort={sort} onSortChange={onSortChange} align="right" />
            <th scope="col" className="w-32 px-4 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {transactions.map((transaction) => (
              <motion.tr
                key={transaction.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="group border-b border-border/70 transition-colors last:border-b-0 hover:bg-muted/40"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <CategoryIcon categoryId={transaction.categoryId} size="sm" />
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => onView(transaction)}
                        className="block max-w-64 truncate rounded text-left font-semibold text-foreground outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/30"
                      >
                        {transaction.description}
                      </button>
                      <p className="max-w-64 truncate text-xs text-muted-foreground">{transaction.merchant}</p>
                    </div>
                  </div>
                </td>
                <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                  {getCategory(transaction.categoryId).label}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {formatTableDate(transaction.date)}
                </td>
                <td className="px-4 py-3 text-right">
                  <AmountText amount={transaction.amount} type={transaction.type} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-0.5 opacity-70 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={() => onView(transaction)}>
                      <Eye aria-hidden="true" />
                      <span className="sr-only">View details for {transaction.description}</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8 rounded-lg" onClick={() => onEdit(transaction)}>
                      <Pencil aria-hidden="true" />
                      <span className="sr-only">Edit {transaction.description}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 rounded-lg text-rose-ink hover:bg-rose-soft hover:text-rose-ink"
                      onClick={() => onDelete(transaction)}
                    >
                      <Trash2 aria-hidden="true" />
                      <span className="sr-only">Delete {transaction.description}</span>
                    </Button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
}
