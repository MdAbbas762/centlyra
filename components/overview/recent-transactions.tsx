'use client'

import { ArrowRight, Inbox } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import Link from 'next/link'
import { AmountText } from '@/components/common/amount-text'
import { CategoryIcon } from '@/components/common/category-icon'
import { EmptyState } from '@/components/common/empty-state'
import { MotionButton } from '@/components/common/motion-button'
import { Panel } from '@/components/common/panel'
import { useTransactionDialog } from '@/components/transactions/transaction-dialog-context'
import { getCategory } from '@/lib/finance/categories'
import { formatDayMonth, formatMonthLabel } from '@/lib/finance/dates'
import { useAppSelector } from '@/store/hooks'
import { selectRecentTransactions, selectSelectedMonth } from '@/store/selectors'

export function RecentTransactions() {
  const transactions = useAppSelector(selectRecentTransactions)
  const month = useAppSelector(selectSelectedMonth)
  const { openCreate } = useTransactionDialog()

  return (
    <Panel
      title="Recent transactions"
      description={`The latest activity in ${formatMonthLabel(month)}.`}
      headingId="recent-transactions-heading"
      className="h-full"
      action={
        <Link
          href="/workspace/transactions"
          className="inline-flex shrink-0 items-center gap-1 rounded-md text-sm font-semibold text-cobalt transition-colors hover:text-navy focus-visible:ring-3 focus-visible:ring-ring/30"
        >
          See all transactions
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      }
    >
      {transactions.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No transactions this month"
          description="Add your first transaction for this month to see it here."
          action={<MotionButton onClick={() => openCreate()}>Add transaction</MotionButton>}
        />
      ) : (
        <ul className="-my-1 divide-y divide-border">
          <AnimatePresence initial={false}>
            {transactions.map((transaction) => (
              <motion.li
                key={transaction.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3.5 py-3">
                  <CategoryIcon categoryId={transaction.categoryId} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {transaction.description}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {transaction.merchant} · {getCategory(transaction.categoryId).label}
                    </p>
                  </div>
                  <div className="text-right">
                    <AmountText amount={transaction.amount} type={transaction.type} className="text-sm" />
                    <p className="text-xs text-muted-foreground">{formatDayMonth(transaction.date)}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </Panel>
  )
}
