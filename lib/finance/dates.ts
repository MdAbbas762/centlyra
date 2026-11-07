import type { IsoDate, MonthKey } from './types'

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const MONTH_PATTERN = /^(\d{4})-(\d{2})$/

function pad(value: number, length = 2): string {
  return String(value).padStart(length, '0')
}

/** Today's date in the user's local calendar. */
export function getTodayIso(now: Date = new Date()): IsoDate {
  return `${pad(now.getFullYear(), 4)}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function isValidIsoDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value)
  if (!match) return false
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])]
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

export function toMonthKey(date: IsoDate): MonthKey {
  return date.slice(0, 7)
}

export function isValidMonthKey(value: string): boolean {
  const match = MONTH_PATTERN.exec(value)
  if (!match) return false
  const month = Number(match[2])
  return month >= 1 && month <= 12
}

function parseMonth(key: MonthKey): { year: number; month: number } {
  const match = MONTH_PATTERN.exec(key)
  if (!match) throw new Error(`Invalid month key: ${key}`)
  return { year: Number(match[1]), month: Number(match[2]) }
}

export function addMonths(key: MonthKey, offset: number): MonthKey {
  const { year, month } = parseMonth(key)
  const index = year * 12 + (month - 1) + offset
  return `${pad(Math.floor(index / 12), 4)}-${pad((index % 12) + 1)}`
}

/** Months in ascending order ending at `endMonth`. */
export function getMonthRange(endMonth: MonthKey, count: number): MonthKey[] {
  return Array.from({ length: count }, (_, index) => addMonths(endMonth, index - (count - 1)))
}

/** Months from `startMonth` to `endMonth`, inclusive and ascending. */
export function getMonthsBetween(startMonth: MonthKey, endMonth: MonthKey): MonthKey[] {
  if (startMonth > endMonth) return [endMonth]
  const months: MonthKey[] = []
  let cursor = startMonth
  while (cursor <= endMonth) {
    months.push(cursor)
    cursor = addMonths(cursor, 1)
  }
  return months
}

export function getDaysInMonth(key: MonthKey): number {
  const { year, month } = parseMonth(key)
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

export function getMonthStart(key: MonthKey): IsoDate {
  return `${key}-01`
}

export function getMonthEnd(key: MonthKey): IsoDate {
  return `${key}-${pad(getDaysInMonth(key))}`
}

export function getDayOfMonth(date: IsoDate): number {
  return Number(date.slice(8, 10))
}

export function makeIsoDate(month: MonthKey, day: number): IsoDate {
  return `${month}-${pad(day)}`
}

function toUtcDate(date: IsoDate): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

const monthLongFormatter = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
const monthNameFormatter = new Intl.DateTimeFormat('en-GB', { month: 'long', timeZone: 'UTC' })
const monthShortFormatter = new Intl.DateTimeFormat('en-GB', { month: 'short', timeZone: 'UTC' })
const dayMonthFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
})
const fullDateFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})
const tableDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

/** e.g. "July 2026" */
export function formatMonthLabel(key: MonthKey): string {
  return monthLongFormatter.format(toUtcDate(`${key}-01`))
}

/** e.g. "July" */
export function formatMonthName(key: MonthKey): string {
  return monthNameFormatter.format(toUtcDate(`${key}-01`))
}

/** e.g. "Jul" */
export function formatMonthShort(key: MonthKey): string {
  return monthShortFormatter.format(toUtcDate(`${key}-01`))
}

/** e.g. "12 Jul" */
export function formatDayMonth(date: IsoDate): string {
  return dayMonthFormatter.format(toUtcDate(date))
}

/** e.g. "Sunday 12 July 2026" */
export function formatFullDate(date: IsoDate): string {
  return fullDateFormatter.format(toUtcDate(date))
}

/** e.g. "12 Jul 2026" */
export function formatTableDate(date: IsoDate): string {
  return tableDateFormatter.format(toUtcDate(date))
}
