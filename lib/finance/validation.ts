import { z } from 'zod'
import { isCategoryOfKind } from './categories'
import { isValidIsoDate } from './dates'
import { parseAmountToMinor } from './money'
import type { IsoDate } from './types'

export const MAX_AMOUNT_MINOR = 100_000_000 * 100

function amountField(label: string) {
  return z
    .string()
    .trim()
    .min(1, `Enter ${label}.`)
    .superRefine((value, ctx) => {
      const minor = parseAmountToMinor(value)
      if (minor === null) {
        ctx.addIssue({
          code: 'custom',
          message: value.startsWith('-')
            ? 'The amount must be greater than £0.00.'
            : 'Use a number with up to two decimal places, like 24.50.',
        })
        return
      }
      if (minor <= 0) {
        ctx.addIssue({ code: 'custom', message: 'The amount must be greater than £0.00.' })
      } else if (minor > MAX_AMOUNT_MINOR) {
        ctx.addIssue({ code: 'custom', message: 'That amount is higher than we can record.' })
      }
    })
}

export function createTransactionFormSchema(today: IsoDate) {
  return z
    .object({
      type: z.enum(['income', 'expense']),
      amount: amountField('an amount'),
      description: z
        .string()
        .trim()
        .min(1, 'Add a short description.')
        .max(80, 'Keep the description under 80 characters.'),
      merchant: z
        .string()
        .trim()
        .min(1, 'Add where the money went or came from.')
        .max(60, 'Keep this under 60 characters.'),
      categoryId: z.string().min(1, 'Choose a category.'),
      date: z
        .string()
        .min(1, 'Choose a date.')
        .refine(isValidIsoDate, 'Enter a valid date.')
        .refine((value) => !isValidIsoDate(value) || value >= '2000-01-01', 'Choose a date from 2000 onwards.')
        .refine((value) => !isValidIsoDate(value) || value <= today, "Choose a date that isn't in the future."),
      notes: z.string().trim().max(240, 'Keep notes under 240 characters.'),
    })
    .superRefine((values, ctx) => {
      if (values.categoryId && !isCategoryOfKind(values.categoryId, values.type)) {
        ctx.addIssue({
          code: 'custom',
          path: ['categoryId'],
          message: 'Choose a category that matches this transaction.',
        })
      }
    })
}

export type TransactionFormValues = z.infer<ReturnType<typeof createTransactionFormSchema>>

export const budgetFormSchema = z.object({
  categoryId: z.string().min(1, 'Choose a category.'),
  limit: amountField('a monthly limit'),
})

export type BudgetFormValues = z.infer<typeof budgetFormSchema>

/** Schemas for data restored from storage. */
export const storedTransactionSchema = z.object({
  id: z.string().min(1),
  description: z.string(),
  merchant: z.string(),
  amount: z.number().int().positive(),
  type: z.enum(['income', 'expense']),
  categoryId: z.string(),
  date: z.string().refine(isValidIsoDate),
  notes: z.string().optional(),
})

export const storedBudgetSchema = z.object({
  id: z.string().min(1),
  categoryId: z.string().min(1),
  limit: z.number().int().positive(),
})

export const persistedDataSchema = z.object({
  version: z.literal(1),
  openingBalance: z.number().int(),
  transactions: z.array(storedTransactionSchema),
  budgets: z.array(storedBudgetSchema),
})
