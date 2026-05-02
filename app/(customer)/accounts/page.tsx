'use client'
import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { formatCurrency, maskAccountNo } from '@/lib/utils'
import { Plus, Filter } from 'lucide-react'

function statusBadge(s: string) {
  if (s === 'active') return <Badge variant="green">Active</Badge>
  if (s === 'frozen') return <Badge variant="blue">Frozen</Badge>
  return <Badge variant="red">Closed</Badge>
}

const BANKS = ['SBI','HDFC','ICICI','Axis','Kotak','Yes Bank','IndusInd','IDFC First','Canara Bank','Punjab National Bank'];

function bankBadge(b: string) {
  const colors: Record<string, any> = {
    'SBI': 'blue',
    'HDFC': 'yellow',
    'ICICI': 'orange',
    'Axis': 'red',
    'Kotak': 'red',
    'Yes Bank': 'blue',
    'IndusInd': 'orange',
    'IDFC First': 'red',
  };
  return <Badge variant={colors[b] || 'blue'}>{b}</Badge>
}

export default function AccountsPage() {
  const [bank, setBank] = useState('All')
  const [status, setStatus] = useState('All')
  const [filter, setFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ bank_name: 'SBI', account_type: 'Savings', initial_deposit: '', branch_id: '1' })
  const [formError, setFormError] = useState('')

  const refreshData = () => {
    setLoading(true)
    fetch('/api/accounts', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        setData(Array.isArray(d) ? d : [])
        setLoading(false)
      })
  }

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  useEffect(() => {
    refreshData()
  }, [user?.id])

  const handleSubmit = async () => {
    setFormError('')
    if (!formData.bank_name || !formData.account_type || !formData.initial_deposit) {
      setFormError('Please fill all required fields')
      return
    }

    const res = await fetch('/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, customer_id: user?.customer_id })
    }).then(r => r.json())

    if (res.success) {
      setShowAdd(false)
      setFormData({ bank_name: 'SBI', account_type: 'Savings', initial_deposit: '', branch_id: '1' })
      refreshData()
    } else {
      setFormError(res.error || 'Failed to create account')
    }
  }

  if (loading) return <div className="p-6 text-white">Loading...</div>

  const mappedAccounts = data.map(a => ({
    ...a,
    customer_name: a.customer_name || 'N/A',
    bank_name: a.bank_name || 'NexusBank',
    account_no: a.account_number,
    balance: parseFloat(a.balance),
    account_type: a.type
  }))

  const avgBalance = mappedAccounts.length ? mappedAccounts.reduce((s, a) => s + a.balance, 0) / mappedAccounts.length : 0

  let accounts = mappedAccounts
  if (bank !== 'All') accounts = accounts.filter(a => a.bank_name === bank)
  if (status !== 'All') accounts = accounts.filter(a => a.status === status)
  if (filter === 'above50k') accounts = accounts.filter(a => a.balance > 50000)
  if (filter === 'aboveAvg') accounts = accounts.filter(a => a.balance > avgBalance)

  return (
    <div className="p-6 space-y-5 animate-fade-in">

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Accounts', value: mappedAccounts.length, color: '#00d4aa' },
          { label: 'Active', value: mappedAccounts.filter(a => a.status === 'active').length, color: '#00d4aa' },
          { label: 'Frozen', value: mappedAccounts.filter(a => a.status === 'frozen').length, color: '#4090f0' },
          { label: 'Avg Balance', value: formatCurrency(avgBalance), color: '#f0c040' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-[11px] font-display font-600 uppercase tracking-widest text-[#8890a0] mb-1">{s.label}</p>
            <p className="font-display font-700 text-[20px]" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Add */}
      <div className="flex flex-wrap gap-3 items-center">
        <select className="input text-sm w-auto" value={bank} onChange={e => setBank(e.target.value)}>
          <option value="All">All Banks</option>
          {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className="input text-sm w-auto" value={status} onChange={e => setStatus(e.target.value)}>
          <option>All</option>
          <option value="active">Active</option>
          <option value="frozen">Frozen</option>
          <option value="closed">Closed</option>
        </select>
        <select className="input text-sm w-auto" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="All">All Balances</option>
          <option value="above50k">Balance &gt; ₹50,000</option>
          <option value="aboveAvg">Above Average ({formatCurrency(avgBalance)})</option>
        </select>
        <button className="btn-primary flex items-center gap-2 text-sm ml-auto" onClick={() => setShowAdd(true)}>
          <Plus size={15} /> New Account
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1d24]">
                {['Account No', 'Customer', 'Type', 'Account Type', 'Balance', 'Status', 'Created'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-display font-600 uppercase tracking-widest text-[#8890a0]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map(a => (
                <tr key={a.id} className="table-row">
                  <td className="px-5 py-3 font-mono text-[12px] text-[#8890a0]">{maskAccountNo(a.account_no)}</td>
                  <td className="px-5 py-3 text-white font-display font-600">{a.customer_name}</td>
                  <td className="px-5 py-3">{bankBadge(a.bank_name)}</td>
                  <td className="px-5 py-3 text-[#8890a0]">{a.account_type}</td>
                  <td className="px-5 py-3">
                    <span className={`font-display font-700 ${a.balance > avgBalance ? 'text-[#00d4aa]' : a.balance < 5000 ? 'text-[#f05050]' : 'text-white'}`}>
                      {formatCurrency(a.balance)}
                    </span>
                  </td>
                  <td className="px-5 py-3">{statusBadge(a.status)}</td>
                  <td className="px-5 py-3 text-[12px] text-[#8890a0]">{new Date(a.created_at).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#1a1d24] text-[12px] text-[#8890a0]">
          Showing {accounts.length} of {mappedAccounts.length} accounts
        </div>
      </div>

      {/* Add Account Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setFormError(''); }} title="Open New Account">
        <div className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-[#f05050]/10 border border-[#f05050]/20 text-[12px] text-[#f05050]">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Bank</label>
              <select 
                className="input text-sm"
                value={formData.bank_name}
                onChange={e => setFormData({ ...formData, bank_name: e.target.value })}
              >
                {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Account Type</label>
              <select 
                className="input text-sm"
                value={formData.account_type}
                onChange={e => setFormData({ ...formData, account_type: e.target.value })}
              >
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Initial Deposit (₹)</label>
            <input 
              className="input text-sm" 
              type="number" 
              placeholder="Minimum ₹1,000" 
              value={formData.initial_deposit}
              onChange={e => setFormData({ ...formData, initial_deposit: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-primary flex-1 text-sm" onClick={handleSubmit}>Create Account</button>
            <button className="btn-ghost flex-1 text-sm" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      </Modal>

    </div>
  )
}

