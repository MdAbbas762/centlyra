import { getDayOfMonth, getDaysInMonth, getMonthRange, makeIsoDate, toMonthKey } from './dates'
import type { Budget, IsoDate, MonthKey, PersistedData, Transaction, TransactionType } from './types'

/** Balance on the first day of the earliest sample month, in pence. */
export const SAMPLE_OPENING_BALANCE = 320_000

/** Number of months of sample history, ending with the current month. */
export const SAMPLE_HISTORY_MONTHS = 12

interface FixedEntry {
  key: string
  day: number
  description: string
  merchant: string
  categoryId: string
  type: TransactionType
  /** Amount range in pence. Equal bounds give a fixed amount. */
  min: number
  max: number
  /** Include only in months where `monthIndex % every === offset`. */
  every?: number
  offset?: number
}

interface VariableEntry {
  key: string
  /** Typical number of occurrences in a full month. */
  perMonth: number
  descriptions: readonly string[]
  merchants: readonly string[]
  categoryId: string
  min: number
  max: number
  /** Include only in months where `monthIndex % every === offset`. */
  every?: number
  offset?: number
}

const FIXED_ENTRIES: readonly FixedEntry[] = [
  { key: 'rent', day: 1, description: 'Monthly rent', merchant: 'Hartley Lettings', categoryId: 'housing', type: 'expense', min: 125_000, max: 125_000 },
  { key: 'salary', day: 2, description: 'Monthly salary', merchant: 'Northbridge Studio', categoryId: 'salary', type: 'income', min: 348_000, max: 348_000 },
  { key: 'gym', day: 3, description: 'Gym membership', merchant: 'Forge Fitness', categoryId: 'health', type: 'expense', min: 4_200, max: 4_200 },
  { key: 'council', day: 5, description: 'Council tax', merchant: 'Riverside Council', categoryId: 'bills', type: 'expense', min: 14_200, max: 14_200 },
  { key: 'energy', day: 8, description: 'Gas and electricity', merchant: 'Lumen Energy', categoryId: 'bills', type: 'expense', min: 6_800, max: 10_400 },
  { key: 'broadband', day: 10, description: 'Home broadband', merchant: 'Fibrewell', categoryId: 'bills', type: 'expense', min: 3_499, max: 3_499 },
  { key: 'mobile', day: 12, description: 'Mobile plan', merchant: 'Pebble Mobile', categoryId: 'bills', type: 'expense', min: 1_600, max: 1_600 },
  { key: 'streaming', day: 15, description: 'Streaming subscription', merchant: 'Streamly', categoryId: 'entertainment', type: 'expense', min: 1_099, max: 1_099 },
  { key: 'music', day: 15, description: 'Music subscription', merchant: 'Tuneloft', categoryId: 'entertainment', type: 'expense', min: 1_199, max: 1_199 },
  { key: 'interest', day: 20, description: 'Savings interest', merchant: 'Centlyra Savings Pot', categoryId: 'interest', type: 'income', min: 380, max: 920 },
  { key: 'freelance', day: 18, description: 'Design project payment', merchant: 'Pixel & Pine Studio', categoryId: 'freelance', type: 'income', min: 40_000, max: 90_000, every: 3, offset: 0 },
  { key: 'refund', day: 22, description: 'Order refund', merchant: 'Loom & Lane', categoryId: 'other-income', type: 'income', min: 2_500, max: 7_800, every: 5, offset: 2 },
]

const VARIABLE_ENTRIES: readonly VariableEntry[] = [
  { key: 'groceries', perMonth: 9, descriptions: ['Weekly shop', 'Top-up shop', 'Fresh produce', 'Bakery and dairy'], merchants: ['Greenfield Market', 'Oakline Grocers', 'Fresh Basket'], categoryId: 'groceries', min: 1_800, max: 6_800 },
  { key: 'dining', perMonth: 5, descriptions: ['Lunch out', 'Dinner with friends', 'Coffee and a pastry', 'Weekend brunch'], merchants: ['Café Marlowe', 'Juniper Kitchen', 'The Salt House', 'Sushi Hana'], categoryId: 'dining', min: 900, max: 4_800 },
  { key: 'transport', perMonth: 6, descriptions: ['Train fare', 'Taxi home', 'Bus pass top-up', 'Bike hire'], merchants: ['MetroLine', 'Swift Cabs', 'Cyclo Hire'], categoryId: 'transport', min: 280, max: 2_200 },
  { key: 'shopping', perMonth: 3, descriptions: ['New jacket', 'Books and stationery', 'Home essentials', 'Kitchen supplies'], merchants: ['Loom & Lane', 'Paperwell Books', 'Northgate Home'], categoryId: 'shopping', min: 1_400, max: 9_500 },
  { key: 'entertainment', perMonth: 2, descriptions: ['Cinema tickets', 'Live music tickets', 'Gallery entry'], merchants: ['Lantern Cinema', 'Stagehouse Tickets', 'Eastside Gallery'], categoryId: 'entertainment', min: 1_200, max: 6_000 },
  { key: 'health', perMonth: 1, descriptions: ['Pharmacy', 'Dental check-up', 'Eye care'], merchants: ['Wellcare Pharmacy', 'Brightside Dental'], categoryId: 'health', min: 600, max: 2_200 },
  { key: 'travel', perMonth: 1, descriptions: ['Weekend rail tickets', 'Coastal getaway', 'Airport transfer'], merchants: ['Coastline Rail', 'Harbour Stay'], categoryId: 'travel', min: 6_000, max: 14_000, every: 4, offset: 2 },
  { key: 'other', perMonth: 1, descriptions: ['Gift for a friend', 'Postage and packaging', 'Charity donation'], merchants: ['Giftwell', 'Postbox', 'Hopeful Hearts'], categoryId: 'other-expense', min: 800, max: 3_500, every: 2, offset: 1 },
]

