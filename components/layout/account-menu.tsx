'use client'

import { Ellipsis, FolderOpen, Trash2 } from 'lucide-react'
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

export const USER_NAME = 'Alex Morgan'
export const USER_FIRST_NAME = 'Alex'

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
      <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-seafoam text-sm font-bold text-navy"
        >
          AM
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ivory">{USER_NAME}</p>
          <p className="truncate text-xs text-ivory/60">Personal workspace</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-ivory/70 hover:bg-white/10 hover:text-ivory"
              />
            }
          >
            <Ellipsis aria-hidden="true" />
            <span className="sr-only">Workspace settings</span>
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
      </div>

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
