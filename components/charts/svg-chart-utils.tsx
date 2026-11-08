'use client'

import { useEffect, useRef, useState } from 'react'

/** Reads the real chart width without relying on Recharts/React-is measurement internals. */
export function useChartWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(640)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const measure = () => {
      const next = Math.round(element.getBoundingClientRect().width)
      if (next > 0) setWidth((previous) => (previous === next ? previous : next))
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return { ref, width }
}

export function chartCeiling(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 10000
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const normalised = value / magnitude
  const step = [1, 1.5, 2, 2.5, 5, 10].find((candidate) => candidate >= normalised) ?? 10
  return step * magnitude
}

/** Smooth enough for time-series displays while preserving each real data point. */
export function polylinePath(points: ReadonlyArray<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ')
}

export function ChartHover({ text }: { text: string | null }) {
  if (!text) return null
  return <div aria-live="polite" className="pointer-events-none absolute right-3 top-1 z-10 max-w-[78%] rounded-lg border border-border bg-card/95 px-3 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur-sm">{text}</div>
}

export const AXIS_COLOR = '#687488'
export const GRID_COLOR = '#e5dfcf'
