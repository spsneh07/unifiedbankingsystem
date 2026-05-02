'use client'
import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import { ShieldAlert, AlertTriangle, TrendingUp, Eye } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'

export default function FraudPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/transactions', { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        setTransactions(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const suspiciousTransactions = transactions.filter(t => t.is_suspicious)
  const avgAmount = transactions.length > 0 ? transactions.reduce((s: number, t: any) => s + parseFloat(t.amount), 0) / transactions.length : 0
  const threshold = avgAmount * 3

  if (loading) {
    return <div className="p-6 text-white">Loading fraud data...</div>
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">

        {/* Alert banner */}
        <div className="flex items-start gap-4 p-5 rounded-xl border border-[#f05050]/30 bg-[#f05050]/5">
          <div className="w-10 h-10 rounded-xl bg-[#f05050]/15 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={20} className="text-[#f05050]" />
          </div>
          <div>
            <p className="font-display font-700 text-[15px] text-white mb-1">{suspiciousTransactions.length} Suspicious Transactions Detected</p>
            <p className="text-[13px] text-[#8890a0]">
              Transactions flagged where amount &gt; 3× average (₹{avgAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}).
              Current threshold: <span className="text-[#f05050] font-700">{formatCurrency(threshold)}</span>
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Flagged" value={String(suspiciousTransactions.length)} icon={ShieldAlert} accent="red" />
          <StatCard label="Avg Suspicious" value={formatCurrency(suspiciousTransactions.length > 0 ? suspiciousTransactions.reduce((s: number, t: any) => s + parseFloat(t.amount), 0) / suspiciousTransactions.length : 0)} icon={TrendingUp} accent="red" />
          <StatCard label="Detection Threshold" value={formatCurrency(threshold)} icon={AlertTriangle} accent="gold" />
          <StatCard label="Avg Transaction" value={formatCurrency(avgAmount)} icon={Eye} accent="blue" />
        </div>

        {/* Flagged Transactions */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-[#1a1d24]">
            <AlertTriangle size={16} className="text-[#f05050]" />
            <h3 className="font-display font-600 text-[14px] text-white">Flagged Transactions</h3>
            <span className="badge badge-red ml-auto">{suspiciousTransactions.length} alerts</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1d24]">
                  {['ID', 'Account', 'Customer', 'Type', 'Amount', '3× Avg', 'Description', 'Date', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-display font-600 uppercase tracking-widest text-[#8890a0]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {suspiciousTransactions.map((tx: any) => (
                  <tr key={tx.id} className="table-row bg-[#f05050]/3">
                    <td className="px-5 py-4 font-mono text-[12px] text-[#8890a0]">#{tx.id}</td>
                    <td className="px-5 py-4 font-mono text-[12px] text-[#8890a0]">{String(tx.account_number || '').slice(-8)}</td>
                    <td className="px-5 py-4 text-white font-display font-600">{tx.customer_name}</td>
                    <td className="px-5 py-4">
                      {tx.type?.toLowerCase() === 'deposit' ? <Badge variant="green">Deposit</Badge> : tx.type?.toLowerCase() === 'withdrawal' || tx.type?.toLowerCase() === 'withdraw' ? <Badge variant="red">Withdraw</Badge> : <Badge variant="blue">Transfer</Badge>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-display font-700 text-[#f05050] text-[15px]">{formatCurrency(tx.amount)}</span>
                    </td>
                    <td className="px-5 py-4 text-[#f0c040] font-700">{avgAmount > 0 ? (parseFloat(tx.amount) / avgAmount).toFixed(1) : '0'}×</td>
                    <td className="px-5 py-4 text-[#8890a0] max-w-[160px] truncate">{tx.description}</td>
                    <td className="px-5 py-4 text-[12px] text-[#8890a0]">{new Date(tx.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <span className="badge badge-red flex items-center gap-1 w-fit">
                        <AlertTriangle size={10} /> Flagged
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* All transactions for context */}
        <div className="card">
          <div className="px-5 py-4 border-b border-[#1a1d24]">
            <h3 className="font-display font-600 text-[14px] text-white">All Transactions — Fraud Risk View</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1d24]">
                  {['ID', 'Account', 'Amount', 'Multiples of Avg', 'Risk Level'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-display font-600 uppercase tracking-widest text-[#8890a0]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...transactions].sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount)).map((tx: any) => {
                  const mult = avgAmount > 0 ? parseFloat(tx.amount) / avgAmount : 0
                  const risk = mult > 3 ? 'high' : mult > 1.5 ? 'medium' : 'low'
                  return (
                    <tr key={tx.id} className="table-row">
                      <td className="px-5 py-3 font-mono text-[12px] text-[#8890a0]">#{tx.id}</td>
                      <td className="px-5 py-3 font-mono text-[12px] text-[#8890a0]">{String(tx.account_number || '').slice(-8)}</td>
                      <td className="px-5 py-3 font-700 text-white">{formatCurrency(tx.amount)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-2 rounded-full flex-1 max-w-[120px] bg-[#1a1d24]">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(mult/4*100,100)}%`, background: risk === 'high' ? '#f05050' : risk === 'medium' ? '#f0c040' : '#00d4aa' }} />
                          </div>
                          <span className="text-[12px] text-[#8890a0]">{mult.toFixed(1)}×</span>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {risk === 'high' ? <Badge variant="red">High</Badge> : risk === 'medium' ? <Badge variant="yellow">Medium</Badge> : <Badge variant="green">Low</Badge>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
  )
}
