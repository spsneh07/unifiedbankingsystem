'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Landmark, Eye, EyeOff, UserPlus } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSignup = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
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

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '2rem' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; }`}</style>

      {/* Background glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,170,0.07),transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#46f1c5,#00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Landmark size={20} color="#002118" />
              </div>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#e2e2e8' }}>Unified<span style={{ color: '#00d4aa' }}>Bank</span></span>
            </div>
          </Link>
          <p style={{ fontSize: 14, color: '#8890a0', marginTop: 4 }}>Create your account</p>
        </div>

        {/* Card */}
        <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '36px 32px', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f0f2f8', marginBottom: 6 }}>Sign Up</h1>
          <p style={{ fontSize: 14, color: '#8890a0', marginBottom: 28 }}>Fill in the details to create your account</p>

          {error && (
            <div style={{ background: 'rgba(240,80,80,0.1)', border: '1px solid rgba(240,80,80,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#f05050' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, color: '#00d4aa' }}>
              {success}
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#8890a0', marginBottom: 8 }}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', background: '#080a0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', color: '#e2e2e8', fontSize: 15, outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.5)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#8890a0', marginBottom: 8 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                style={{ width: '100%', background: '#080a0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 44px 12px 14px', color: '#e2e2e8', fontSize: 15, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = 'rgba(0,212,170,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
              />
              <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8890a0', display: 'flex' }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Role */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#8890a0', marginBottom: 8 }}>Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              style={{ width: '100%', background: '#080a0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 14px', color: '#e2e2e8', fontSize: 15, outline: 'none', cursor: 'pointer' }}
            >
              <option value="customer">Customer</option>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Submit */}
          <button
            onClick={handleSignup}
            disabled={loading}
            style={{ width: '100%', background: loading ? 'rgba(0,212,170,0.4)' : 'linear-gradient(135deg,#46f1c5,#00d4aa)', color: '#002118', fontWeight: 700, fontSize: 16, padding: '14px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s' }}
          >
            <UserPlus size={18} />
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#8890a0' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: '#00d4aa', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
