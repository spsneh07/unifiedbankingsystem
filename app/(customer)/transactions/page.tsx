'use client'
import { useState, useEffect } from 'react'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/mockData'
import { Plus, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

type TxType = 'deposit' | 'withdraw' | 'transfer'

function txBadge(type: string) {
  const t = type?.toLowerCase()
  if (t === 'deposit') return <Badge variant="green">Deposit</Badge>
  if (t === 'withdrawal' || t === 'withdraw') return <Badge variant="red">Withdraw</Badge>
  return <Badge variant="blue">Transfer</Badge>
}

export default function TransactionsPage() {
  const router = useRouter()
  const [modal, setModal] = useState<TxType | null>(null)
  const [typeFilter, setTypeFilter] = useState('All')
  const [catFilter, setCatFilter] = useState('All')
  const [data, setData] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Form states
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [fromAccount, setFromAccount] = useState('')
  const [toAccount, setToAccount] = useState('')
  const [category, setCategory] = useState('Other')
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  
  const fetchData = () => {
    if (!user?.customer_id) return;
    Promise.all([
      fetch(`/api/transactions?customerId=${user.customer_id}`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`/api/accounts?customerId=${user.customer_id}`, { cache: 'no-store' }).then(r => r.json())
    ]).then(([txData, accData]) => {
      setData(txData)
      setAccounts(accData)
      if (accData.length > 0) {
        setFromAccount(accData[0].id)
        setToAccount(accData[0].id)
      }
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchData()
  }, [user?.customer_id])

  if (loading) return <div className="p-6 text-white">Loading...</div>

  const mappedTransactions = data.map(t => ({
    ...t,
    transaction_id: t.id,
    account_no: t.account_number,
    amount: parseFloat(t.amount),
    transaction_date: t.created_at,
    is_suspicious: parseFloat(t.amount) > 50000,
    category: t.category || 'Other'
  }))

  let txs = mappedTransactions
  if (typeFilter !== 'All') txs = txs.filter(t => t.type === typeFilter)
  if (catFilter !== 'All') txs = txs.filter(t => t.category === catFilter)

  const handleSubmit = async () => {
    setError('');
    setActionLoading(true);
    
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: modal,
          amount: parseFloat(amount),
          account_id: fromAccount,
          receiver_account_id: modal === 'transfer' ? toAccount : undefined,
          description,
          category
        })
      });
      const result = await res.json();
      
      if (result.success) {
        setModal(null);
        setAmount('');
        setDescription('');
        fetchData(); // Refresh data
        router.refresh();
      } else {
        setError(result.error || 'Transaction failed');
      }
    } catch (e: any) {
      setError(e.message || 'Transaction failed');
    }
    setActionLoading(false);
  }

  return (
    <div className="p-6 space-y-5 animate-fade-in">

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary flex items-center gap-2 text-sm" onClick={() => { setModal('deposit'); setCategory('Other'); setError(''); }}>
            <Plus size={15} /> Deposit
          </button>
          <button className="flex items-center gap-2 text-sm px-5 py-2 rounded-lg font-display font-600 transition-all" style={{ background: 'rgba(240,80,80,0.12)', color: '#f05050', border: '1px solid rgba(240,80,80,0.2)' }} onClick={() => { setModal('withdraw'); setCategory('Bills'); setError(''); }}>
            Withdraw
          </button>
          <button className="flex items-center gap-2 text-sm px-5 py-2 rounded-lg font-display font-600 transition-all" style={{ background: 'rgba(64,144,240,0.12)', color: '#4090f0', border: '1px solid rgba(64,144,240,0.2)' }} onClick={() => { setModal('transfer'); setCategory('Other'); setError(''); }}>
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
                  {['ID', 'Account', 'Description', 'Type', 'Amount', 'Category', 'Date', 'Flag'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-display font-600 uppercase tracking-widest text-[#8890a0]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txs.map(tx => (
                  <tr key={tx.transaction_id} className={`table-row ${tx.is_suspicious ? 'bg-red-950/10' : ''}`}>
                    <td className="px-5 py-3 font-mono text-[12px] text-[#8890a0]">#{tx.transaction_id}</td>
                    <td className="px-5 py-3 font-mono text-[12px] text-[#8890a0]">{tx.account_no?.slice(-8) || '-'}</td>
                    <td className="px-5 py-3 text-white">{tx.description}</td>
                    <td className="px-5 py-3">{txBadge(tx.type)}</td>
                    <td className="px-5 py-3">
                      <span className={`font-display font-700 ${tx.type?.toLowerCase() === 'deposit' ? 'text-[#00d4aa]' : 'text-[#f05050]'}`}>
                        {tx.type?.toLowerCase() === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="px-5 py-3"><Badge variant="gray">{tx.category}</Badge></td>
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
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Account</label>
              <select className="input text-sm" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
                {accounts.filter(a => a.status?.toLowerCase() === 'active').map(a => (
                  <option key={a.id} value={a.id}>{a.account_number} ({formatCurrency(a.balance)})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Amount (₹)</label>
              <input className="input text-sm" type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Description</label>
              <input className="input text-sm" placeholder="e.g. Salary credit" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Category</label>
              <select className="input text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                {['Other', 'Salary', 'Deposit'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button className="btn-primary flex-1 text-sm flex justify-center items-center" onClick={handleSubmit} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Confirm Deposit'}
              </button>
              <button className="btn-ghost flex-1 text-sm" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </Modal>

        {/* Withdraw Modal */}
        <Modal open={modal === 'withdraw'} onClose={() => setModal(null)} title="Withdraw Funds">
          <div className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Account</label>
              <select className="input text-sm" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
                {accounts.filter(a => a.status?.toLowerCase() === 'active').map(a => (
                  <option key={a.id} value={a.id}>{a.account_number} ({formatCurrency(a.balance)})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Amount (₹)</label>
              <input className="input text-sm" type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Description</label>
              <input className="input text-sm" placeholder="e.g. ATM withdrawal" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Category</label>
              <select className="input text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                {['Bills', 'Food', 'Shopping', 'Travel', 'Entertainment', 'Healthcare', 'Other', 'Withdraw'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="p-3 rounded-lg bg-[#f05050]/10 border border-[#f05050]/20 text-[12px] text-[#f05050]">
              ⚠ Withdrawal over ₹50,000 will trigger a high transaction alert.
            </div>
            <div className="flex gap-3 pt-2">
              <button className="flex-1 text-sm px-5 py-2 rounded-lg font-display font-600 flex justify-center items-center disabled:opacity-50" style={{ background: 'rgba(240,80,80,0.15)', color: '#f05050', border: '1px solid rgba(240,80,80,0.3)' }} onClick={handleSubmit} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Confirm Withdrawal'}
              </button>
              <button className="btn-ghost flex-1 text-sm" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </Modal>

        {/* Transfer Modal */}
        <Modal open={modal === 'transfer'} onClose={() => setModal(null)} title="Transfer Funds">
          <div className="space-y-4">
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">From Account</label>
              <select className="input text-sm" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
                {accounts.filter(a => a.status?.toLowerCase() === 'active').map(a => (
                  <option key={a.id} value={a.id}>{a.account_number} ({formatCurrency(a.balance)})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">To Account (Account ID)</label>
              <input className="input text-sm" type="number" placeholder="Enter recipient Account ID" value={toAccount} onChange={(e) => setToAccount(e.target.value)} />
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Amount (₹)</label>
              <input className="input text-sm" type="number" placeholder="Enter transfer amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Description</label>
              <input className="input text-sm" placeholder="e.g. Rent payment" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-1">Category</label>
              <select className="input text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
                {['Transfer', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button className="flex-1 text-sm px-5 py-2 rounded-lg font-display font-600 bg-[#4090f0]/15 text-[#4090f0] border border-[#4090f0]/30 flex justify-center items-center disabled:opacity-50" onClick={handleSubmit} disabled={actionLoading}>
                {actionLoading ? 'Processing...' : 'Confirm Transfer'}
              </button>
              <button className="btn-ghost flex-1 text-sm" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </Modal>

      </div>
    
  )
}
