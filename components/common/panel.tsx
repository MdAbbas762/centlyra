'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PanelProps {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
  /** Lifts the card slightly on hover. */
  interactive?: boolean
  headingId?: string
}

export function Panel({
  title,
  description,
  action,
  children,
  className,
  contentClassName,
  interactive = false,
  headingId,
}: PanelProps) {
  return (
    <motion.section
      aria-labelledby={title ? headingId : undefined}
      whileHover={interactive ? { y: -2 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn('surface flex min-w-0 flex-col p-4 sm:p-6', className)}
    >
      {(title || action) && (
        <header className="mb-4 flex min-w-0 flex-col items-start gap-2.5 sm:flex-row sm:justify-between sm:gap-4">
          <div className="min-w-0">
            {title && (
              <h2 id={headingId} className="text-[15px] font-semibold tracking-tight text-foreground">
                {title}
              </h2>
            )}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn('min-h-0 min-w-0 flex-1', contentClassName)}>{children}</div>
    </motion.section>
  )
}
