'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Landmark, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json()
      if (!res.ok || !data?.success) {
        setError(data?.error || 'Reset failed')
        return
      }
      router.replace('/login')
      router.refresh()
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
          <p className="text-[13px] text-[#8890a0] mt-1">Set a new password</p>
        </div>

        <div className="card p-8 space-y-5">
          <div>
            <h2 className="font-display font-700 text-[18px] text-white mb-1">Reset password</h2>
            <p className="text-[13px] text-[#8890a0]">Paste your token and choose a new password</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#f05050]/10 border border-[#f05050]/20 text-[12px] text-[#f05050]">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2">Token</label>
              <input
                className="input"
                type="text"
                placeholder="Paste token"
                value={token}
                onChange={e => setToken(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2">New password</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <button
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8890a0] hover:text-white transition-colors"
                  type="button"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
              'Update password'
            )}
          </button>

          <div className="text-center text-[12px] text-[#8890a0]">
            <Link href="/forgot-password" className="text-accent hover:underline">
              Need a token?
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

