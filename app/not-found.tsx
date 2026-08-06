'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Logo from '@/components/ui/Logo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0c10] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] rounded-full bg-[#00d4aa]/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center"
      >
        <Logo size={52} className="mb-6 opacity-60" />

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-[120px] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#00d4aa] to-[#00d4aa]/20 select-none mb-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          404
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-2xl font-bold text-white mb-3"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Page Not Found
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-[#8890a0] text-[15px] max-w-sm mb-8 leading-relaxed"
        >
          The page you're looking for doesn't exist or has been moved.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="flex gap-3"
        >
          <Link
            href="/dashboard"
            className="btn-primary px-6 py-2.5 rounded-lg text-[14px] font-semibold"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="btn-ghost px-6 py-2.5 rounded-lg text-[14px]"
          >
            Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
