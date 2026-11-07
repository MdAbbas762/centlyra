import type { Metadata } from 'next'
import { OverviewView } from '@/components/overview/overview-view'

export const metadata: Metadata = { title: 'Workspace overview' }

export default function OverviewPage() {
  return <OverviewView />
}
