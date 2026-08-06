'use client'
import { useSession } from '@/components/SessionProvider'
import { useState, useEffect } from 'react'
import { MonthlyBarChart, TrendLineChart } from '@/components/charts/Charts'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import StatCard from '@/components/ui/StatCard'
import { Wallet, TrendingUp, ArrowLeftRight, PieChart as PieIcon } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  Salary: '#00d4aa', Food: '#f5c542', Bills: '#6c63ff',
  Shopping: '#f05050', Travel: '#38bdf8', Other: '#8890a0', Transfer: '#fb923c', Medical: '#34d399',
}
const FALLBACKS = ['#a78bfa', '#fb923c', '#34d399', '#f472b6', '#60a5fa']

function getCategoryColor(cat: string, idx: number) {
  return CATEGORY_COLORS[cat] ?? FALLBACKS[idx % FALLBACKS.length]
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'spending'>('all')

  const { user } = useSession()
  useEffect(() => {
    fetch('/api/analytics', { cache: 'no-store', credentials: 'include' })
      .then(r => r.json())
      .then(res => { if (res.success) setData(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user?.id])

  if (loading) return (
    <div className="p-6 space-y-6">
      {[...Array(3)].map((_, i) => <div key={i} className="card p-6 animate-pulse h-48" />)}
    </div>
  )

  if (!data) return <div className="p-6 text-[#8890a0]">Failed to load analytics.</div>

  const categorySource = activeTab === 'spending' ? data.topSpending : data.byCategory
  const pieData = categorySource.map((row: any, i: number) => ({
    name: row.category,
    value: Math.round(parseFloat(row.total_amount)),
    color: getCategoryColor(row.category, i),
  }))

  const totalDeposits = parseFloat(data.byType.find((t: any) => t.type === 'deposit')?.total_amount || 0)
  const totalDebits = data.byType.filter((t: any) => t.type !== 'deposit').reduce((s: number, t: any) => s + parseFloat(t.total_amount), 0)
  const netFlow = totalDeposits - totalDebits
  const totalTxns = data.byCategory.reduce((s: number, c: any) => s + Number(c.transaction_count), 0)

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-800 text-black dark:text-white">Analytics</h1>
        <p className="text-[14px] text-[#8890a0] mt-1">Bank-wide transaction analytics by category</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Deposits" value={formatCurrency(totalDeposits)} icon={TrendingUp} accent="green" />
        <StatCard label="Total Spending" value={formatCurrency(totalDebits)} icon={ArrowLeftRight} accent="red" />
        <StatCard label="Net Flow" value={formatCurrency(netFlow)} icon={Wallet} accent={netFlow >= 0 ? 'green' : 'red'} />
        <StatCard label="Transactions" value={String(totalTxns)} icon={PieIcon} accent="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-700 text-[15px] text-black dark:text-white">Category Distribution</h3>
              <p className="text-[12px] text-[#8890a0] mt-0.5">All transactions grouped by category</p>
            </div>
            <div className="flex gap-1 bg-gray-100 dark:bg-[#1a1d24] rounded-lg p-0.5">
              {(['all', 'spending'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`text-[11px] font-600 px-2.5 py-1 rounded-md capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-[#0d0f14] text-black dark:text-white shadow-sm' : 'text-[#8890a0]'}`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
          <CategoryPieChart data={pieData} />
        </div>

        <div className="lg:col-span-2 card p-6">
          <div className="mb-4">
            <h3 className="font-display font-700 text-[15px] text-black dark:text-white">Monthly Cash Flow</h3>
            <p className="text-[12px] text-[#8890a0] mt-0.5">Deposits vs withdrawals — last 6 months</p>
          </div>
          <div className="h-[260px]">
            <MonthlyBarChart data={data.monthly.map((m: any) => ({
              month: m.month,
              deposits: parseFloat(m.deposits),
              withdrawals: parseFloat(m.withdrawals),
            }))} />
          </div>
        </div>
      </div>

      {/* Category breakdown table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-[#1a1d24]">
          <h3 className="font-display font-700 text-[15px] text-black dark:text-white">Category Breakdown</h3>
          <p className="text-[12px] text-[#8890a0] mt-0.5">All categories with volume and average transaction</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-[#1a1d24] bg-gray-50 dark:bg-[#0d0f14]">
                {['Category', 'Total Amount', 'Transactions', 'Avg Transaction', 'Max Transaction', 'Share'].map(h => (
                  <th key={h} className="px-5 py-3 text-[11px] font-600 text-[#8890a0] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#1a1d24]">
              {data.byCategory.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[#8890a0]">No analytics data available.</td></tr>
              ) : data.byCategory.map((cat: any, i: number) => {
                const color = getCategoryColor(cat.category, i)
                const amount = parseFloat(cat.total_amount)
                const grand = data.byCategory.reduce((s: number, c: any) => s + parseFloat(c.total_amount), 0)
                const pct = ((amount / (grand || 1)) * 100).toFixed(1)
                return (
                  <tr key={cat.category} className="hover:bg-gray-50 dark:hover:bg-[#111318]/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                        <span className="font-600 text-[14px] text-black dark:text-white">{cat.category}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-display font-700" style={{ color }}>{formatCurrency(amount)}</td>
                    <td className="px-5 py-3 text-[#8890a0]">{cat.transaction_count}</td>
                    <td className="px-5 py-3 text-black dark:text-white">{formatCurrency(parseFloat(cat.avg_amount))}</td>
                    <td className="px-5 py-3 text-black dark:text-white">{formatCurrency(parseFloat(cat.max_amount))}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-gray-100 dark:bg-[#1a1d24] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                        </div>
                        <span className="text-[12px] text-[#8890a0]">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4">
          <h3 className="font-display font-700 text-[15px] text-black dark:text-white">Trend Line</h3>
          <p className="text-[12px] text-[#8890a0] mt-0.5">Monthly cash flow comparison</p>
        </div>
        <div className="h-[220px]">
          <TrendLineChart data={data.monthly.map((m: any) => ({
            month: m.month,
            deposits: parseFloat(m.deposits),
            withdrawals: parseFloat(m.withdrawals),
          }))} />
        </div>
      </div>
    </div>
  )
}



