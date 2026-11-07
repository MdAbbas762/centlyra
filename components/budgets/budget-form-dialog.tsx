'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { CategoryIcon } from '@/components/common/category-icon'
import { MotionButton } from '@/components/common/motion-button'
import { NativeSelect } from '@/components/common/native-select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getCategoriesByKind, getCategory } from '@/lib/finance/categories'
import { formatMoney, minorToInputValue, parseAmountToMinor } from '@/lib/finance/money'
import type { Budget } from '@/lib/finance/types'
import { budgetFormSchema, type BudgetFormValues } from '@/lib/finance/validation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectBudgets } from '@/store/selectors'
import { budgetAdded, budgetLimitUpdated } from '@/store/slices/budgetsSlice'

export type BudgetDialogState =
  | { mode: 'create'; categoryId?: string }
  | { mode: 'edit'; budget: Budget }

interface BudgetFormDialogProps {
  state: BudgetDialogState | null
  onClose: () => void
}

export function BudgetFormDialog({ state, onClose }: BudgetFormDialogProps) {
  return (
    <Dialog open={state !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="!w-[calc(100vw-24px)] !max-w-[460px] max-h-[calc(100dvh-24px)] min-w-0 gap-0 overflow-x-hidden overflow-y-auto p-0">
        {state && (
          <>
            <DialogHeader className="border-b border-border px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
              <DialogTitle className="font-display text-2xl">
                {state.mode === 'edit' ? 'Edit budget' : 'Create a budget'}
              </DialogTitle>
              <DialogDescription>
                {state.mode === 'edit'
                  ? 'Change your monthly limit. It applies to every month.'
                  : 'Set a monthly limit for a category. It applies to every month.'}
              </DialogDescription>
            </DialogHeader>
            <BudgetForm state={state} onDone={onClose} />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function BudgetForm({ state, onDone }: { state: BudgetDialogState; onDone: () => void }) {
  const dispatch = useAppDispatch()
  const budgets = useAppSelector(selectBudgets)
  const uid = useId()
  const editing = state.mode === 'edit' ? state.budget : null

  const budgeted = new Set(budgets.map((b) => b.categoryId))
  const available = getCategoriesByKind('expense').filter((c) => !budgeted.has(c.id))

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    mode: 'onTouched',
    defaultValues: {
      categoryId: editing?.categoryId ?? (state.mode === 'create' ? (state.categoryId ?? '') : ''),
      limit: editing ? minorToInputValue(editing.limit) : '',
    },
  })

  const onSubmit = (values: BudgetFormValues) => {
    const limit = parseAmountToMinor(values.limit)
    if (limit === null) return
    const label = getCategory(values.categoryId).label
    if (editing) {
      dispatch(budgetLimitUpdated({ id: editing.id, limit }))
      toast.success('Budget updated.', { description: `${label} is now ${formatMoney(limit)} a month.` })
    } else {
      dispatch(budgetAdded({ categoryId: values.categoryId, limit }))
      toast.success('Budget created.', { description: `${label} is set to ${formatMoney(limit)} a month.` })
    }
    onDone()
  }

  const categoryId = `${uid}-category`
  const limitId = `${uid}-limit`

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="min-w-0 space-y-5 px-4 py-5 sm:px-6">
      {editing ? (
        <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-3">
          <CategoryIcon categoryId={editing.categoryId} />
          <div>
            <p className="text-sm font-semibold">{getCategory(editing.categoryId).label}</p>
            <p className="text-xs text-muted-foreground">Currently {formatMoney(editing.limit)} a month</p>
          </div>
          <input type="hidden" {...register('categoryId')} />
        </div>
      ) : (
        <div>
          <Label htmlFor={categoryId} className="mb-1.5 text-sm font-medium">
            Category
          </Label>
          <NativeSelect
            id={categoryId}
            aria-invalid={!!errors.categoryId}
            aria-describedby={errors.categoryId ? `${categoryId}-error` : undefined}
            disabled={available.length === 0}
            {...register('categoryId')}
          >
            <option value="">
              {available.length === 0 ? 'Every category already has a budget' : 'Choose a category'}
            </option>
            {available.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </NativeSelect>
          {errors.categoryId && (
            <p id={`${categoryId}-error`} role="alert" className="mt-1.5 text-xs font-medium text-rose-ink">
              {errors.categoryId.message}
            </p>
          )}
        </div>
      )}

      <div>
        <Label htmlFor={limitId} className="mb-1.5 text-sm font-medium">
          Monthly limit
        </Label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-muted-foreground"
          >
            £
          </span>
          <Input
            id={limitId}
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            aria-invalid={!!errors.limit}
            aria-describedby={errors.limit ? `${limitId}-error` : undefined}
            className="tabular h-10 pl-7"
            {...register('limit')}
          />
        </div>
        {errors.limit && (
          <p id={`${limitId}-error`} role="alert" className="mt-1.5 text-xs font-medium text-rose-ink">
            {errors.limit.message}
          </p>
        )}
      </div>

      <DialogFooter className="-mx-4 -mb-5 flex flex-col-reverse gap-2 border-t border-border bg-muted/40 px-4 py-4 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
        <Button type="button" variant="outline" className="h-10 rounded-xl px-4" onClick={onDone}>
          Cancel
        </Button>
        <MotionButton type="submit" disabled={!editing && available.length === 0}>
          {editing ? 'Save budget' : 'Create budget'}
        </MotionButton>
      </DialogFooter>
    </form>
  )
}
