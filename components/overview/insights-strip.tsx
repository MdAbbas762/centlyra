'use client'

import { AnimatePresence, motion } from 'motion/react'
import { CircleAlert, Info, Sparkles, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { InsightTone } from '@/lib/finance/insights'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store/hooks'
import { selectInsights } from '@/store/selectors'

const TONES: Record<InsightTone, { icon: LucideIcon; wrapper: string; icon_: string }> = {
  alert: { icon: CircleAlert, wrapper: 'border-rose-ink/20 bg-rose-soft/60', icon_: 'bg-rose-ink text-white' },
  caution: { icon: TriangleAlert, wrapper: 'border-amber-ink/20 bg-amber-soft/70', icon_: 'bg-amber-ink text-white' },
  positive: { icon: Sparkles, wrapper: 'border-seafoam-ink/20 bg-seafoam-soft/70', icon_: 'bg-seafoam-ink text-white' },
  neutral: { icon: Info, wrapper: 'border-border bg-card', icon_: 'bg-navy text-ivory' },
}

export function InsightsStrip() {
  const insights = useAppSelector(selectInsights)

  return (
    <section aria-label="Highlights for this month">
      <ul className="grid gap-3 md:grid-cols-3">
        <AnimatePresence initial={false}>
          {insights.map((insight) => {
            const tone = TONES[insight.tone]
            const Icon = tone.icon
            return (
              <motion.li
                key={insight.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={cn('flex gap-3 rounded-2xl border p-4', tone.wrapper)}
              >
                <span
                  aria-hidden="true"
                  className={cn('mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full', tone.icon_)}
                >
                  <Icon className="size-3.5" strokeWidth={2.2} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{insight.body}</p>
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </section>
  )
}
