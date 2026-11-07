import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import { AppProviders } from '@/components/providers/app-providers'
import './globals.css'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})


export const metadata: Metadata = {
  title: {
    default: 'Centlyra — Make sense of your money',
    template: '%s · Centlyra',
  },
  description:
    'Centlyra brings your transactions, monthly budgets, and spending trends together in one clear, thoughtfully designed workspace.',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0c1730',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en-GB" className={`${manrope.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
