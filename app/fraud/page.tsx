'use client'
import AppLayout from '@/components/layout/AppLayout'
import Header from '@/components/layout/Header'
import { suspiciousTransactions, mockTransactions, formatCurrency } from '@/lib/mockData'
import { ShieldAlert, AlertTriangle, TrendingUp, Eye } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import StatCard from '@/components/ui/StatCard'

const avgAmount = mockTransactions.reduce((s, t) => s + t.amount, 0) / mockTransactions.length
const threshold = avgAmount * 3

export default function FraudPage() {
  return (
    <AppLayout>
      <Header title="Fraud Detection" />
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
          <StatCard label="Avg Suspicious" value={formatCurrency(suspiciousTransactions.reduce((s,t)=>s+t.amount,0)/suspiciousTransactions.length || 0)} icon={TrendingUp} accent="red" />
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
                {suspiciousTransactions.map(tx => (
                  <tr key={tx.transaction_id} className="table-row bg-[#f05050]/3">
                    <td className="px-5 py-4 font-mono text-[12px] text-[#8890a0]">#{tx.transaction_id}</td>
                    <td className="px-5 py-4 font-mono text-[12px] text-[#8890a0]">{tx.account_no.slice(-8)}</td>
                    <td className="px-5 py-4 text-white font-display font-600">{tx.customer_name}</td>
                    <td className="px-5 py-4">
                      {tx.type === 'deposit' ? <Badge variant="green">Deposit</Badge> : tx.type === 'withdraw' ? <Badge variant="red">Withdraw</Badge> : <Badge variant="blue">Transfer</Badge>}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-display font-700 text-[#f05050] text-[15px]">{formatCurrency(tx.amount)}</span>
                    </td>
                    <td className="px-5 py-4 text-[#f0c040] font-700">{(tx.amount / avgAmount).toFixed(1)}×</td>
                    <td className="px-5 py-4 text-[#8890a0] max-w-[160px] truncate">{tx.description}</td>
                    <td className="px-5 py-4 text-[12px] text-[#8890a0]">{new Date(tx.transaction_date).toLocaleDateString('en-IN')}</td>
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
                {[...mockTransactions].sort((a,b) => b.amount - a.amount).map(tx => {
                  const mult = tx.amount / avgAmount
                  const risk = mult > 3 ? 'high' : mult > 1.5 ? 'medium' : 'low'
                  return (
                    <tr key={tx.transaction_id} className="table-row">
                      <td className="px-5 py-3 font-mono text-[12px] text-[#8890a0]">#{tx.transaction_id}</td>
                      <td className="px-5 py-3 font-mono text-[12px] text-[#8890a0]">{tx.account_no.slice(-8)}</td>
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
    </AppLayout>
  )
}
