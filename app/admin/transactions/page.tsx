'use client'
import { useSession } from '@/components/SessionProvider'
import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils'
import { Plus, AlertTriangle } from 'lucide-react'

type TxType = 'deposit' | 'withdraw' | 'transfer'

function txBadge(type: string) {
  const t = type?.toLowerCase()
  if (t === 'deposit') return <Badge variant="green">Deposit</Badge>
  if (t === 'withdrawal' || t === 'withdraw') return <Badge variant="red">Withdraw</Badge>
  return <Badge variant="blue">Transfer</Badge>
}

export default function TransactionsPage() {
  const [modal, setModal] = useState<TxType | null>(null)
  const [typeFilter, setTypeFilter] = useState('All')
  const [catFilter, setCatFilter] = useState('All')
  const [data, setData] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [txForm, setTxForm] = useState({ account_id: '', receiver_account_id: '', amount: '', description: '', category: 'Other', otp: '123456' })

  const refreshData = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/transactions', { cache: 'no-store', credentials: 'include' }).then(r => r.json()),
      fetch('/api/accounts', { cache: 'no-store', credentials: 'include' }).then(r => r.json()),
    ]).then(([txData, accData]) => {
      setData(Array.isArray(txData) ? txData : [])
      setAccounts((Array.isArray(accData) ? accData : []).map((a: any) => ({
        ...a,
        account_id: a.id,
        account_no: a.account_number,
        bank_name: a.bank_name || 'NexusBank',
        balance: parseFloat(a.balance),
      })))
      setLoading(false)
    })
  }

  const { user } = useSession()
  useEffect(() => {
    refreshData()
  }, [user?.id])

  const handleSubmit = async (type: string) => {
    if (!txForm.account_id || !txForm.amount) {
      alert('Please fill all required fields')
      return
    }

    const res = await fetch('/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...txForm, type })
    }).then(r => r.json())

    if (res.success) {
      setModal(null)
      setTxForm({ account_id: '', receiver_account_id: '', amount: '', description: '', category: 'Other', otp: '123456' })
      refreshData()
    } else {
      alert(res.error || 'Transaction failed')
    }
  }

  if (loading) return <div className="p-6 text-white">Loading...</div>

  const mappedTransactions = data.map(t => ({
    ...t,
    transaction_id: t.id,
    account_no: t.account_number,
    amount: parseFloat(t.amount),
    transaction_date: t.created_at,
    is_suspicious: !!t.is_suspicious,
    category: t.category || 'Other'
  }))

  let txs = mappedTransactions
  if (typeFilter !== 'All') txs = txs.filter(t => t.type === typeFilter)
  if (catFilter !== 'All') txs = txs.filter(t => t.category === catFilter)

  return (
    <div className="p-6 space-y-5 animate-fade-in">

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => setModal('deposit')}>
          <Plus size={15} /> Deposit
        </button>
        <button className="flex items-center gap-2 text-sm px-5 py-2 rounded-lg font-display font-600 transition-all" style={{ background: 'rgba(240,80,80,0.12)', color: '#f05050', border: '1px solid rgba(240,80,80,0.2)' }} onClick={() => setModal('withdraw')}>
          Withdraw
        </button>
        <button className="flex items-center gap-2 text-sm px-5 py-2 rounded-lg font-display font-600 transition-all" style={{ background: 'rgba(64,144,240,0.12)', color: '#4090f0', border: '1px solid rgba(64,144,240,0.2)' }} onClick={() => setModal('transfer')}>
          Transfer
        </button>
        <div className="ml-auto flex gap-2">
          <select className="input text-sm w-auto" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
            <option value="transfer">Transfer</option>
          </select>
          <select className="input text-sm w-auto" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Other'].map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1a1d24]">
                {['ID', 'Account', 'Description', 'Type', 'Amount', 'Category', 'Status', 'Date', 'Flag'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-display font-600 uppercase tracking-widest text-[#8890a0]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txs.map(tx => (
                <tr key={tx.transaction_id} className={`table-row ${tx.is_suspicious ? 'bg-red-950/10' : ''}`}>
                  <td className="px-5 py-3 font-mono text-[12px] text-[#8890a0]">#{tx.transaction_id}</td>
                  <td className="px-5 py-3 font-mono text-[12px] text-[#8890a0]">{String(tx.account_no || '').slice(-8)}</td>
                  <td className="px-5 py-3 text-white">{tx.description}</td>
                  <td className="px-5 py-3">{txBadge(tx.type)}</td>
                  <td className="px-5 py-3">
                    <span className={`font-display font-700 ${tx.type?.toLowerCase() === 'deposit' ? 'text-[#00d4aa]' : 'text-[#f05050]'}`}>
                      {tx.type?.toLowerCase() === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </td>
                  <td className="px-5 py-3"><Badge variant="gray">{tx.category}</Badge></td>
                  <td className="px-5 py-3">
                    <Badge variant={tx.status === 'SUCCESS' ? 'green' : (tx.status === 'FAILED' ? 'red' : 'yellow')}>{tx.status || 'SUCCESS'}</Badge>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-[#8890a0]">{new Date(tx.transaction_date).toLocaleDateString('en-IN')}</td>
                  <td className="px-5 py-3">
                    {tx.is_suspicious && (
                      <span className="flex items-center gap-1 text-[#f05050] text-[12px]">
                        <AlertTriangle size={13} /> Suspicious
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-[#1a1d24] text-[12px] text-[#8890a0]">
          Showing {txs.length} transactions
        </div>
      </div>

      {/* Deposit Modal */}
      <Modal open={modal === 'deposit'} onClose={() => setModal(null)} title="Deposit Funds">
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Account</label>
            <select 
              className="input text-sm" 
              value={txForm.account_id}
              onChange={e => setTxForm({ ...txForm, account_id: e.target.value })}
            >
              <option value="">Select account…</option>
              {accounts.filter(a => a.status === 'active').map(a => (
                <option key={a.account_id} value={a.account_id}>{a.account_no} — {a.bank_name} ({formatCurrency(a.balance)})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Amount (₹)</label>
            <input 
              className="input text-sm" 
              type="number" 
              placeholder="Enter amount" 
              value={txForm.amount}
              onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Description</label>
            <input 
              className="input text-sm" 
              placeholder="e.g. Salary credit" 
              value={txForm.description}
              onChange={e => setTxForm({ ...txForm, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Category</label>
            <select 
              className="input text-sm"
              value={txForm.category}
              onChange={e => setTxForm({ ...txForm, category: e.target.value })}
            >
              {['Other', 'Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Healthcare'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button className="btn-primary flex-1 text-sm" onClick={() => handleSubmit('deposit')}>Confirm Deposit</button>
            <button className="btn-ghost flex-1 text-sm" onClick={() => setModal(null)}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal open={modal === 'withdraw'} onClose={() => setModal(null)} title="Withdraw Funds">
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Account</label>
            <select 
              className="input text-sm"
              value={txForm.account_id}
              onChange={e => setTxForm({ ...txForm, account_id: e.target.value })}
            >
              <option value="">Select account…</option>
              {accounts.filter(a => a.status === 'active').map(a => (
                <option key={a.account_id} value={a.account_id}>{a.account_no} — {a.bank_name} ({formatCurrency(a.balance)})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Amount (₹)</label>
            <input 
              className="input text-sm" 
              type="number" 
              placeholder="Enter amount" 
              value={txForm.amount}
              onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Description</label>
            <input 
              className="input text-sm" 
              placeholder="e.g. ATM withdrawal" 
              value={txForm.description}
              onChange={e => setTxForm({ ...txForm, description: e.target.value })}
            />
          </div>
          <div className="p-3 rounded-lg bg-[#f05050]/10 border border-[#f05050]/20 text-[12px] text-[#f05050]">
            ⚠ Withdrawal over ₹50,000 will trigger a high transaction alert.
          </div>
          <div className="flex gap-3 pt-2">
            <button className="flex-1 text-sm px-5 py-2 rounded-lg font-display font-600" style={{ background: 'rgba(240,80,80,0.15)', color: '#f05050', border: '1px solid rgba(240,80,80,0.3)' }} onClick={() => handleSubmit('withdraw')}>Confirm Withdrawal</button>
            <button className="btn-ghost flex-1 text-sm" onClick={() => setModal(null)}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Transfer Modal */}
      <Modal open={modal === 'transfer'} onClose={() => setModal(null)} title="Transfer Funds">
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">From Account</label>
            <select 
              className="input text-sm"
              value={txForm.account_id}
              onChange={e => setTxForm({ ...txForm, account_id: e.target.value })}
            >
              <option value="">Select from account…</option>
              {accounts.filter(a => a.status === 'active').map(a => (
                <option key={a.account_id} value={a.account_id}>{a.account_no} — {a.bank_name} ({formatCurrency(a.balance)})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">To Account</label>
            <select 
              className="input text-sm"
              value={txForm.receiver_account_id}
              onChange={e => setTxForm({ ...txForm, receiver_account_id: e.target.value })}
            >
              <option value="">Select receiver account…</option>
              {accounts.filter(a => a.status === 'active').map(a => (
                <option key={a.account_id} value={a.account_id}>{a.account_no} — {a.bank_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Amount (₹)</label>
            <input 
              className="input text-sm" 
              type="number" 
              placeholder="Enter transfer amount" 
              value={txForm.amount}
              onChange={e => setTxForm({ ...txForm, amount: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Description</label>
            <input 
              className="input text-sm" 
              placeholder="e.g. Rent payment" 
              value={txForm.description}
              onChange={e => setTxForm({ ...txForm, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button className="flex-1 text-sm px-5 py-2 rounded-lg font-display font-600 bg-[#4090f0]/15 text-[#4090f0] border border-[#4090f0]/30" onClick={() => handleSubmit('transfer')}>Confirm Transfer</button>
            <button className="btn-ghost flex-1 text-sm" onClick={() => setModal(null)}>Cancel</button>
          </div>
        </div>
      </Modal>

    </div>

  )
}




