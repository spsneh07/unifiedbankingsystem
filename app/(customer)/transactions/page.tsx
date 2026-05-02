'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/mockData'
import { Plus, AlertTriangle, ArrowUpRight, ArrowDownLeft, ArrowRightLeft, Search, Filter, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type TxType = 'deposit' | 'withdraw' | 'transfer'

function txBadge(type: string) {
  const t = type?.toLowerCase()
  if (t === 'deposit') return <Badge variant="green">Deposit</Badge>
  if (t === 'withdrawal' || t === 'withdraw') return <Badge variant="red">Withdraw</Badge>
  return <Badge variant="blue">Transfer</Badge>
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 }
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
  const [otp, setOtp] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  
  const fetchData = () => {
    if (!user?.customer_id) return;
    Promise.all([
      fetch(`/api/transactions?customerId=${user.customer_id}`, { cache: 'no-store' }).then(r => r.json()),
      fetch(`/api/accounts?customerId=${user.customer_id}`, { cache: 'no-store' }).then(r => r.json())
    ]).then(([txData, accData]) => {
      setData(Array.isArray(txData) ? txData : [])
      setAccounts(Array.isArray(accData) ? accData : [])
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-[#00d4aa]" />
      </div>
    )
  }

  const mappedTransactions = data.map(t => ({
    ...t,
    transaction_id: t.id,
    account_no: t.account_number,
    amount: parseFloat(t.amount),
    transaction_date: t.created_at,
    is_suspicious: parseFloat(t.amount) > 50000 || t.is_suspicious,
    category: t.category || 'Other',
    status: t.status || 'SUCCESS'
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
          category,
          otp: (modal === 'withdraw' || modal === 'transfer') ? otp : undefined
        })
      });
      const result = await res.json();
      
      if (result.success) {
        setModal(null);
        setAmount('');
        setDescription('');
        setOtp('');
        fetchData();
        router.refresh();
      } else {
        setError(result.error || 'Transaction failed');
      }
    } catch (e: any) {
      setError(e.message || 'Transaction failed');
    }
    setActionLoading(false);
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'PENDING': return <Badge variant="yellow">Pending</Badge>
      case 'SUCCESS': return <Badge variant="green">Success</Badge>
      case 'FAILED': return <Badge variant="red">Failed</Badge>
      default: return <Badge variant="gray">{status}</Badge>
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary flex items-center gap-2 text-[13px] px-6" 
            onClick={() => { setModal('deposit'); setCategory('Other'); setError(''); setOtp(''); }}
          >
            <ArrowDownLeft size={16} /> Deposit
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 text-[13px] px-6 py-2.5 rounded-lg font-display font-700 transition-all bg-[#f05050]/10 text-[#f05050] border border-[#f05050]/20 hover:bg-[#f05050]/20" 
            onClick={() => { setModal('withdraw'); setCategory('Bills'); setError(''); setOtp(''); }}
          >
            <ArrowUpRight size={16} /> Withdraw
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 text-[13px] px-6 py-2.5 rounded-lg font-display font-700 transition-all bg-[#4090f0]/10 text-[#4090f0] border border-[#4090f0]/20 hover:bg-[#4090f0]/20" 
            onClick={() => { setModal('transfer'); setCategory('Other'); setError(''); setOtp(''); }}
          >
            <ArrowRightLeft size={16} /> Transfer
          </motion.button>
        </div>

        <div className="flex gap-2 bg-[#111318]/50 p-1 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 px-3">
            <Filter size={14} className="text-[#8890a0]" />
          </div>
          <select className="bg-transparent text-[13px] text-white border-none focus:ring-0 cursor-pointer py-1" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="All">All Types</option>
            <option value="deposit">Deposit</option>
            <option value="withdraw">Withdraw</option>
            <option value="transfer">Transfer</option>
          </select>
          <div className="w-px h-4 bg-white/10 self-center mx-1" />
          <select className="bg-transparent text-[13px] text-white border-none focus:ring-0 cursor-pointer py-1" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
            <option value="All">All Categories</option>
            {['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Other'].map(c => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-hidden bg-[#111318]/50 backdrop-blur-sm border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Description', 'Type', 'Amount', 'Category', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[11px] font-display font-700 uppercase tracking-widest text-[#8890a0]">{h}</th>
                ))}
              </tr>
            </thead>
            <motion.tbody 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence mode="popLayout">
                {txs.map((tx) => (
                  <motion.tr 
                    key={tx.transaction_id} 
                    variants={rowVariants}
                    layout
                    className={`table-row group hover:bg-white/[0.02] transition-colors ${tx.is_suspicious ? 'bg-[#f05050]/5' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-semibold text-white tracking-tight">{tx.description}</span>
                        <span className="text-[11px] text-[#8890a0] font-mono mt-0.5 uppercase">#{String(tx.transaction_id || '').slice(-8)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{txBadge(tx.type)}</td>
                    <td className="px-6 py-4">
                      <span className={`font-display font-800 text-[15px] ${tx.type?.toLowerCase() === 'deposit' ? 'text-[#00d4aa]' : 'text-[#f05050]'}`}>
                        {tx.type?.toLowerCase() === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4"><Badge variant="gray">{tx.category}</Badge></td>
                    <td className="px-6 py-4">{getStatusBadge(tx.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[13px] text-[#e8eaf0]">{new Date(tx.transaction_date).toLocaleDateString('en-IN')}</span>
                        {tx.is_suspicious && (
                          <span className="flex items-center gap-1 text-[#f05050] text-[10px] font-bold uppercase mt-1">
                            <AlertTriangle size={12} /> Suspicious
                          </span>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </motion.tbody>
          </table>
        </div>
        {txs.length === 0 && (
          <div className="py-20 text-center">
            <Search size={40} className="mx-auto text-white/10 mb-4" />
            <p className="text-[#8890a0] text-[15px]">No transactions found matching your filters.</p>
          </div>
        )}
        <div className="px-6 py-4 border-t border-white/5 text-[11px] font-bold text-[#8890a0] uppercase tracking-wider bg-white/[0.02]">
          Total Records: {txs.length}
        </div>
      </div>

      {/* Modals are already animated via Modal component */}
      <Modal open={modal === 'deposit'} onClose={() => setModal(null)} title="Deposit Funds">
        <div className="space-y-5">
          {error && <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-[12px] text-danger">{error}</div>}
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Account</label>
            <select className="input focus:border-[#00d4aa]/50 transition-all" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
              {accounts.filter(a => a.status?.toLowerCase() === 'active').map(a => (
                <option key={a.id} value={a.id}>{a.account_number} ({formatCurrency(a.balance)})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Amount (₹)</label>
            <input className="input focus:border-[#00d4aa]/50 transition-all" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Description</label>
            <input className="input focus:border-[#00d4aa]/50 transition-all" placeholder="e.g. Monthly Savings" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Category</label>
            <select className="input focus:border-[#00d4aa]/50 transition-all" value={category} onChange={(e) => setCategory(e.target.value)}>
              {['Other', 'Salary', 'Deposit'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn-primary flex-1 py-3 flex justify-center items-center gap-2" onClick={handleSubmit} disabled={actionLoading}>
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={18} />}
              {actionLoading ? 'Processing...' : 'Confirm Deposit'}
            </motion.button>
            <button className="btn-ghost flex-1 py-3" onClick={() => setModal(null)} disabled={actionLoading}>Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal open={modal === 'withdraw'} onClose={() => setModal(null)} title="Withdraw Funds">
        <div className="space-y-5">
          {error && <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-[12px] text-danger">{error}</div>}
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Account</label>
            <select className="input focus:border-[#f05050]/50 transition-all" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
              {accounts.filter(a => a.status?.toLowerCase() === 'active').map(a => (
                <option key={a.id} value={a.id}>{a.account_number} ({formatCurrency(a.balance)})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Amount (₹)</label>
            <input className="input focus:border-[#f05050]/50 transition-all" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Description</label>
            <input className="input focus:border-[#f05050]/50 transition-all" placeholder="e.g. ATM Withdrawal" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">OTP Verification</label>
            <input className="input focus:border-[#f05050]/50 transition-all" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
          </div>
          <div className="p-4 rounded-xl bg-[#f05050]/5 border border-[#f05050]/10 flex gap-3">
            <AlertTriangle size={18} className="text-[#f05050] shrink-0" />
            <p className="text-[12px] text-[#f05050]/80 leading-relaxed font-medium">
              Multi-factor authentication is required for all withdrawals to ensure the security of your funds.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              className="flex-1 py-3 rounded-lg font-display font-700 bg-[#f05050] text-white flex justify-center items-center gap-2 shadow-lg shadow-[#f05050]/20" 
              onClick={handleSubmit} 
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight size={18} />}
              {actionLoading ? 'Verifying...' : 'Confirm Withdrawal'}
            </motion.button>
            <button className="btn-ghost flex-1 py-3" onClick={() => setModal(null)} disabled={actionLoading}>Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal open={modal === 'transfer'} onClose={() => setModal(null)} title="Transfer Funds">
        <div className="space-y-5">
          {error && <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-[12px] text-danger">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">From Account</label>
              <select className="input focus:border-[#4090f0]/50 transition-all" value={fromAccount} onChange={(e) => setFromAccount(e.target.value)}>
                {accounts.filter(a => a.status?.toLowerCase() === 'active').map(a => (
                  <option key={a.id} value={a.id}>{a.account_number} ({formatCurrency(a.balance)})</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Recipient Account ID</label>
              <input className="input focus:border-[#4090f0]/50 transition-all" type="number" placeholder="Target Account ID" value={toAccount} onChange={(e) => setToAccount(e.target.value)} />
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Amount (₹)</label>
              <input className="input focus:border-[#4090f0]/50 transition-all" type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">OTP</label>
              <input className="input focus:border-[#4090f0]/50 transition-all" placeholder="6-digit" value={otp} onChange={(e) => setOtp(e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="block text-[12px] font-display font-600 text-[#8890a0] mb-2 uppercase tracking-wider">Description</label>
              <input className="input focus:border-[#4090f0]/50 transition-all" placeholder="What is this for?" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }} 
              className="flex-1 py-3 rounded-lg font-display font-700 bg-[#4090f0] text-white flex justify-center items-center gap-2 shadow-lg shadow-[#4090f0]/20" 
              onClick={handleSubmit} 
              disabled={actionLoading}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft size={18} />}
              {actionLoading ? 'Transferring...' : 'Confirm Transfer'}
            </motion.button>
            <button className="btn-ghost flex-1 py-3" onClick={() => setModal(null)} disabled={actionLoading}>Cancel</button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}
