'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Transaction, TransactionType } from '@/lib/finance/types'
import { TransactionFormDialog } from './transaction-form-dialog'

interface TransactionDialogApi {
  openCreate: (type?: TransactionType) => void
  openEdit: (transaction: Transaction) => void
}

const TransactionDialogContext = createContext<TransactionDialogApi | null>(null)

export function useTransactionDialog(): TransactionDialogApi {
  const context = useContext(TransactionDialogContext)
  if (!context) throw new Error('useTransactionDialog must be used within TransactionDialogProvider')
  return context
}

export function TransactionDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [defaultType, setDefaultType] = useState<TransactionType>('expense')

  const openCreate = useCallback((type: TransactionType = 'expense') => {
    setTransaction(null)
    setDefaultType(type)
    setOpen(true)
  }, [])

  const openEdit = useCallback((existing: Transaction) => {
    setTransaction(existing)
    setDefaultType(existing.type)
    setOpen(true)
  }, [])

  const api = useMemo(() => ({ openCreate, openEdit }), [openCreate, openEdit])

  return (
    <TransactionDialogContext.Provider value={api}>
      {children}
      <TransactionFormDialog
        open={open}
        onOpenChange={setOpen}
        transaction={transaction}
        defaultType={defaultType}
      />
    </TransactionDialogContext.Provider>
  )
}
