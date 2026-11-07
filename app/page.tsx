import type { Metadata } from 'next'
import { LandingPage } from '@/components/landing/landing-page'
import './landing.css'

export const metadata: Metadata = {
  title: 'Centlyra — Make sense of your money',
  description: 'Understand your spending, set budgets that fit, and keep the full picture of your finances in view.',
}

export default function HomePage() {
  return <LandingPage />
}
