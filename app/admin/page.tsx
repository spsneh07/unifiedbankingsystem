'use client'
import { useState, useEffect } from 'react'
import { ShieldCheck, Users, CreditCard, ArrowLeftRight, AlertTriangle, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/mockData'

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null)

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  useEffect(() => {
    fetch('/api/dashboard', { cache: 'no-store' }).then(r => r.json()).then(r => { if (r.success) setData(r.data) }).catch(() => {})
  }, [user?.id])

  const stats = data ? [
    { label: 'Total Balance', value: formatCurrency(data.totalBalance), icon: TrendingUp, color: '#f0c040' },
    { label: 'Accounts', value: data.totalAccounts, icon: CreditCard, color: '#4090f0' },
    { label: 'Customers', value: data.totalCustomers, icon: Users, color: '#00d4aa' },
    { label: 'Fraud Alerts', value: data.fraudAlerts?.length || 0, icon: AlertTriangle, color: '#f05050' },
  ] : []

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-[#f0c040]/10 border border-[#f0c040]/20 flex items-center justify-center">
          <ShieldCheck size={24} className="text-[#f0c040]" />
        </div>
        <div>
          <h1 className="text-xl font-display font-800 text-white">Admin Dashboard</h1>
          <p className="text-[13px] text-[#8890a0]">Full system overview — <span className="text-[#f0c040]">Root Access</span></p>
        </div>
      </div>

      {data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-[11px] font-display font-600 uppercase tracking-widest text-[#8890a0] mb-1">{s.label}</p>
              <p className="text-[22px] font-display font-800" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-[#8890a0] text-sm">Loading system data...</div>
      )}
    </div>
  )
}
