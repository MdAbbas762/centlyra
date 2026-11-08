'use client'

import { House, Menu, Plus } from 'lucide-react'
import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { BrandMark, BrandWordmark } from '@/components/brand/brand-mark'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { TransactionDialogProvider, useTransactionDialog } from '@/components/transactions/transaction-dialog-context'
import { AccountMenu } from './account-menu'
import { SidebarNav } from './sidebar-nav'

function DesktopSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-sidebar px-4 py-6 lg:flex">
      <Link
        href="/workspace"
        aria-label="Centlyra overview"
        className="mb-8 rounded-lg px-2 outline-none focus-visible:ring-2 focus-visible:ring-seafoam"
      >
        <BrandWordmark />
      </Link>
      <SidebarNav indicatorId="desktop" />
      <div className="mt-auto space-y-2">
        <Link href="/" className="flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-3.5 text-sm font-medium text-ivory/85 transition-colors hover:bg-white/10 hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seafoam">
          <House className="size-[18px] text-seafoam" aria-hidden="true" /> Go to home
        </Link>
        <AccountMenu />
      </div>
    </aside>
  )
}

function MobileTopBar() {
  const [open, setOpen] = useState(false)
  const { openCreate } = useTransactionDialog()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={<Button variant="ghost" size="icon" className="size-10 rounded-xl" />}
        >
          <Menu className="size-5" aria-hidden="true" />
          <span className="sr-only">Open navigation</span>
        </SheetTrigger>
        <SheetContent
          side="left"
          showCloseButton
          className="w-[84%] max-w-xs border-sidebar-border bg-sidebar px-4 py-6 text-ivory [&_[data-slot=sheet-close]]:text-ivory [&_[data-slot=sheet-close]]:hover:bg-white/10"
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Move between the sections of Centlyra.</SheetDescription>
          <div className="mb-6 px-2">
            <BrandWordmark />
          </div>
          <SidebarNav indicatorId="mobile" onNavigate={() => setOpen(false)} />
          <div className="mt-auto space-y-2">
            <Link href="/" onClick={() => setOpen(false)} className="flex h-11 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.045] px-3.5 text-sm font-medium text-ivory/85 transition-colors hover:bg-white/10 hover:text-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-seafoam">
              <House className="size-[18px] text-seafoam" aria-hidden="true" /> Go to home
            </Link>
            <AccountMenu />
          </div>
        </SheetContent>
      </Sheet>

      <Link href="/workspace" aria-label="Centlyra overview" className="flex items-center gap-2">
        <BrandMark />
        <span className="font-display text-2xl text-navy">Centlyra</span>
      </Link>

      <Button
        size="icon"
        className="size-10 rounded-xl bg-navy text-ivory hover:bg-navy-soft"
        onClick={() => openCreate()}
      >
        <Plus className="size-5" aria-hidden="true" />
        <span className="sr-only">Add transaction</span>
      </Button>
    </header>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TransactionDialogProvider>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-navy px-4 py-2 text-ivory focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to main content
      </a>
      <DesktopSidebar />
      <div className="min-h-dvh min-w-0 lg:pl-64">
        <MobileTopBar />
        <main
          id="main"
          className="workspace-main mx-auto min-w-0 w-full max-w-[1360px] px-4 pt-6 pb-16 sm:px-7 lg:px-9 lg:pt-10"
        >
          {children}
        </main>
      </div>
    </TransactionDialogProvider>
  )
}
