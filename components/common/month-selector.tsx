'use client'

import { Check, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { addMonths, formatMonthLabel } from '@/lib/finance/dates'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { monthSelected } from '@/store/slices/appSlice'
import { selectAvailableMonths, selectCurrentMonth, selectSelectedMonth } from '@/store/selectors'

export function MonthSelector({ label = 'Reporting month' }: { label?: string }) {
  const dispatch = useAppDispatch()
  const selected = useAppSelector(selectSelectedMonth)
  const current = useAppSelector(selectCurrentMonth)
  const months = useAppSelector(selectAvailableMonths)

  const earliest = months[0]
  const previous = addMonths(selected, -1)
  const next = addMonths(selected, 1)

  return (
    <div
      role="group"
      aria-label={label}
      className="flex w-fit max-w-full min-w-0 items-center gap-0 rounded-xl border border-border bg-card p-1 shadow-xs sm:gap-1"
    >
      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-lg"
        disabled={selected <= earliest}
        onClick={() => dispatch(monthSelected(previous))}
      >
        <ChevronLeft aria-hidden="true" />
        <span className="sr-only">Previous month</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex h-8 min-w-0 items-center justify-center gap-1 rounded-lg px-1.5 text-xs font-semibold sm:min-w-36 sm:gap-1.5 sm:px-2 sm:text-sm text-foreground transition-colors outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 data-popup-open:bg-muted"
          aria-label={`${label}: ${formatMonthLabel(selected)}. Choose a month`}
        >
          {formatMonthLabel(selected)}
          <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="max-h-72 w-52">
          {[...months].reverse().map((month) => (
            <DropdownMenuItem key={month} onClick={() => dispatch(monthSelected(month))}>
              <span className="flex-1">{formatMonthLabel(month)}</span>
              {month === selected && <Check className="size-4 text-cobalt" aria-hidden="true" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        className="size-8 rounded-lg"
        disabled={selected >= current}
        onClick={() => dispatch(monthSelected(next))}
      >
        <ChevronRight aria-hidden="true" />
        <span className="sr-only">Next month</span>
      </Button>
    </div>
  )
}
