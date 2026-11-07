'use client'

import type { ReactNode } from 'react'
import { useAppSelector } from '@/store/hooks'
import { selectHydrated } from '@/store/selectors'

function PageSkeleton() {
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">Loading your finances…</span>
      <div className="h-12 w-72 animate-pulse rounded-xl bg-muted" />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-56 animate-pulse rounded-2xl bg-muted lg:col-span-2" />
        <div className="h-56 animate-pulse rounded-2xl bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-28 animate-pulse rounded-2xl bg-muted" />
        <div className="h-28 animate-pulse rounded-2xl bg-muted" />
        <div className="h-28 animate-pulse rounded-2xl bg-muted" />
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-muted" />
    </div>
  )
}

/** Shows a placeholder until saved data has been read, so server and client markup match. */
export function PageGate({ children }: { children: ReactNode }) {
  const hydrated = useAppSelector(selectHydrated)
  return hydrated ? <>{children}</> : <PageSkeleton />
}
