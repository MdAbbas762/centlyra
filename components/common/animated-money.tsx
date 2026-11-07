'use client'

import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { formatMoney } from '@/lib/finance/money'

interface AnimatedMoneyProps {
  /** Amount in pence. */
  value: number
  format?: (minor: number) => string
  className?: string
}

/** Shows an amount and eases between values whenever it changes. */
export function AnimatedMoney({ value, format = formatMoney, className }: AnimatedMoneyProps) {
  const reduceMotion = useReducedMotion()
  const motionValue = useMotionValue(value)
  const [displayed, setDisplayed] = useState(value)

  useMotionValueEvent(motionValue, 'change', (latest) => setDisplayed(Math.round(latest)))

  useEffect(() => {
    if (reduceMotion) {
      motionValue.set(value)
      return
    }
    const controls = animate(motionValue, value, { duration: 0.7, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [value, reduceMotion, motionValue])

  return (
    <span className={className} data-value={value}>
      {format(reduceMotion ? value : displayed)}
    </span>
  )
}