const SAMPLE_BUDGET_LIMITS: ReadonlyArray<readonly [string, number]> = [
  ['groceries', 42_000],
  ['dining', 20_000],
  ['transport', 12_000],
  ['shopping', 18_000],
  ['bills', 34_000],
  ['entertainment', 9_000],
]

function hashString(value: string): number {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** Small deterministic generator so sample data is identical for a given month. */
function createRandom(seed: string): () => number {
  let state = hashString(seed)
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)]
}

function amountBetween(min: number, max: number, random: () => number): number {
  if (min === max) return min
  const raw = min + random() * (max - min)
  // Round to the nearest 10p so amounts look like real card payments.
  return Math.max(min, Math.round(raw / 10) * 10 - (random() > 0.5 ? 1 : 0))
}

function appliesInMonth(entry: { every?: number; offset?: number }, monthIndex: number): boolean {
  return entry.every === undefined || monthIndex % entry.every === (entry.offset ?? 0)
}

function generateMonth(month: MonthKey, monthIndex: number, today: IsoDate): Transaction[] {
  const random = createRandom(`centlyra:${month}`)
  const isCurrentMonth = toMonthKey(today) === month
  const lastDay = isCurrentMonth ? getDayOfMonth(today) : getDaysInMonth(month)
  const progress = lastDay / getDaysInMonth(month)
  const transactions: Transaction[] = []

  for (const entry of FIXED_ENTRIES) {
    if (!appliesInMonth(entry, monthIndex) || entry.day > lastDay) continue
    transactions.push({
      id: `sample-${month}-${entry.key}`,
      description: entry.description,
      merchant: entry.merchant,
      amount: amountBetween(entry.min, entry.max, random),
      type: entry.type,
      categoryId: entry.categoryId,
      date: makeIsoDate(month, entry.day),
    })
  }

  for (const entry of VARIABLE_ENTRIES) {
    if (!appliesInMonth(entry, monthIndex)) continue
    const variation = Math.round((random() - 0.5) * 2)
    const baseCount = Math.max(1, entry.perMonth + variation)
    const count = isCurrentMonth
      ? Math.max(entry.perMonth >= 5 ? 1 : 0, Math.round(baseCount * progress))
      : baseCount
    for (let i = 0; i < count; i++) {
      const day = 1 + Math.floor(random() * lastDay)
      transactions.push({
        id: `sample-${month}-${entry.key}-${i + 1}`,
        description: pick(entry.descriptions, random),
        merchant: pick(entry.merchants, random),
        amount: amountBetween(entry.min, entry.max, random),
        type: 'expense',
        categoryId: entry.categoryId,
        date: makeIsoDate(month, day),
      })
    }
  }

  return transactions
}

export function createSampleTransactions(today: IsoDate): Transaction[] {
  const months = getMonthRange(toMonthKey(today), SAMPLE_HISTORY_MONTHS)
  return months.flatMap((month, index) => generateMonth(month, index, today))
}

export function createSampleBudgets(): Budget[] {
  return SAMPLE_BUDGET_LIMITS.map(([categoryId, limit]) => ({
    id: `sample-budget-${categoryId}`,
    categoryId,
    limit,
  }))
}

export function createSampleData(today: IsoDate): PersistedData {
  return {
    version: 1,
    openingBalance: SAMPLE_OPENING_BALANCE,
    transactions: createSampleTransactions(today),
    budgets: createSampleBudgets(),
  }
}
