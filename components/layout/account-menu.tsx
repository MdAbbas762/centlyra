'use client'

import { ChevronDown, FolderOpen, Settings2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getTodayIso } from '@/lib/finance/dates'
import { createSampleData } from '@/lib/finance/seed'
import { useAppDispatch } from '@/store/hooks'
import { dataReset } from '@/store/actions'

export function AccountMenu() {
  const dispatch = useAppDispatch()
  const [confirmOpen, setConfirmOpen] = useState<'sample' | 'clear' | null>(null)

  const resetData = () => {
    if (!confirmOpen) return
    const today = getTodayIso()
    const data = confirmOpen === 'sample'
      ? createSampleData(today)
      : { version: 1 as const, openingBalance: 0, transactions: [], budgets: [] }
    dispatch(dataReset({ data, today }))
    toast.success(confirmOpen === 'sample' ? 'Example activity loaded.' : 'Workspace cleared.', {
      description: confirmOpen === 'sample'
        ? 'You can now browse example transactions and budgets. Your changes will be saved on this device.'
        : 'Your workspace is ready for your own transactions.',
    })
    setConfirmOpen(null)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="default"
              className="flex h-auto min-h-16 w-full items-center justify-start gap-3 rounded-2xl border border-white/10 bg-white/[0.045] px-3 py-3 text-left text-ivory hover:bg-white/10 hover:text-ivory focus-visible:ring-seafoam"
            />
          }
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-seafoam/15 text-seafoam">
            <Settings2 size={19} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Workspace settings</span>
            <span className="block text-xs text-ivory/60">Manage your workspace</span>
          </span>
          <ChevronDown size={16} className="shrink-0 text-ivory/60" aria-hidden="true" />
        </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="end" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Workspace</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setConfirmOpen('sample')}>
                <FolderOpen aria-hidden="true" />
                Load example activity
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setConfirmOpen('clear')}>
                <Trash2 aria-hidden="true" />
                Clear workspace
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <p className="px-2 pt-1 pb-1.5 text-xs text-muted-foreground">
              Your transactions and budgets are saved on this device.
            </p>
          </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen !== null} onOpenChange={(open) => { if (!open) setConfirmOpen(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmOpen === 'sample' ? 'Load example activity?' : 'Clear your workspace?'}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmOpen === 'sample'
                ? 'This replaces your current transactions and budgets with example activity. Any changes you have made will be lost.'
                : 'This permanently removes the transactions and budgets saved on this device. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={resetData}>
              {confirmOpen === 'sample' ? 'Load examples' : 'Clear workspace'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
