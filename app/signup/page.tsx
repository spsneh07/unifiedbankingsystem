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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#080a0f',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: '12px 14px',
    color: '#e2e2e8',
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.2s'
  }

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 600,
    color: '#8890a0',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080a0f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif', padding: '40px 20px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { border-color: #00d4aa !important; }
        select:focus { border-color: #00d4aa !important; }
      `}</style>

      {/* Background glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 600, borderRadius: '50%', background: 'radial-gradient(circle,rgba(0,212,170,0.05),transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 500, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg,#46f1c5,#00d4aa)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0,212,170,0.2)' }}>
                <Landmark size={22} color="#002118" />
              </div>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#f0f2f8' }}>Nexus<span style={{ color: '#00d4aa' }}>Bank</span></span>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: '#0f1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '40px', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f0f2f8', marginBottom: 8 }}>Join NexusBank</h1>
          <p style={{ fontSize: 14, color: '#8890a0', marginBottom: 32 }}>Enter your professional details to get started.</p>

          {error && (
            <div style={{ background: 'rgba(240,80,80,0.1)', border: '1px solid rgba(240,80,80,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#f05050' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#00d4aa' }}>
              {success}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
             <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}><Info size={14} /> Full Name</label>
                <input name="name" style={inputStyle} placeholder="Arjun Mehta" value={formData.name} onChange={handleChange} />
             </div>
             
             <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}><Info size={14} /> Email Address</label>
                <input name="email" type="email" style={inputStyle} placeholder="arjun@example.com" value={formData.email} onChange={handleChange} />
             </div>

             <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}><Info size={14} /> Password</label>
                <div style={{ position: 'relative' }}>
                  <input name="password" type={showPw ? 'text' : 'password'} style={{ ...inputStyle, paddingRight: 44 }} placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} />
                  <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#3d4455', display: 'flex' }}>
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
             </div>

             <div>
                <label style={labelStyle}><Phone size={14} /> Phone</label>
                <input name="phone" style={inputStyle} placeholder="+91 98765..." value={formData.phone} onChange={handleChange} />
             </div>

             <div>
                <label style={labelStyle}><Fingerprint size={14} /> Aadhar No</label>
                <input name="aadhar" style={inputStyle} placeholder="12-digit number" value={formData.aadhar} onChange={handleChange} />
             </div>

             <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}><MapPin size={14} /> Residential Address</label>
                <input name="address" style={inputStyle} placeholder="123, Skyline Towers, Mumbai" value={formData.address} onChange={handleChange} />
             </div>

             <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Account Type</label>
                <select name="role" style={{ ...inputStyle, cursor: 'pointer' }} value={formData.role} onChange={handleChange}>
                  <option value="customer">Customer (Individual)</option>
                  <option value="employee">Bank Staff</option>
                  <option value="admin">System Administrator</option>
                </select>
             </div>
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            style={{ width: '100%', background: loading ? 'rgba(0,212,170,0.4)' : 'linear-gradient(135deg,#46f1c5,#00d4aa)', color: '#002118', fontWeight: 700, fontSize: 16, padding: '16px', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.2s', marginTop: 10, boxShadow: '0 10px 30px rgba(0,212,170,0.2)' }}
          >
            {loading ? (
               <span style={{ width: 18, height: 18, border: '2px solid #002118', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            ) : <UserPlus size={20} />}
            {loading ? 'Processing...' : 'Create My Account'}
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#8890a0' }}>
          Already using NexusBank?{' '}
          <Link href="/auth/login" style={{ color: '#00d4aa', fontWeight: 600, textDecoration: 'none' }}>Sign in here</Link>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
