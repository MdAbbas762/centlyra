'use client'

import { motion } from 'motion/react'
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type MotionButtonProps = ComponentProps<typeof Button> & { wrapperClassName?: string }

/** A button that responds to hover and press with a gentle spring. */
export function MotionButton({ wrapperClassName, className, ...props }: MotionButtonProps) {
  return (
    <motion.span
      className={cn('inline-flex', wrapperClassName)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 500, damping: 28 }}
    >
      <Button className={cn('h-10 rounded-xl px-4 text-sm font-semibold', className)} {...props} />
    </motion.span>
  )
}
