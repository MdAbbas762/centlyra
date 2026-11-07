'use client'

import { FilterX, Search } from 'lucide-react'
import { useId } from 'react'
import { NativeSelect } from '@/components/common/native-select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CATEGORIES } from '@/lib/finance/categories'
import {
  hasActiveFilters,
  SORT_LABELS,
  type SortOption,
  type TransactionFilters,
} from '@/lib/finance/filtering'
import { cn } from '@/lib/utils'

interface TransactionFiltersBarProps {
  filters: TransactionFilters
  onChange: (next: TransactionFilters) => void
  onClear: () => void
  today: string
}

const TYPE_OPTIONS: ReadonlyArray<{ value: TransactionFilters['type']; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Money in' },
  { value: 'expense', label: 'Money out' },
]

export function TransactionFiltersBar({ filters, onChange, onClear, today }: TransactionFiltersBarProps) {
  const uid = useId()
  const active = hasActiveFilters(filters)
  const invalidRange = filters.from !== '' && filters.to !== '' && filters.from > filters.to
  const patch = (partial: Partial<TransactionFilters>) => onChange({ ...filters, ...partial })

  return (
    <section aria-label="Search and filter transactions" className="surface space-y-4 p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
        <div className="min-w-0 flex-1">
          <Label htmlFor={`${uid}-search`} className="mb-1.5 text-sm font-medium">
            Search
          </Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              id={`${uid}-search`}
              type="search"
              value={filters.query}
              onChange={(event) => patch({ query: event.target.value })}
              placeholder="Search by description or merchant"
              autoComplete="off"
              className="h-10 pl-9"
            />
          </div>
        </div>

        <div role="radiogroup" aria-label="Transaction type" className="grid w-full min-w-0 grid-cols-3 gap-1 rounded-xl bg-muted p-1 lg:flex lg:w-auto">
          {TYPE_OPTIONS.map((option) => {
            const selected = filters.type === option.value
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => patch({ type: option.value })}
                className={cn(
                  'h-8 min-w-0 flex-1 rounded-lg px-1 text-xs font-semibold whitespace-nowrap sm:px-3 sm:text-sm transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring/40 lg:flex-none',
                  selected
                    ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0 lg:col-span-1">
          <Label htmlFor={`${uid}-category`} className="mb-1.5 text-sm font-medium">
            Category
          </Label>
          <NativeSelect
            id={`${uid}-category`}
            value={filters.categoryId}
            onChange={(event) => patch({ categoryId: event.target.value })}
          >
            <option value="all">All categories</option>
            <optgroup label="Money out">
              {CATEGORIES.filter((c) => c.kind === 'expense').map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Money in">
              {CATEGORIES.filter((c) => c.kind === 'income').map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </optgroup>
          </NativeSelect>
        </div>

        <div>
          <Label htmlFor={`${uid}-from`} className="mb-1.5 text-sm font-medium">
            From
          </Label>
          <Input
            id={`${uid}-from`}
            type="date"
            max={filters.to || today}
            value={filters.from}
            onChange={(event) => patch({ from: event.target.value })}
            aria-invalid={invalidRange}
            className="h-10 min-w-0"
          />
        </div>

        <div>
          <Label htmlFor={`${uid}-to`} className="mb-1.5 text-sm font-medium">
            To
          </Label>
          <Input
            id={`${uid}-to`}
            type="date"
            min={filters.from || undefined}
            max={today}
            value={filters.to}
            onChange={(event) => patch({ to: event.target.value })}
            aria-invalid={invalidRange}
            className="h-10 min-w-0"
          />
        </div>

        <div className="min-w-0 lg:col-span-1">
          <Label htmlFor={`${uid}-sort`} className="mb-1.5 text-sm font-medium">
            Sort by
          </Label>
          <NativeSelect
            id={`${uid}-sort`}
            value={filters.sort}
            onChange={(event) => patch({ sort: event.target.value as SortOption })}
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
              <option key={option} value={option}>
                {SORT_LABELS[option]}
              </option>
            ))}
          </NativeSelect>
        </div>
      </div>

      {(active || invalidRange) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p role={invalidRange ? 'alert' : undefined} className="text-xs font-medium text-rose-ink">
            {invalidRange ? 'The start date needs to be on or before the end date.' : ''}
          </p>
          {active && (
            <Button variant="ghost" className="h-9 rounded-lg px-3 text-sm font-semibold" onClick={onClear}>
              <FilterX aria-hidden="true" />
              Clear filters
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
