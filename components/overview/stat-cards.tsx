'use client'

import { ArrowDownLeft, ArrowUpRight, Scale } from 'lucide-react'
import { AnimatedMoney } from '@/components/common/animated-money'
import { DeltaChip } from '@/components/common/delta-chip'
import { MetricCard } from '@/components/common/metric-card'
import { formatSignedMoney } from '@/lib/finance/money'
import { useAppSelector } from '@/store/hooks'
import { selectMonthComparison, selectMonthSummary } from '@/store/selectors'

export function StatCards() {
  const summary = useAppSelector(selectMonthSummary)
  const comparison = useAppSelector(selectMonthComparison)

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <MetricCard
        label="Money in"
        icon={ArrowDownLeft}
        iconClassName="bg-seafoam-soft text-seafoam-ink"
        value={<AnimatedMoney value={summary.income} />}
        footer={<DeltaChip comparison={comparison.income} />}
      />
      <MetricCard
        label="Money out"
        icon={ArrowUpRight}
        iconClassName="bg-navy text-ivory"
        value={<AnimatedMoney value={summary.expenses} />}
        footer={<DeltaChip comparison={comparison.expenses} higherIsWorse />}
      />
      <MetricCard
        label="Net cash flow"
        icon={Scale}
        iconClassName="bg-cobalt-soft text-cobalt"
        value={
          <AnimatedMoney
            value={summary.net}
            format={formatSignedMoney}
            className={summary.net < 0 ? 'text-rose-ink' : undefined}
          />
        }
        footer={<DeltaChip comparison={comparison.net} />}
      />
    </div>
  )
}
