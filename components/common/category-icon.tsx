import {
  Briefcase,
  CircleDollarSign,
  Clapperboard,
  Ellipsis,
  HeartPulse,
  House,
  Laptop,
  PiggyBank,
  Plane,
  Receipt,
  ShoppingBag,
  ShoppingBasket,
  TramFront,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import { getCategory } from '@/lib/finance/categories'
import { cn } from '@/lib/utils'

const ICONS: Record<string, LucideIcon> = {
  housing: House,
  groceries: ShoppingBasket,
  dining: UtensilsCrossed,
  transport: TramFront,
  shopping: ShoppingBag,
  bills: Receipt,
  entertainment: Clapperboard,
  health: HeartPulse,
  travel: Plane,
  'other-expense': Ellipsis,
  salary: Briefcase,
  freelance: Laptop,
  interest: PiggyBank,
  'other-income': CircleDollarSign,
}

interface CategoryIconProps {
  categoryId: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = {
  sm: 'size-8 rounded-lg [&>svg]:size-4',
  md: 'size-10 rounded-xl [&>svg]:size-[18px]',
  lg: 'size-12 rounded-2xl [&>svg]:size-5',
}

export function CategoryIcon({ categoryId, className, size = 'md' }: CategoryIconProps) {
  const category = getCategory(categoryId)
  const Icon = ICONS[categoryId] ?? Ellipsis
  return (
    <span
      aria-hidden="true"
      className={cn('flex shrink-0 items-center justify-center', SIZES[size], className)}
      style={{
        backgroundColor: `color-mix(in oklab, ${category.color} 14%, transparent)`,
        color: category.color,
      }}
    >
      <Icon strokeWidth={1.9} />
    </span>
  )
}

export function CategoryDot({ categoryId, className }: { categoryId: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block size-2.5 shrink-0 rounded-full', className)}
      style={{ backgroundColor: getCategory(categoryId).color }}
    />
  )
}
