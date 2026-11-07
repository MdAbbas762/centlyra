'use client'

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/finance/money'
import type { Transaction } from '@/lib/finance/types'

interface DeleteTransactionDialogProps {
  transaction: Transaction | null
  onCancel: () => void
  onConfirm: (transaction: Transaction) => void
}

export function DeleteTransactionDialog({ transaction, onCancel, onConfirm }: DeleteTransactionDialogProps) {
  return (
    <AlertDialog open={transaction !== null} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
          <AlertDialogDescription>
            {transaction
              ? `“${transaction.description}” for ${formatMoney(transaction.amount)} will be removed, and your balance, budgets, and charts will update to match.`
              : ''}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep transaction</AlertDialogCancel>
          <Button variant="destructive" onClick={() => transaction && onConfirm(transaction)}>
            Delete transaction
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
