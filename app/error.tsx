'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error reporting service in production
    console.error('Unhandled error:', error)
  }, [error])

  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0c10]">
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#f05050]/10 border border-[#f05050]/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={28} className="text-[#f05050]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
              Something went wrong
            </h1>
            <p className="text-[#8890a0] text-[14px] mb-2 leading-relaxed">
              An unexpected error occurred. Our team has been notified.
            </p>
            {error?.digest && (
              <p className="text-[11px] text-[#4a5060] font-mono mb-6">
                Error ID: {error.digest}
              </p>
            )}
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={() => reset()}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                <RefreshCw size={14} />
                Try Again
              </button>
              <Link href="/dashboard" className="btn-ghost px-5 py-2.5 rounded-lg text-[14px]">
                Go to Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </body>
    </html>
  )
}
