'use client'

import { ArrowDownLeft, ArrowRight, ArrowUpRight, ChartNoAxesCombined, Target } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { useTransactionDialog } from '@/components/transactions/transaction-dialog-context'

export function QuickActions() {
  const { openCreate } = useTransactionDialog()

  return (
    <section aria-labelledby="quick-actions-heading" className="surface flex h-full min-w-0 flex-col overflow-hidden p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="mb-1 text-[10px] font-bold tracking-[.16em] text-seafoam-ink uppercase">AT YOUR FINGERTIPS</p>
          <h2 id="quick-actions-heading" className="text-lg font-bold tracking-tight text-navy">Keep things moving</h2>
        </div>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-seafoam-soft text-seafoam-ink"><ArrowUpRight size={19}/></span>
      </div>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">Keep your records current and your plans on track.</p>
      <div className="mt-7 grid grid-cols-2 gap-3">
        <motion.button whileHover={{ y:-3 }} whileTap={{scale:.98}} type="button" onClick={() => openCreate('income')} className="flex min-h-32 min-w-0 flex-col items-start justify-between gap-4 rounded-2xl bg-seafoam-soft p-4 text-left transition-colors hover:bg-[#c9f5e5] focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex size-9 items-center justify-center rounded-full bg-white/65 text-seafoam-ink"><ArrowDownLeft size={19} aria-hidden="true"/></span>
          <span className="text-sm font-bold text-navy">Add income</span>
        </motion.button>
        <motion.button whileHover={{ y:-3 }} whileTap={{scale:.98}} type="button" onClick={() => openCreate('expense')} className="flex min-h-32 min-w-0 flex-col items-start justify-between gap-4 rounded-2xl bg-navy p-4 text-left transition-colors hover:bg-navy-soft focus-visible:ring-2 focus-visible:ring-ring">
          <span className="flex size-9 items-center justify-center rounded-full bg-white/10 text-seafoam"><ArrowUpRight size={19} aria-hidden="true"/></span>
          <span className="text-sm font-bold text-ivory">Add expense</span>
        </motion.button>
      </div>
      <div className="mt-auto flex flex-col divide-y divide-border/80 pt-4">
        <Link href="/workspace/budgets" className="group flex items-center justify-between gap-2 py-3 text-sm font-semibold text-foreground transition hover:text-seafoam-ink"><span className="flex items-center gap-2"><Target size={16} className="text-seafoam-ink"/> Manage budgets</span><ArrowRight className="size-4 transition-transform group-hover:translate-x-1"/></Link>
        <Link href="/workspace/analytics" className="group flex items-center justify-between gap-2 py-3 text-sm font-semibold text-foreground transition hover:text-seafoam-ink"><span className="flex items-center gap-2"><ChartNoAxesCombined size={16} className="text-cobalt"/> View spending insights</span><ArrowRight className="size-4 transition-transform group-hover:translate-x-1"/></Link>
      </div>
    </section>
  )
}
