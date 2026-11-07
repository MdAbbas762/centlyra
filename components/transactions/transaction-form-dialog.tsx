'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'motion/react'
import { useId, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
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
import { Textarea } from '@/components/ui/textarea'
import { getCategoriesByKind, getCategory } from '@/lib/finance/categories'
import { formatMoney, minorToInputValue, parseAmountToMinor } from '@/lib/finance/money'
import type { Transaction, TransactionType } from '@/lib/finance/types'
import {
  createTransactionFormSchema,
  type TransactionFormValues,
} from '@/lib/finance/validation'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectToday } from '@/store/selectors'
import { transactionAdded, transactionUpdated } from '@/store/slices/transactionsSlice'

interface TransactionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
  defaultType: TransactionType
}

export function TransactionFormDialog({
  open,
  onOpenChange,
  transaction,
  defaultType,
}: TransactionFormDialogProps) {
  const isEditing = transaction !== null
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!w-[calc(100vw-24px)] !max-w-[520px] max-h-[calc(100dvh-24px)] min-w-0 gap-0 overflow-x-hidden overflow-y-auto rounded-2xl p-0">
        <DialogHeader className="border-b border-border px-4 pt-5 pb-4 sm:px-6 sm:pt-6">
          <DialogTitle className="font-display text-2xl">
            {isEditing ? 'Edit transaction' : 'Add transaction'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details and your totals will adjust straight away.'
              : 'Record money in or money out to keep your picture up to date.'}
          </DialogDescription>
        </DialogHeader>
        <TransactionForm
          transaction={transaction}
          defaultType={defaultType}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

interface TransactionFormProps {
  transaction: Transaction | null
  defaultType: TransactionType
  onDone: () => void
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-rose-ink">
      {message}
    </p>
  )
}

