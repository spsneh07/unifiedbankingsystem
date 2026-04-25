'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Landmark } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [token, setToken] = useState('')

  const submit = async () => {
    setLoading(true)
    setError('')
    setToken('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok || !data?.success) {
        setError(data?.error || 'Request failed')
        return
      }
      setToken(data.token)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(#00d4aa 1px,transparent 1px),linear-gradient(90deg,#00d4aa 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="w-full max-w-sm animate-slide-up relative">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 glow-accent">
            <Landmark size={28} className="text-accent" />
          </div>
          <h1 className="font-display font-800 text-[28px] text-white">NexusBank</h1>
          <p className="text-[13px] text-[#8890a0] mt-1">Password reset</p>
        </div>

        <div className="card p-8 space-y-5">
          <div>
            <h2 className="font-display font-700 text-[18px] text-white mb-1">Forgot password</h2>
            <p className="text-[13px] text-[#8890a0]">Enter your email to generate a reset token</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#f05050]/10 border border-[#f05050]/20 text-[12px] text-[#f05050]">
              {error}
            </div>
          )}

          {token && (
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-[12px] text-accent break-all">
              {token}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-[#0a0c10] border-t-transparent animate-spin" />
            ) : (
              'Generate token'
            )}
          </button>

          <div className="text-center text-[12px] text-[#8890a0]">
            <Link href="/reset-password" className="text-accent hover:underline">
              Have a token? Reset password
            </Link>
            <span className="mx-2">·</span>
            <Link href="/auth/login" className="text-accent hover:underline">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

