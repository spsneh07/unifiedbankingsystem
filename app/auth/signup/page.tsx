'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Landmark } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignup = () => {
    setLoading(true)
    setTimeout(() => router.push('/dashboard'), 900)
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-4">
      <div className="fixed inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#00d4aa 1px,transparent 1px),linear-gradient(90deg,#00d4aa 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="w-full max-w-sm animate-slide-up relative">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
            <Landmark size={28} className="text-accent" />
          </div>
          <h1 className="font-display font-800 text-[24px] text-white">Create Account</h1>
          <p className="text-[13px] text-[#8890a0] mt-1">Join NexusBank today</p>
        </div>

        <div className="card p-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2">First Name</label>
              <input className="input text-sm" placeholder="Arjun" />
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2">Last Name</label>
              <input className="input text-sm" placeholder="Mehta" />
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2">Email</label>
            <input className="input text-sm" type="email" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2">Phone</label>
            <input className="input text-sm" placeholder="10-digit number" />
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2">Password</label>
            <input className="input text-sm" type="password" placeholder="Min 8 characters" />
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2">Role</label>
            <select className="input text-sm">
              <option value="customer">Customer</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button onClick={handleSignup} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
            {loading ? <span className="w-4 h-4 rounded-full border-2 border-[#0a0c10] border-t-transparent animate-spin" /> : 'Create Account'}
          </button>
          <p className="text-center text-[12px] text-[#8890a0]">
            Already have an account?{' '}
            <a href="/auth/login" className="text-accent hover:underline">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  )
}
