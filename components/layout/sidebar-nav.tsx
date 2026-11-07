'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { isActivePath, NAV_ITEMS } from './nav-items'

interface SidebarNavProps {
  onNavigate?: () => void
  /** Unique id so the active indicator animates within one navigation only. */
  indicatorId: string
}

export function SidebarNav({ onNavigate, indicatorId }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav aria-label="Main">
      <ul className="space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href)
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group relative flex h-11 items-center gap-3 rounded-xl px-3.5 text-[15px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-seafoam',
                  active ? 'text-ivory' : 'text-ivory/65 hover:text-ivory',
                )}
              >
                {active && (
                  <motion.span
                    layoutId={`${indicatorId}-active`}
                    className="absolute inset-0 rounded-xl bg-navy-soft ring-1 ring-white/10"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  />
                )}
                <Icon
                  className={cn('relative size-[18px]', active && 'text-seafoam')}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
                <span className="relative">{item.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
