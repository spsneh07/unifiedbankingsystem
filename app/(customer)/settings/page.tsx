'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, User, Loader2, ShieldCheck, Mail, Phone, MapPin } from 'lucide-react'
import { useSession } from '@/components/SessionProvider'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

export default function SettingsPage() {
  const { user } = useSession()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    email: '',
  })

  useEffect(() => {
    if (!user?.id) return

    fetch('/api/customers/profile', { credentials: 'include' })
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setFormData({
            first_name: res.data.first_name || '',
            last_name: res.data.last_name || '',
            phone: res.data.phone || '',
            address: res.data.address || '',
            email: res.data.email || '',
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user?.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/customers/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          address: formData.address,
        }),
        credentials: 'include'
      })
      const data = await res.json()
      if (data.success) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' })
      } else {
        setMessage({ text: data.error || 'Failed to update profile.', type: 'error' })
      }
    } catch (error) {
      setMessage({ text: 'An unexpected error occurred.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-6 max-w-4xl mx-auto w-full"
    >
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="text-2xl font-display font-800 text-black dark:text-white mb-2">Account Settings</h1>
        <p className="text-[#8890a0] text-sm">Update your personal information and profile details.</p>
      </motion.div>

      <motion.div variants={itemVariants} className="card bg-[#111318]/50 backdrop-blur-sm overflow-hidden">
        <div className="border-b border-white/5 p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent">
            <User size={28} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-black dark:text-white">Profile Details</h2>
            <p className="text-xs text-[#8890a0] flex items-center gap-1 mt-1">
              <ShieldCheck size={12} className="text-accent" /> Securely stored
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg mb-6 text-sm font-medium border ${message.type === 'success' ? 'bg-[#00d4aa]/10 text-[#00d4aa] border-[#00d4aa]/20' : 'bg-[#f05050]/10 text-[#f05050] border-[#f05050]/20'}`}
            >
              {message.text}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8890a0] uppercase tracking-wider">First Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-[#8890a0]" />
                </div>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#1a1d24] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                  placeholder="John"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8890a0] uppercase tracking-wider">Last Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={16} className="text-[#8890a0]" />
                </div>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#1a1d24] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8890a0] uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-[#8890a0]" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="w-full bg-[#1a1d24]/50 border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#8890a0] cursor-not-allowed"
                  placeholder="john@example.com"
                />
              </div>
              <p className="text-[10px] text-[#8890a0] pl-1">Email cannot be changed directly for security reasons.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#8890a0] uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone size={16} className="text-[#8890a0]" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#1a1d24] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-[#8890a0] uppercase tracking-wider">Residential Address</label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <MapPin size={16} className="text-[#8890a0]" />
                </div>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full bg-[#1a1d24] border border-white/5 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all resize-none"
                  placeholder="123 Financial District, New York, NY 10004"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
