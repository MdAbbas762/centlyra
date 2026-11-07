'use client'

import { motion } from 'motion/react'
import type { BudgetStatus } from '@/lib/finance/types'
import { cn } from '@/lib/utils'

const FILL: Record<BudgetStatus, string> = {
  unused: 'bg-transparent',
  'on-track': 'bg-seafoam',
  near: 'bg-[#e0a43a]',
  over: 'bg-[#d4553f]',
}

interface ProgressBarProps {
  /** Percentage of the limit used. Values above 100 fill the bar. */
  value: number
  status: BudgetStatus
  label: string
  className?: string
}

export function ProgressBar({ value, status, label, className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}
    >
      <motion.div
        className={cn('h-full rounded-full', FILL[status])}
        initial={false}
        animate={{ width: `${clamped}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 24 }}
      />
    </div>
  )
}
