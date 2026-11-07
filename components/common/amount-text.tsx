import { formatMoney } from '@/lib/finance/money'
import type { TransactionType } from '@/lib/finance/types'
import { cn } from '@/lib/utils'

interface AmountTextProps {
  /** Positive amount in pence. */
  amount: number
  type: TransactionType
  className?: string
}

export function AmountText({ amount, type, className }: AmountTextProps) {
  const isIncome = type === 'income'
  return (
    <span
      className={cn(
        'tabular font-semibold whitespace-nowrap',
        isIncome ? 'text-seafoam-ink' : 'text-foreground',
        className,
      )}
    >
      <span aria-hidden="true">{isIncome ? '+' : '−'}</span>
      <span className="sr-only">{isIncome ? 'Money in ' : 'Money out '}</span>
      {formatMoney(amount)}
    </span>
  )
}
