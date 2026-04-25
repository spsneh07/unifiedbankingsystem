'use client'
import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import Header from '@/components/layout/Header'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { mockScheduled, mockAccounts, formatCurrency } from '@/lib/mockData'
import { Plus, Calendar, Trash2, Play, Clock } from 'lucide-react'

export default function ScheduledPage() {
  const [showAdd, setShowAdd] = useState(false)
  const [schedules, setSchedules] = useState(mockScheduled)

  const cancel = (id: number) => setSchedules(prev => prev.map(s => s.schedule_id === id ? { ...s, is_active: false } : s))

  return (
    <AppLayout>
      <Header title="Scheduled Transactions" />
      <div className="p-6 space-y-5 animate-fade-in">

        {/* Info banner */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[#4090f0]/8 border border-[#4090f0]/20">
          <Clock size={16} className="text-[#4090f0]" />
          <p className="text-[13px] text-[#8890a0]">
            Scheduled transactions run automatically on their next execution date.
            <span className="text-white ml-1">Active: {schedules.filter(s => s.is_active).length}</span> ·
            <span className="text-[#8890a0] ml-1">Inactive: {schedules.filter(s => !s.is_active).length}</span>
          </p>
          <button className="btn-primary flex items-center gap-2 text-sm ml-auto" onClick={() => setShowAdd(true)}>
            <Plus size={14} /> New Schedule
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {schedules.map(s => (
            <div key={s.schedule_id} className={`card p-5 card-hover ${!s.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar size={14} className="text-[#4090f0]" />
                    <span className="font-display font-700 text-[15px] text-white">{formatCurrency(s.amount)}</span>
                    <Badge variant={s.frequency === 'daily' ? 'red' : s.frequency === 'weekly' ? 'yellow' : 'blue'}>
                      {s.frequency}
                    </Badge>
                  </div>
                  <p className="text-[12px] text-[#8890a0]">
                    From <span className="text-white font-mono">{s.account_no.slice(-8)}</span> →{' '}
                    <span className="text-white font-mono">{s.recipient_no.slice(-8)}</span>
                  </p>
                </div>
                {s.is_active ? <Badge variant="green">Active</Badge> : <Badge variant="gray">Inactive</Badge>}
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#1a1d24] rounded-lg p-3">
                  <p className="text-[11px] text-[#8890a0] font-display font-600 uppercase tracking-widest mb-1">Start Date</p>
                  <p className="text-[13px] text-white">{s.start_date}</p>
                </div>
                <div className="bg-[#1a1d24] rounded-lg p-3">
                  <p className="text-[11px] text-[#8890a0] font-display font-600 uppercase tracking-widest mb-1">Next Run</p>
                  <p className="text-[13px] text-[#00d4aa] font-700">{s.next_execution}</p>
                </div>
              </div>
              {s.end_date && (
                <p className="text-[12px] text-[#8890a0] mb-3">Ends: {s.end_date}</p>
              )}
              <div className="flex gap-2">
                <button className="flex items-center gap-1 text-[12px] font-display font-600 px-3 py-1.5 rounded-lg bg-[#00d4aa]/10 text-[#00d4aa] hover:bg-[#00d4aa]/20 transition-colors">
                  <Play size={12} /> Execute Now
                </button>
                {s.is_active && (
                  <button onClick={() => cancel(s.schedule_id)} className="flex items-center gap-1 text-[12px] font-display font-600 px-3 py-1.5 rounded-lg bg-[#f05050]/10 text-[#f05050] hover:bg-[#f05050]/20 transition-colors ml-auto">
                    <Trash2 size={12} /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Schedule Modal */}
        <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Create Scheduled Transaction">
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">From Account</label>
              <select className="input text-sm">
                {mockAccounts.filter(a => a.status === 'active').map(a => (
                  <option key={a.account_id}>{a.account_no} — {a.bank_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">To Account</label>
              <select className="input text-sm">
                {mockAccounts.filter(a => a.status === 'active').map(a => (
                  <option key={a.account_id}>{a.account_no} — {a.bank_name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Amount (₹)</label>
                <input className="input text-sm" type="number" placeholder="Amount" />
              </div>
              <div>
                <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Frequency</label>
                <select className="input text-sm">
                  <option>daily</option>
                  <option>weekly</option>
                  <option>monthly</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Start Date</label>
                <input className="input text-sm" type="date" />
              </div>
              <div>
                <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">End Date (optional)</label>
                <input className="input text-sm" type="date" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button className="btn-primary flex-1 text-sm">Create Schedule</button>
              <button className="btn-ghost flex-1 text-sm" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </Modal>

      </div>
    </AppLayout>
  )
}
