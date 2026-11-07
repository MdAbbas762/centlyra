'use client'

import { motion, type HTMLMotionProps, type Variants } from 'motion/react'

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
}

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 30 } },
}

export function StaggerGroup(props: HTMLMotionProps<'div'>) {
  return <motion.div initial="hidden" animate="show" variants={container} {...props} />
}

export function StaggerItem(props: HTMLMotionProps<'div'>) {
  return <motion.div variants={item} {...props} />
}
