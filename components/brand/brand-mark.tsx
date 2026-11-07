import { cn } from '@/lib/utils'

interface BrandMarkProps {
  className?: string
  /** Light variant for use on dark surfaces. */
  tone?: 'light' | 'dark'
}

/** The Centlyra mark: an open ring forming a "C", with a single cent resting inside it. */
export function BrandMark({ className, tone = 'light' }: BrandMarkProps) {
  const ring = tone === 'light' ? '#F6F2E9' : '#0C1730'
  return (
    <svg
      viewBox="0 0 40 40"
      role="img"
      aria-label="Centlyra"
      className={cn('size-9 shrink-0', className)}
    >
      <rect width="40" height="40" rx="12" fill={tone === 'light' ? '#16264A' : '#F6F2E9'} />
      <path
        d="M27.5 13.2A10 10 0 1 0 27.5 26.8"
        fill="none"
        stroke={ring}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <circle cx="26.5" cy="20" r="3.2" fill="#5ED3B0" />
    </svg>
  )
}

export function BrandWordmark({ className, tone = 'light' }: BrandMarkProps) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <BrandMark tone={tone} />
      <span
        className={cn(
          'font-display text-[1.65rem] leading-none',
          tone === 'light' ? 'text-ivory' : 'text-navy',
        )}
      >
        Centlyra
      </span>
    </span>
  )
}
