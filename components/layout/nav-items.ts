import { ArrowLeftRight, ChartNoAxesCombined, LayoutDashboard, Target, type LucideIcon } from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const NAV_ITEMS: readonly NavItem[] = [
  { href: '/workspace', label: 'Overview', icon: LayoutDashboard },
  { href: '/workspace/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/workspace/budgets', label: 'Budgets', icon: Target },
  { href: '/workspace/analytics', label: 'Analytics', icon: ChartNoAxesCombined },
]

export function isActivePath(pathname: string, href: string): boolean {
  return href === '/workspace' ? pathname === '/workspace' : pathname === href || pathname.startsWith(`${href}/`)
}
