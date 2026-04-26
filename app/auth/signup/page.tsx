'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Landmark, Eye, EyeOff, UserPlus, Info, Phone, MapPin, Fingerprint, Loader2 } from 'lucide-react'
import Logo from '@/components/ui/Logo'

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
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.03 }}
        transition={{ duration: 1 }}
        className="fixed inset-0" 
        style={{ backgroundImage: 'linear-gradient(#00d4aa 1px,transparent 1px),linear-gradient(90deg,#00d4aa 1px,transparent 1px)', backgroundSize: '60px 60px' }} 
      />

      {/* Decorative glows */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.div 
          animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-[#00d4aa]/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ opacity: [0.05, 0.1, 0.05], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[5%] -left-[10%] w-[50%] h-[50%] bg-[#4090f0]/10 rounded-full blur-[100px]" 
        />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Logo */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="text-center mb-10"
        >
          <Logo size={56} className="mx-auto mb-4" />
          <h1 className="font-display font-800 text-[28px] text-white tracking-tight">Nexus<span className="text-[#00d4aa]">Bank</span></h1>
          <p className="text-[13px] text-[#8890a0] mt-1">Unified Banking System</p>
        </motion.div>

        {/* Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="card p-8 space-y-6 bg-[#111318]/80 backdrop-blur-xl border border-white/5"
        >
          <div>
            <h2 className="font-display font-700 text-[18px] text-white mb-1">Create account</h2>
            <p className="text-[13px] text-[#8890a0]">Join our secure unified banking network</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-3 rounded-lg bg-[#f05050]/10 border border-[#f05050]/20 text-[12px] text-[#f05050] overflow-hidden"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-[12px] text-accent overflow-hidden"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="md:col-span-2">
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Full Name</label>
              <input name="name" className="input focus:border-[#00d4aa]/50 transition-all" placeholder="Arjun Mehta" value={formData.name} onChange={handleChange} />
            </motion.div>
            
            <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.45 }} className="md:col-span-2">
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Email Address</label>
              <input name="email" type="email" className="input focus:border-[#00d4aa]/50 transition-all" placeholder="arjun@example.com" value={formData.email} onChange={handleChange} />
            </motion.div>

            <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="md:col-span-2">
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input name="password" className="input pr-10 focus:border-[#00d4aa]/50 transition-all" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8890a0] hover:text-white transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55 }}>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Phone</label>
              <input name="phone" className="input focus:border-[#00d4aa]/50 transition-all" placeholder="+91 98765..." value={formData.phone} onChange={handleChange} />
            </motion.div>

            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Aadhar No</label>
              <input name="aadhar" className="input focus:border-[#00d4aa]/50 transition-all" placeholder="12-digit number" value={formData.aadhar} onChange={handleChange} />
            </motion.div>

            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.65 }} className="md:col-span-2">
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Residential Address</label>
              <input name="address" className="input focus:border-[#00d4aa]/50 transition-all" placeholder="123, Skyline Towers, Mumbai" value={formData.address} onChange={handleChange} />
            </motion.div>

            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="md:col-span-2">
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Account Type</label>
              <select name="role" className="input cursor-pointer focus:border-[#00d4aa]/50 transition-all" value={formData.role} onChange={handleChange}>
                <option value="customer">Customer (Individual)</option>
                <option value="employee">Bank Staff</option>
                <option value="admin">System Administrator</option>
              </select>
            </motion.div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSignup}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-4 py-3"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : <UserPlus size={18} />}
            {loading ? 'Creating account...' : 'Sign up'}
          </motion.button>

          <div className="text-center pt-2">
            <span className="text-[12px] text-[#8890a0]">Already have an account? </span>
            <Link href="/auth/login" title="Sign in" className="text-[12px] text-accent font-700 hover:underline">Sign in</Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
