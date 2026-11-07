import { Inbox } from 'lucide-react'
import { CategoryDot } from '@/components/common/category-icon'
import { EmptyState } from '@/components/common/empty-state'
import type { CategoryComparison } from '@/lib/finance/calculations'
import { getCategory } from '@/lib/finance/categories'
import { formatMoney, formatSignedMoney } from '@/lib/finance/money'
import { cn } from '@/lib/utils'

const MAX_ROWS = 8

interface CategoryComparisonTableProps {
  rows: readonly CategoryComparison[]
  currentLabel: string
  previousLabel: string
}

export function CategoryComparisonTable({ rows, currentLabel, previousLabel }: CategoryComparisonTableProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="No spending to compare"
        description="Neither month has any spending in a category yet."
        className="py-6"
      />
    )
  }

  return (
    <>
    <ul className="space-y-2 sm:hidden" aria-label="Spending comparison by category">
      {rows.slice(0, MAX_ROWS).map((row) => (
        <li key={row.categoryId} className="min-w-0 rounded-xl border border-border bg-muted/40 p-3">
          <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
            <CategoryDot categoryId={row.categoryId} />
            <span className="min-w-0 flex-1 break-words">{getCategory(row.categoryId).label}</span>
            <span className={cn('tabular shrink-0 text-xs', row.change > 0 ? 'text-rose-ink' : row.change < 0 ? 'text-seafoam-ink' : 'text-muted-foreground')}>{formatSignedMoney(row.change)}</span>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3">
            <div><dt className="text-xs text-muted-foreground">{currentLabel}</dt><dd className="tabular mt-1 text-sm font-semibold">{formatMoney(row.current)}</dd></div>
            <div><dt className="text-xs text-muted-foreground">{previousLabel}</dt><dd className="tabular mt-1 text-sm font-semibold">{formatMoney(row.previous)}</dd></div>
          </dl>
        </li>
      ))}
    </ul>
    <div className="hidden min-w-0 overflow-x-auto sm:block">
      <table className="w-full min-w-[420px] border-collapse text-sm">
        <caption className="sr-only">
          Spending by category in {currentLabel} compared with {previousLabel}
        </caption>
        <thead>
          <tr className="border-b border-border text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <th scope="col" className="py-2.5 pr-3 text-left">
              Category
            </th>
            <th scope="col" className="px-3 py-2.5 text-right">
              {currentLabel}
            </th>
            <th scope="col" className="px-3 py-2.5 text-right">
              {previousLabel}
            </th>
            <th scope="col" className="py-2.5 pl-3 text-right">
              Change
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, MAX_ROWS).map((row) => {
            const spendingUp = row.change > 0
            const spendingDown = row.change < 0
            return (
              <tr key={row.categoryId} className="border-b border-border/70 last:border-b-0">
                <th scope="row" className="py-3 pr-3 text-left font-medium text-foreground">
                  <span className="flex items-center gap-2.5">
                    <CategoryDot categoryId={row.categoryId} />
                    {getCategory(row.categoryId).label}
                  </span>
                </th>
                <td className="tabular px-3 py-3 text-right font-semibold">{formatMoney(row.current)}</td>
                <td className="tabular px-3 py-3 text-right text-muted-foreground">{formatMoney(row.previous)}</td>
                <td
                  className={cn(
                    'tabular py-3 pl-3 text-right font-semibold',
                    spendingUp && 'text-rose-ink',
                    spendingDown && 'text-seafoam-ink',
                    !spendingUp && !spendingDown && 'text-muted-foreground',
                  )}
                >
                  {formatSignedMoney(row.change)}
                  {row.percent !== null && row.change !== 0 && (
                    <span className="ml-1 text-xs font-medium opacity-80">
                      ({Math.abs(row.percent).toFixed(0)}%)
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
    </>
  )
}
