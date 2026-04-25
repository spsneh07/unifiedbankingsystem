'use client'
import Link from 'next/link'
import StatCard from '@/components/ui/StatCard'
import AccountCard from '@/components/dashboard/AccountCard'
import { MonthlyBarChart } from '@/components/charts/Charts'
import { mockAnalytics, formatCurrency } from '@/lib/mockData'
import { Wallet, Users, ShieldAlert, TrendingUp } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { useState, useEffect } from 'react'
import CreditScoreWidget from '@/components/dashboard/CreditScoreWidget'

function txBadge(type: string) {
  if (type === 'deposit') return <Badge variant="green">Deposit</Badge>
  if (type === 'withdraw') return <Badge variant="red">Withdraw</Badge>
  return <Badge variant="blue">Transfer</Badge>
}

export default function DashboardPage() {
  const [bankFilter, setBankFilter] = useState('All')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  useEffect(() => {
    fetch('/api/dashboard', { cache: 'no-store' })
      .then(res => res.json())
      .then(res => { if (res.success) setData(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user?.id])

  if (loading || !data) return <div className="p-6 text-white">Loading...</div>

  const filtered = bankFilter === 'All' ? data.myAccounts : data.myAccounts.filter((a: any) => a.bank_name === bankFilter)

  return (
    <div className="w-full flex flex-col gap-6 p-6 animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Balance" value={formatCurrency(data.totalBalance)} sub="Across all accounts" icon={Wallet} trend={{ value: 'Active', up: true }} accent="green" />
        <StatCard label="Total Accounts" value={String(data.totalAccounts)} sub="Active accounts" icon={TrendingUp} accent="blue" />
        <StatCard label="Customers" value={String(data.totalCustomers)} sub="Registered users" icon={Users} accent="gold" />
        <StatCard label="Fraud Alerts" value={String(data.fraudAlerts.length)} sub="Needs review" icon={ShieldAlert} accent="red" />
      </div>

      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-700 text-[15px] text-white">My Accounts</h2>
          <div className="flex gap-2">
            {['All', 'Current', 'Savings'].map(b => (
              <button key={b} onClick={() => setBankFilter(b)}
                className={`text-[12px] font-display font-600 px-3 py-1 rounded-full transition-all ${bankFilter === b ? 'bg-accent text-[#0a0c10]' : 'bg-[#1a1d24] text-[#8890a0] hover:text-white'}`}>
                {b}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((acc: any) => <AccountCard key={acc.id} account={{ ...acc, account_id: acc.id, bank_name: acc.type === 'checking' ? 'Checking' : 'Savings', balance: parseFloat(acc.balance), account_no: acc.account_number }} />)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <div className="lg:col-span-2 card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-600 text-[14px] text-white">Monthly Cash Flow</h3>
            <span className="text-[12px] text-[#8890a0]">Last 6 months</span>
          </div>
          <div className="h-[300px] min-h-[300px] w-full">
            <MonthlyBarChart data={mockAnalytics.monthlySpending} />
          </div>
        </div>

        {/* Credit Score widget replaces old alerts panel */}
        <CreditScoreWidget />
      </div>

      {/* Alerts row below */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-600 text-[14px] text-white">Active Alerts</h3>
            <span className="badge badge-red">{data.fraudAlerts.length}</span>
          </div>
          <div className="divide-y divide-[#1a1d24] flex-1 overflow-y-auto min-h-0">
            {data.fraudAlerts.map((alert: any) => (
              <div key={alert.transaction_id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 bg-danger" />
                  <div className="flex-1">
                    <p className="text-[13px] text-[#e8eaf0] leading-snug">Suspicious on {alert.account_number} — {formatCurrency(parseFloat(alert.amount))}</p>
                    <p className="text-[11px] text-[#8890a0] mt-1">{new Date(alert.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                </div>
              </div>
            ))}
            {data.fraudAlerts.length === 0 && <div className="py-4 text-center text-[13px] text-[#8890a0]">No active alerts</div>}
          </div>
        </div>

        <div className="lg:col-span-2 card w-full">
          <div className="flex items-center justify-between px-6 py-5 border-b border-[#1a1d24]">
            <h3 className="font-display font-600 text-[15px] text-white">Recent Transactions</h3>
            <Link href="/transactions" className="text-[13px] text-accent hover:underline font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-[#1a1d24]">
            {data.recentTx.map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-[#12141a] transition-colors">
                <div className="flex items-center gap-4 w-1/3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-white truncate">{tx.description}</p>
                    <p className="text-[12px] text-[#8890a0] mt-0.5">{tx.account_no}</p>
                  </div>
                </div>
                <div className="w-1/4">
                  <p className="text-[13px] text-white">{new Date(tx.transaction_date).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="w-1/4">{txBadge(tx.type)}</div>
                <div className="w-1/6 text-right">
                  <p className={`text-[15px] font-display font-700 ${tx.type === 'deposit' ? 'text-[#00d4aa]' : 'text-[#f05050]'}`}>
                    {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(parseFloat(tx.amount))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
