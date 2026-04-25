'use client'
import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { formatCurrency, maskAccountNo } from '@/lib/mockData'
import { Plus, Filter } from 'lucide-react'

function statusBadge(s: string) {
  if (s === 'active') return <Badge variant="green">Active</Badge>
  if (s === 'frozen') return <Badge variant="blue">Frozen</Badge>
  return <Badge variant="red">Closed</Badge>
}

function bankBadge(b: string) {
  if (b === 'Checking') return <Badge variant="green">Checking</Badge>
  if (b === 'Savings') return <Badge variant="blue">Savings</Badge>
  return <Badge variant="yellow">{b}</Badge>
}

export default function AccountsPage() {
  const [bank, setBank] = useState('All')
  const [status, setStatus] = useState('All')
  const [filter, setFilter] = useState('All')
  const [showAdd, setShowAdd] = useState(false)
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  useEffect(() => {
    fetch('/api/accounts', { cache: 'no-store' }).then(r => r.json()).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [user?.id])

  if (loading) return <div className="p-6 text-white">Loading...</div>

  const mappedAccounts = data.map(a => ({
    ...a,
    customer_name: `${a.first_name} ${a.last_name}`,
    bank_name: a.type === 'checking' ? 'Checking' : 'Savings',
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
            <option>All</option>
            <option>Checking</option>
            <option>Savings</option>
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
        <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Open New Account">
          <div className="space-y-4">
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Customer</label>
              <select className="input text-sm">
                <option>Select customer…</option>
                {mappedAccounts.map(a => <option key={a.id}>{a.customer_name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Bank</label>
                <select className="input text-sm">
                  <option>Checking</option>
                  <option>Savings</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Account Type</label>
                <select className="input text-sm">
                  <option>Savings</option>
                  <option>Current</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Initial Deposit (₹)</label>
              <input className="input text-sm" type="number" placeholder="Minimum ₹1,000" />
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Branch</label>
              <select className="input text-sm">
                <option>Main Branch</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button className="btn-primary flex-1 text-sm">Create Account</button>
              <button className="btn-ghost flex-1 text-sm" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </Modal>

      </div>
  )
}

