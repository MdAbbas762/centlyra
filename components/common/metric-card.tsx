'use client'

import { motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  label: string
  icon: LucideIcon
  iconClassName?: string
  /** The headline figure. */
  value: ReactNode
  footer?: ReactNode
  className?: string
}

export function MetricCard({ label, icon: Icon, iconClassName, value, footer, className }: MetricCardProps) {
  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn('surface flex min-w-0 flex-col gap-3 p-4 sm:p-5', className)}
    >
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={cn(
            'flex size-8 items-center justify-center rounded-lg bg-muted text-foreground',
            iconClassName,
          )}
        >
          <Icon className="size-4" strokeWidth={1.9} />
        </span>
        <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
      </div>
      <p className="tabular min-w-0 break-words font-display text-[clamp(1.55rem,5vw,2rem)] leading-tight text-foreground">{value}</p>
      {footer && <div className="mt-auto min-h-5">{footer}</div>}
    </motion.article>
  )
}
