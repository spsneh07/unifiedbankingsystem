'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Landmark, Eye, EyeOff, UserPlus, Info, Phone, MapPin, Fingerprint } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    aadhar: '',
    role: 'customer'
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSignup = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      setError('Please fill in at least Name, Email and Password')
      return
    }
    
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.success) {
        setSuccess('Account created! Redirecting to login...')
        setTimeout(() => router.push('/auth/login'), 1500)
      } else {
        setError(data.error || 'Signup failed')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-4 py-12">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#00d4aa 1px,transparent 1px),linear-gradient(90deg,#00d4aa 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="w-full max-w-lg animate-slide-up relative">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 glow-accent">
            <Landmark size={28} className="text-accent" />
          </div>
          <h1 className="font-display font-800 text-[28px] text-white">NexusBank</h1>
          <p className="text-[13px] text-[#8890a0] mt-1">Unified Banking System</p>
        </div>

        {/* Card */}
        <div className="card p-8 space-y-6">
          <div>
            <h2 className="font-display font-700 text-[18px] text-white mb-1">Create account</h2>
            <p className="text-[13px] text-[#8890a0]">Join our secure unified banking network</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-[#f05050]/10 border border-[#f05050]/20 text-[12px] text-[#f05050]">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-[12px] text-accent">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Full Name</label>
              <input name="name" className="input" placeholder="Arjun Mehta" value={formData.name} onChange={handleChange} />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Email Address</label>
              <input name="email" type="email" className="input" placeholder="arjun@example.com" value={formData.email} onChange={handleChange} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input name="password" className="input pr-10" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8890a0] hover:text-white transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Phone</label>
              <input name="phone" className="input" placeholder="+91 98765..." value={formData.phone} onChange={handleChange} />
            </div>

            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Aadhar No</label>
              <input name="aadhar" className="input" placeholder="12-digit number" value={formData.aadhar} onChange={handleChange} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Residential Address</label>
              <input name="address" className="input" placeholder="123, Skyline Towers, Mumbai" value={formData.address} onChange={handleChange} />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Account Type</label>
              <select name="role" className="input cursor-pointer" value={formData.role} onChange={handleChange}>
                <option value="customer">Customer (Individual)</option>
                <option value="employee">Bank Staff</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-4 h-4 rounded-full border-2 border-[#0a0c10] border-t-transparent animate-spin" />
            ) : <UserPlus size={18} />}
            {loading ? 'Creating account...' : 'Sign up'}
          </button>

          <div className="text-center">
            <span className="text-[12px] text-[#8890a0]">Already have an account? </span>
            <Link href="/auth/login" className="text-[12px] text-accent font-600 hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
