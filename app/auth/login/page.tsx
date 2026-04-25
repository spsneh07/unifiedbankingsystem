'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Landmark, Eye, EyeOff } from 'lucide-react'
import { saveSession, getDashboardByRole } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('admin@bank.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (data.success) {
        saveSession(data.user)
        router.replace(getDashboardByRole(data.user.role))
        router.refresh()
      } else {
        setError(data.error || 'Login failed')
      }
    } catch {
      setError('An error occurred during login')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-4">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#00d4aa 1px,transparent 1px),linear-gradient(90deg,#00d4aa 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="w-full max-w-sm animate-slide-up relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 glow-accent">
            <Landmark size={28} className="text-accent" />
          </div>
          <h1 className="font-display font-800 text-[28px] text-white">NexusBank</h1>
          <p className="text-[13px] text-[#8890a0] mt-1">Unified Banking System</p>
        </div>

        {/* Card */}
        <div className="card p-8 space-y-5">
          <div>
            <h2 className="font-display font-700 text-[18px] text-white mb-1">Sign in</h2>
            <p className="text-[13px] text-[#8890a0]">Enter your credentials to access the dashboard</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#f05050]/10 border border-[#f05050]/20 text-[12px] text-[#f05050]">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2">Email</label>
              <input className="input" type="email" placeholder="admin@nexusbank.in" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2">Password</label>
              <div className="relative">
                <input className="input pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8890a0] hover:text-white transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[12px]">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-3.5 h-3.5 rounded accent-[#00d4aa]" defaultChecked />
              <span className="text-[#8890a0]">Remember me</span>
            </label>
            <a href="#" className="text-accent hover:underline">Forgot password?</a>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-[#0a0c10] border-t-transparent animate-spin" />
            ) : 'Sign in'}
          </button>

          <div className="text-center">
            <span className="text-[12px] text-[#8890a0]">No account? </span>
            <a href="/signup" className="text-[12px] text-accent hover:underline">Create one</a>
          </div>

          {/* Demo credentials */}
          <div className="pt-2 border-t border-[#1a1d24]">
            <p className="text-[11px] text-[#8890a0] text-center mb-2">Demo credentials</p>
            <div className="grid grid-cols-3 gap-2">
              {[{ role: 'Admin', email: 'admin@bank.com', pw: 'password123' }, { role: 'Employee', email: 'employee@bank.com', pw: 'password123' }, { role: 'Customer', email: 'arjun.mehta@gmail.com', pw: 'password123' }].map(d => (
                <div key={d.role} className="bg-[#1a1d24] rounded-lg p-2 text-center cursor-pointer" onClick={() => { setEmail(d.email); setPassword(d.pw); }}>
                  <p className="text-[10px] font-display font-700 text-accent">{d.role}</p>
                  <p className="text-[10px] text-[#8890a0] truncate">{d.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
