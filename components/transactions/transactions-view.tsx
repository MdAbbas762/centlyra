'use client'

import { Plus, SearchX, WalletCards } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/empty-state'
import { MotionButton } from '@/components/common/motion-button'
import { PageGate } from '@/components/common/page-gate'
import { PageHeader } from '@/components/common/page-header'
import { StaggerGroup, StaggerItem } from '@/components/common/stagger'
import { Button } from '@/components/ui/button'
import {
  applyTransactionFilters,
  DEFAULT_FILTERS,
  hasActiveFilters,
  type TransactionFilters,
} from '@/lib/finance/filtering'
import { summarize } from '@/lib/finance/calculations'
import { formatMoney } from '@/lib/finance/money'
import type { Transaction } from '@/lib/finance/types'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectToday, selectTransactions } from '@/store/selectors'
import { transactionDeleted } from '@/store/slices/transactionsSlice'
import { DeleteTransactionDialog } from './delete-transaction-dialog'
import { TransactionCardList } from './transaction-card-list'
import { useTransactionDialog } from './transaction-dialog-context'
import { TransactionDetailSheet } from './transaction-detail-sheet'
import { TransactionFiltersBar } from './transaction-filters'
import { TransactionTable } from './transaction-table'

const PAGE_SIZE = 20

function TransactionsContent() {
  const dispatch = useAppDispatch()
  const transactions = useAppSelector(selectTransactions)
  const today = useAppSelector(selectToday)
  const { openCreate, openEdit } = useTransactionDialog()

  const [filters, setFilters] = useState<TransactionFilters>(DEFAULT_FILTERS)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [viewingId, setViewingId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)

  const filtered = useMemo(() => applyTransactionFilters(transactions, filters), [transactions, filters])
  const summary = useMemo(() => summarize(filtered), [filtered])
  const visible = filtered.slice(0, visibleCount)
  const viewing = transactions.find((t) => t.id === viewingId) ?? null
  const filtersActive = hasActiveFilters(filters)

  const updateFilters = (next: TransactionFilters) => {
    setFilters(next)
    setVisibleCount(PAGE_SIZE)
  }
  const clearFilters = () => updateFilters(DEFAULT_FILTERS)

  const confirmDelete = (transaction: Transaction) => {
    dispatch(transactionDeleted(transaction.id))
    setDeleting(null)
    setViewingId(null)
    toast.success('Transaction deleted.', {
      description: `${transaction.description} · ${formatMoney(transaction.amount)}`,
    })
  }

  const editFromSheet = (transaction: Transaction) => {
    setViewingId(null)
    openEdit(transaction)
  }

  return (
    <StaggerGroup className="space-y-6">
      <StaggerItem>
        <PageHeader
          title="Transactions"
          description="Every payment and deposit in one place. Search, filter, and keep your records accurate."
          actions={
            <MotionButton onClick={() => openCreate()} className="bg-navy text-ivory hover:bg-navy-soft">
              <Plus className="size-4" aria-hidden="true" />
              Add transaction
            </MotionButton>
          }
        />
      </StaggerItem>

      <StaggerItem>
        <TransactionFiltersBar filters={filters} onChange={updateFilters} onClear={clearFilters} today={today} />
      </StaggerItem>

      <StaggerItem className="space-y-3">
        <div
          role="status"
          aria-live="polite"
          className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-1 text-sm"
        >
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'transaction' : 'transactions'}
            {filtersActive ? ' match your filters' : ''}
          </p>
          <p className="tabular text-muted-foreground">
            Money in <span className="font-semibold text-seafoam-ink">{formatMoney(summary.income)}</span>
            <span aria-hidden="true" className="mx-2 text-border">
              |
            </span>
            Money out <span className="font-semibold text-foreground">{formatMoney(summary.expenses)}</span>
          </p>
        </div>

        {transactions.length === 0 ? (
          <div className="surface">
            <EmptyState
              icon={WalletCards}
              title="No transactions yet"
              description="Add your first transaction and Centlyra will start building your picture."
              action={<MotionButton onClick={() => openCreate()}>Add transaction</MotionButton>}
            />
          </div>
        ) : filtered.length === 0 ? (
          <div className="surface">
            <EmptyState
              icon={SearchX}
              title="No transactions found"
              description="Try adjusting your filters or searching for something else."
              action={
                <Button variant="outline" className="h-10 rounded-xl px-4 font-semibold" onClick={clearFilters}>
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <TransactionTable
              transactions={visible}
              sort={filters.sort}
              onSortChange={(sort) => updateFilters({ ...filters, sort })}
              onView={(t) => setViewingId(t.id)}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
            <TransactionCardList transactions={visible} onView={(t) => setViewingId(t.id)} />
            {visible.length < filtered.length && (
              <div className="flex flex-col items-center gap-2 pt-2">
                <p className="text-sm text-muted-foreground">
                  Showing {visible.length} of {filtered.length}
                </p>
                <Button
                  variant="outline"
                  className="h-10 rounded-xl px-5 font-semibold"
                  onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                >
                  Show more
                </Button>
              </div>
            )}
          </>
        )}
      </StaggerItem>

      <TransactionDetailSheet
        transaction={viewing}
        onOpenChange={(open) => !open && setViewingId(null)}
        onEdit={editFromSheet}
        onDelete={setDeleting}
      />
      <DeleteTransactionDialog
        transaction={deleting}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </StaggerGroup>
  )
}

export function TransactionsView() {
  return (
    <PageGate>
      <TransactionsContent />
    </PageGate>
  )
}
