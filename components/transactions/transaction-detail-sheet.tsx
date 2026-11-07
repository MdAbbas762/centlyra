'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { AmountText } from '@/components/common/amount-text'
import { CategoryIcon } from '@/components/common/category-icon'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { getCategory } from '@/lib/finance/categories'
import { formatFullDate } from '@/lib/finance/dates'
import type { Transaction } from '@/lib/finance/types'

interface TransactionDetailSheetProps {
  transaction: Transaction | null
  onOpenChange: (open: boolean) => void
  onEdit: (transaction: Transaction) => void
  onDelete: (transaction: Transaction) => void
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3 py-3.5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-right text-sm font-medium text-foreground">{children}</dd>
    </div>
  )
}

export function TransactionDetailSheet({
  transaction,
  onOpenChange,
  onEdit,
  onDelete,
}: TransactionDetailSheetProps) {
  return (
    <Sheet open={transaction !== null} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-full w-full gap-0 overflow-x-hidden p-0 sm:max-w-md">
        {transaction && (
          <>
            <div className="border-b border-border px-6 pt-8 pb-6">
              <CategoryIcon categoryId={transaction.categoryId} size="lg" />
              <SheetTitle className="mt-4 font-display text-3xl leading-tight">
                {transaction.description}
              </SheetTitle>
              <SheetDescription className="mt-1 text-sm">{transaction.merchant}</SheetDescription>
              <AmountText amount={transaction.amount} type={transaction.type} className="mt-4 block font-display text-4xl font-normal" />
            </div>

            <dl className="divide-y divide-border px-6">
              <DetailRow label="Type">{transaction.type === 'income' ? 'Money in' : 'Money out'}</DetailRow>
              <DetailRow label="Category">{getCategory(transaction.categoryId).label}</DetailRow>
              <DetailRow label="Date">{formatFullDate(transaction.date)}</DetailRow>
              <DetailRow label="Notes">
                {transaction.notes ? (
                  <span className="font-normal whitespace-pre-wrap">{transaction.notes}</span>
                ) : (
                  <span className="font-normal text-muted-foreground">No notes added</span>
                )}
              </DetailRow>
            </dl>

            <div className="mt-auto flex gap-2.5 border-t border-border bg-muted/40 px-6 py-4">
              <Button
                variant="outline"
                className="h-10 flex-1 rounded-xl font-semibold"
                onClick={() => onEdit(transaction)}
              >
                <Pencil aria-hidden="true" />
                Edit
              </Button>
              <Button
                variant="destructive"
                className="h-10 flex-1 rounded-xl font-semibold"
                onClick={() => onDelete(transaction)}
              >
                <Trash2 aria-hidden="true" />
                Delete
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
