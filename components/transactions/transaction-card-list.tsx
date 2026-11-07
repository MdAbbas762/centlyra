'use client'

import { AnimatePresence, motion } from 'motion/react'
import { AmountText } from '@/components/common/amount-text'
import { CategoryIcon } from '@/components/common/category-icon'
import { getCategory } from '@/lib/finance/categories'
import { formatTableDate } from '@/lib/finance/dates'
import type { Transaction } from '@/lib/finance/types'

interface TransactionCardListProps {
  transactions: readonly Transaction[]
  onView: (transaction: Transaction) => void
}

export function TransactionCardList({ transactions, onView }: TransactionCardListProps) {
  return (
    <ul className="space-y-2.5 md:hidden" aria-label="Your transactions">
      <AnimatePresence initial={false}>
        {transactions.map((transaction) => (
          <motion.li
            key={transaction.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              onClick={() => onView(transaction)}
              className="surface flex w-full items-center gap-3.5 p-3.5 text-left transition-colors outline-none hover:bg-white focus-visible:ring-3 focus-visible:ring-ring/30"
            >
              <CategoryIcon categoryId={transaction.categoryId} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {transaction.description}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {transaction.merchant} · {getCategory(transaction.categoryId).label}
                </span>
              </span>
              <span className="min-w-0 shrink-0 text-right">
                <AmountText amount={transaction.amount} type={transaction.type} className="block text-sm" />
                <span className="block text-xs text-muted-foreground">
                  {formatTableDate(transaction.date)}
                </span>
              </span>
              <span className="sr-only">View details</span>
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  )
}
