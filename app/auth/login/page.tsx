'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { getDashboardByRole } from '@/lib/auth'
import Logo from '@/components/ui/Logo'
import { useSession } from '@/components/SessionProvider'

export default function LoginPage() {
  const router = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('admin@nexusbank.com')
  const [password, setPassword] = useState('admin')
  const [error, setError] = useState('')
  const { setUser } = useSession()

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
        setUser(data.user)
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
    <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-4 relative overflow-hidden">
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
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-[#00d4aa]/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ opacity: [0.05, 0.15, 0.05], scale: [1, 1.1, 1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-[#4090f0]/10 rounded-full blur-[100px]" 
        />
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
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
            <h2 className="font-display font-700 text-[18px] text-white mb-1">Sign in</h2>
            <p className="text-[13px] text-[#8890a0]">Enter your credentials to access the dashboard</p>
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
          </AnimatePresence>

          <div className="space-y-4">
            <motion.div whileFocus={{ scale: 1.01 }}>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Email</label>
              <input className="input focus:border-[#00d4aa]/50 transition-all" type="email" placeholder="admin@nexusbank.in" value={email} onChange={e => setEmail(e.target.value)} />
            </motion.div>
            <motion.div whileFocus={{ scale: 1.01 }}>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Password</label>
              <div className="relative">
                <input className="input pr-10 focus:border-[#00d4aa]/50 transition-all" type={showPw ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8890a0] hover:text-white transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>
          </div>

          <div className="flex items-center justify-between text-[12px]">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-3.5 h-3.5 rounded accent-[#00d4aa] bg-white/5 border-white/10" defaultChecked />
              <span className="text-[#8890a0] group-hover:text-white transition-colors">Remember me</span>
            </label>
            <Link href="/forgot-password" title="Forgot password?" className="text-accent hover:underline">
              Forgot password?
            </Link>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : 'Sign in'}
          </motion.button>

          <div className="text-center">
            <span className="text-[12px] text-[#8890a0]">No account? </span>
            <Link href="/auth/signup" title="Create one" className="text-[12px] text-accent hover:underline font-600">Create one</Link>
          </div>

          {/* Demo credentials */}
          <div className="pt-4 border-t border-white/5">
            <p className="text-[10px] font-700 text-[#8890a0] text-center mb-3 uppercase tracking-widest">Demo access</p>
            <div className="grid grid-cols-3 gap-2">
              {[{ role: 'Admin', email: 'admin@nexusbank.com', pw: 'admin' }, { role: 'Employee', email: 'employee@nexusbank.com', pw: 'employee123' }, { role: 'Customer', email: 'customer@nexusbank.com', pw: 'password' }].map((d, i) => (
                <motion.div 
                  key={d.role} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  whileHover={{ y: -2, backgroundColor: 'rgba(0,212,170,0.05)', borderColor: 'rgba(0,212,170,0.2)' }}
                  className="bg-white/5 border border-white/5 rounded-lg p-2 text-center cursor-pointer transition-colors" 
                  onClick={() => { setEmail(d.email); setPassword(d.pw); }}
                >
                  <p className="text-[10px] font-display font-800 text-[#00d4aa]">{d.role}</p>
                  <p className="text-[9px] text-[#8890a0] truncate mt-0.5">{d.email}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
