import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ToastProvider } from '@/components/ui/Toast'
import { SessionProvider } from '@/components/SessionProvider'
import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  title: {
    default: 'NexusBank — Unified Banking System',
    template: '%s | NexusBank',
  },
  description: 'Manage all your bank accounts in one secure, unified platform with real-time analytics and fraud detection.',
  keywords: ['banking', 'finance', 'unified', 'dashboard', 'transactions'],
  robots: 'noindex, nofollow', // Demo app — don't index
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-white text-black dark:bg-[#0b0f14] dark:text-white" suppressHydrationWarning>
        <SessionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
