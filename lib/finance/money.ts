const currencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

const wholeCurrencyFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0,
})

const compactFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  notation: 'compact',
  maximumFractionDigits: 1,
})

/** Formats an amount in pence as pounds, e.g. 123456 -> "£1,234.56". */
export function formatMoney(minor: number): string {
  return currencyFormatter.format(minor / 100)
}

/** Formats an amount with an explicit leading sign for non-zero values. */
export function formatSignedMoney(minor: number): string {
  if (minor === 0) return formatMoney(0)
  const formatted = currencyFormatter.format(Math.abs(minor) / 100)
  return `${minor > 0 ? '+' : '−'}${formatted}`
}

export function formatWholeMoney(minor: number): string {
  return wholeCurrencyFormatter.format(minor / 100)
}

/** Short form for chart axes, e.g. 125000 -> "£1.3K". */
export function formatCompactMoney(minor: number): string {
  return compactFormatter.format(minor / 100)
}

export function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`
}

const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/

/**
 * Converts user-entered pounds (e.g. "12.5", "£1,200.00") to integer pence.
 * Returns null when the text is not a valid non-negative amount with at most two decimals.
 */
export function parseAmountToMinor(input: string): number | null {
  const cleaned = input.trim().replace(/^£/, '').replace(/,/g, '')
  if (!AMOUNT_PATTERN.test(cleaned)) return null
  const [whole, fraction = ''] = cleaned.split('.')
  const minor = Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
  return Number.isSafeInteger(minor) ? minor : null
}

/** Converts pence to an editable decimal string, e.g. 1250 -> "12.50". */
export function minorToInputValue(minor: number): string {
  const whole = Math.trunc(minor / 100)
  const fraction = String(Math.abs(minor % 100)).padStart(2, '0')
  return `${whole}.${fraction}`
}
