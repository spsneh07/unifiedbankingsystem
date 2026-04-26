'use client'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import StatCard from '@/components/ui/StatCard'
import AccountCard from '@/components/dashboard/AccountCard'
import { MonthlyBarChart } from '@/components/charts/Charts'
import { mockAnalytics, formatCurrency } from '@/lib/mockData'
import { Wallet, Users, ShieldAlert, TrendingUp, Loader2, ArrowRight } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import { useState, useEffect } from 'react'
import CreditScoreWidget from '@/components/dashboard/CreditScoreWidget'

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
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 }
}

export default function DashboardPage() {
  const [bankFilter, setBankFilter] = useState('All')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  useEffect(() => {
    if (!user?.id) {
       setLoading(false);
       return;
    }
    
    fetch(`/api/dashboard`, { cache: 'no-store' })
      .then(res => res.json())
      .then(res => { 
        if (res.success) {
          setData(res.data);
        } else {
          setData({ error: res.error });
        }
        setLoading(false) 
      })
      .catch(() => setLoading(false))
  }, [user?.id])

  if (loading) {
    return (
      <div className="p-6 text-black dark:text-white flex items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin h-8 w-8 text-[#00d4aa]" />
      </div>
    )
  }
  
  if (!data || data.error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-6 text-black dark:text-white flex flex-col items-center justify-center h-[80vh] text-center"
      >
        <ShieldAlert size={48} className="text-danger mb-4" />
        <h2 className="text-2xl font-display font-700 mb-2 tracking-tight">Account Setup Required</h2>
        <p className="text-[#8890a0] mb-6 max-w-md">Your customer profile is not fully initialized. Please contact support or try logging in again.</p>
        <button onClick={() => window.location.href = '/login'} className="btn-primary">Back to Login</button>
      </motion.div>
    )
  }

  const filtered = bankFilter === 'All' ? data.myAccounts : data.myAccounts.filter((a: any) => a.bank_name === bankFilter)

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="w-full flex flex-col gap-6 p-6"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Balance" value={formatCurrency(data.totalBalance)} sub="Across all accounts" icon={Wallet} trend={{ value: 'Active', up: true }} accent="green" />
        <StatCard label="Total Accounts" value={String(data.totalAccounts)} sub="Active accounts" icon={TrendingUp} accent="blue" />
        <StatCard label="Customers" value={String(data.totalCustomers)} sub="Registered users" icon={Users} accent="gold" />
        <StatCard label="Fraud Alerts" value={String(data.fraudAlerts.length)} sub="Needs review" icon={ShieldAlert} accent="red" />
      </div>

      <motion.div variants={itemVariants} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-700 text-[15px] text-black dark:text-white tracking-tight uppercase">My Accounts</h2>
          <div className="flex gap-2">
            {['All', 'Current', 'Savings'].map(b => (
              <motion.button 
                key={b} 
                whileTap={{ scale: 0.95 }}
                onClick={() => setBankFilter(b)}
                className={`text-[11px] font-display font-700 px-3 py-1 rounded-full transition-all border ${bankFilter === b ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-[#1a1d24] border-white/5 text-[#8890a0] hover:text-white'}`}
              >
                {b}
              </motion.button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="popLayout">
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((acc: any) => (
              <AccountCard
                key={acc.id}
                account={{
                  ...acc,
                  account_id: acc.id,
                  bank_name: acc.type === 'checking' ? 'Checking' : 'Savings',
                  balance: parseFloat(acc.balance),
                  account_no: acc.account_no,
                }}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <motion.div variants={itemVariants} className="lg:col-span-2 card p-6 flex flex-col bg-[#111318]/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-700 text-[14px] text-black dark:text-white uppercase tracking-wider">Monthly Cash Flow</h3>
            <span className="text-[11px] font-600 text-[#8890a0] bg-white/5 px-2 py-1 rounded">Last 6 months</span>
          </div>
          <div className="h-[300px] min-h-[300px] w-full">
            <MonthlyBarChart data={mockAnalytics.monthlySpending} />
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <CreditScoreWidget />
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-1 card p-6 flex flex-col bg-[#111318]/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-700 text-[14px] text-black dark:text-white uppercase tracking-wider">Active Alerts</h3>
            <Badge variant="red">{data.fraudAlerts.length}</Badge>
          </div>
          <div className="divide-y divide-white/5 flex-1 overflow-y-auto min-h-0">
            {data.fraudAlerts.map((alert: any, i: number) => (
              <motion.div 
                key={alert.transaction_id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0 bg-danger shadow-[0_0_8px_rgba(240,80,80,0.5)]" />
                  <div className="flex-1">
                    <p className="text-[13px] text-[#e8eaf0] leading-snug font-medium">
                      Suspicious on {alert.account_no}
                    </p>
                    <p className="text-[11px] text-[#8890a0] mt-1 flex items-center justify-between">
                      <span>{new Date(alert.created_at).toLocaleDateString('en-IN')}</span>
                      <span className="text-danger font-bold">{formatCurrency(parseFloat(alert.amount))}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            {data.fraudAlerts.length === 0 && <div className="py-8 text-center text-[13px] text-[#8890a0]">No active alerts</div>}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2 card w-full bg-[#111318]/50 backdrop-blur-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
            <h3 className="font-display font-700 text-[14px] text-black dark:text-white uppercase tracking-wider">Recent Transactions</h3>
            <Link href="/transactions" className="text-[12px] text-accent hover:text-white font-bold flex items-center gap-1 transition-colors">
              VIEW ALL <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {data.recentTx.map((tx: any, i: number) => (
              <motion.div 
                key={tx.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4 w-1/3 min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-black dark:text-white truncate tracking-tight">{tx.description}</p>
                    <p className="text-[11px] text-[#8890a0] mt-0.5 font-mono uppercase tracking-tighter">{tx.account_no}</p>
                  </div>
                </div>
                <div className="w-1/4">
                  <p className="text-[12px] text-[#8890a0]">{new Date(tx.transaction_date).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="w-1/4">{txBadge(tx.type)}</div>
                <div className="w-1/6 text-right">
                  <p className={`text-[15px] font-display font-800 ${tx.type?.toLowerCase() === 'deposit' ? 'text-[#00d4aa]' : 'text-[#f05050]'}`}>
                    {tx.type?.toLowerCase() === 'deposit' ? '+' : '-'}{formatCurrency(parseFloat(tx.amount))}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