function TransactionForm({ transaction, defaultType, onDone }: TransactionFormProps) {
  const dispatch = useAppDispatch()
  const today = useAppSelector(selectToday)
  const schema = useMemo(() => createTransactionFormSchema(today), [today])
  const uid = useId()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: transaction
      ? {
          type: transaction.type,
          amount: minorToInputValue(transaction.amount),
          description: transaction.description,
          merchant: transaction.merchant,
          categoryId: transaction.categoryId,
          date: transaction.date,
          notes: transaction.notes ?? '',
        }
      : {
          type: defaultType,
          amount: '',
          description: '',
          merchant: '',
          categoryId: '',
          date: today,
          notes: '',
        },
  })

  const type = watch('type')
  const categories = getCategoriesByKind(type)

  const selectType = (next: TransactionType) => {
    if (next === getValues('type')) return
    setValue('type', next, { shouldDirty: true })
    setValue('categoryId', '', { shouldDirty: true })
  }

  const onSubmit = (values: TransactionFormValues) => {
    const amount = parseAmountToMinor(values.amount)
    if (amount === null) return
    const fields = {
      type: values.type,
      amount,
      description: values.description,
      merchant: values.merchant,
      categoryId: values.categoryId,
      date: values.date,
      notes: values.notes === '' ? undefined : values.notes,
    }
    if (transaction) {
      dispatch(transactionUpdated({ ...fields, id: transaction.id }))
      toast.success('Transaction updated.', {
        description: `${values.description} · ${formatMoney(amount)}`,
      })
    } else {
      dispatch(transactionAdded(fields))
      toast.success('Transaction added successfully.', {
        description: `${values.description} · ${formatMoney(amount)} in ${getCategory(values.categoryId).label}`,
      })
    }
    onDone()
  }

  const ids = {
    amount: `${uid}-amount`,
    description: `${uid}-description`,
    merchant: `${uid}-merchant`,
    category: `${uid}-category`,
    date: `${uid}-date`,
    notes: `${uid}-notes`,
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="min-w-0 space-y-4 px-4 py-4 sm:space-y-5 sm:px-6 sm:py-5">
      <fieldset>
        <legend className="mb-2 text-sm font-medium text-foreground">Type</legend>
        <div
          role="radiogroup"
          aria-label="Transaction type"
          className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1"
        >
          {(['expense', 'income'] as const).map((option) => {
            const active = type === option
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => selectType(option)}
                className={cn(
                  'relative h-9 rounded-lg text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {active && (
                  <motion.span
                    layoutId={`${uid}-type-pill`}
                    className="absolute inset-0 rounded-lg bg-card shadow-sm ring-1 ring-border"
                    transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                  />
                )}
                <span className="relative">{option === 'expense' ? 'Money out' : 'Money in'}</span>
              </button>
            )
          })}
        </div>
      </fieldset>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <div>
          <Label htmlFor={ids.amount} className="mb-1.5 text-sm font-medium">
            Amount
          </Label>
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium text-muted-foreground"
            >
              £
            </span>
            <Input
              id={ids.amount}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? `${ids.amount}-error` : undefined}
              className="tabular h-10 pl-7"
              {...register('amount')}
            />
          </div>
          <FieldError id={`${ids.amount}-error`} message={errors.amount?.message} />
        </div>

        <div>
          <Label htmlFor={ids.date} className="mb-1.5 text-sm font-medium">
            Date
          </Label>
          <Input
            id={ids.date}
            type="date"
            max={today}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? `${ids.date}-error` : undefined}
            className="h-10"
            {...register('date')}
          />
          <FieldError id={`${ids.date}-error`} message={errors.date?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor={ids.description} className="mb-1.5 text-sm font-medium">
          Description
        </Label>
        <Input
          id={ids.description}
          autoComplete="off"
          placeholder={type === 'expense' ? 'e.g. Weekly shop' : 'e.g. Monthly salary'}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? `${ids.description}-error` : undefined}
          className="h-10"
          {...register('description')}
        />
        <FieldError id={`${ids.description}-error`} message={errors.description?.message} />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
        <div>
          <Label htmlFor={ids.merchant} className="mb-1.5 text-sm font-medium">
            {type === 'expense' ? 'Merchant' : 'Paid by'}
          </Label>
          <Input
            id={ids.merchant}
            autoComplete="off"
            placeholder={type === 'expense' ? 'e.g. Greenfield Market' : 'e.g. Northbridge Studio'}
            aria-invalid={!!errors.merchant}
            aria-describedby={errors.merchant ? `${ids.merchant}-error` : undefined}
            className="h-10"
            {...register('merchant')}
          />
          <FieldError id={`${ids.merchant}-error`} message={errors.merchant?.message} />
        </div>

        <div>
          <Label htmlFor={ids.category} className="mb-1.5 text-sm font-medium">
            Category
          </Label>
          <NativeSelect
            id={ids.category}
            aria-invalid={!!errors.categoryId}
            aria-describedby={errors.categoryId ? `${ids.category}-error` : undefined}
            {...register('categoryId')}
          >
            <option value="">Choose a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </NativeSelect>
          <FieldError id={`${ids.category}-error`} message={errors.categoryId?.message} />
        </div>
      </div>

      <div>
        <Label htmlFor={ids.notes} className="mb-1.5 text-sm font-medium">
          Notes <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id={ids.notes}
          rows={3}
          placeholder="Anything worth remembering about this transaction"
          aria-invalid={!!errors.notes}
          aria-describedby={errors.notes ? `${ids.notes}-error` : undefined}
          className="resize-none"
          {...register('notes')}
        />
        <FieldError id={`${ids.notes}-error`} message={errors.notes?.message} />
      </div>

      <DialogFooter className="-mx-4 -mb-4 flex flex-col-reverse gap-2 border-t border-border bg-muted/40 px-4 py-4 sm:-mx-6 sm:-mb-5 sm:flex-row sm:justify-end sm:px-6">
        <Button type="button" variant="outline" className="h-10 w-full rounded-xl px-4 sm:w-auto" onClick={onDone}>
          Cancel
        </Button>
        <MotionButton type="submit" disabled={isSubmitting}>
          {transaction ? 'Save changes' : 'Add transaction'}
        </MotionButton>
      </DialogFooter>
    </form>
  )
}
