'use client'
import { useState, useEffect } from 'react'
import { MonthlyBarChart, TrendLineChart } from '@/components/charts/Charts'
import { CategoryPieChart } from '@/components/charts/CategoryPieChart'
import StatCard from '@/components/ui/StatCard'
import { Wallet, TrendingUp, ArrowLeftRight, PieChart as PieIcon, ShoppingBag, Utensils, Plane, Zap, MoreHorizontal } from 'lucide-react'
import { formatCurrency } from '@/lib/mockData'

const CATEGORY_COLORS: Record<string, string> = {
  Salary:   '#00d4aa',
  Food:     '#f5c542',
  Bills:    '#6c63ff',
  Shopping: '#f05050',
  Travel:   '#38bdf8',
  Other:    '#8890a0',
  Transfer: '#fb923c',
  Medical:  '#34d399',
}

const CATEGORY_ICONS: Record<string, any> = {
  Food: Utensils,
  Travel: Plane,
  Bills: Zap,
  Shopping: ShoppingBag,
}

function getCategoryColor(cat: string, idx: number): string {
  if (CATEGORY_COLORS[cat]) return CATEGORY_COLORS[cat]
  const fallbacks = ['#a78bfa', '#fb923c', '#34d399', '#f472b6', '#60a5fa']
  return fallbacks[idx % fallbacks.length]
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'spending'>('spending')

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : null;
  useEffect(() => {
    if (!user?.customer_id) return;
    fetch(`/api/analytics?customerId=${user.customer_id}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(res => { if (res.success) setData(res.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user?.customer_id])

  if (loading) return (
    <div className="p-6 space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="card p-6 animate-pulse h-48" />
      ))}
    </div>
  )

  if (!data) return <div className="p-6 text-[#8890a0]">Failed to load analytics.</div>

  const categorySource = activeTab === 'spending' ? data.topSpending : data.byCategory
  const pieData = categorySource.map((row: any, i: number) => ({
    name: row.category,
    value: Math.round(parseFloat(row.total_amount)),
    color: getCategoryColor(row.category, i),
  }))

  const totalSpending = data.topSpending.reduce((s: number, r: any) => s + parseFloat(r.total_amount), 0)
  const totalDeposits = data.byType.find((t: any) => t.type === 'deposit')?.total_amount || 0
  const totalDebits = data.byType.filter((t: any) => t.type !== 'deposit').reduce((s: number, t: any) => s + parseFloat(t.total_amount), 0)
  const netFlow = parseFloat(totalDeposits) - totalDebits

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-800 text-black dark:text-white">Analytics</h1>
        <p className="text-[14px] text-[#8890a0] mt-1">Real-time spending insights from your transactions</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Deposits" value={formatCurrency(parseFloat(totalDeposits))} icon={TrendingUp} accent="green" />
        <StatCard label="Total Spending" value={formatCurrency(totalSpending)} icon={ArrowLeftRight} accent="red" />
        <StatCard label="Net Flow" value={formatCurrency(netFlow)} icon={Wallet} accent={netFlow >= 0 ? 'green' : 'red'} />
        <StatCard label="Categories" value={String(data.byCategory.length)} icon={PieIcon} accent="blue" />
      </div>

      {/* Main charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie chart */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-700 text-[15px] text-black dark:text-white">Spending by Category</h3>
              <p className="text-[12px] text-[#8890a0] mt-0.5">Where your money goes</p>
            </div>
            <div className="flex gap-1 bg-gray-100 dark:bg-[#1a1d24] rounded-lg p-0.5">
              {(['spending', 'all'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`text-[11px] font-600 px-2.5 py-1 rounded-md capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-[#0d0f14] text-black dark:text-white shadow-sm' : 'text-[#8890a0]'}`}>
                  {tab === 'all' ? 'All' : 'Spend'}
                </button>
              ))}
            </div>
          </div>
          <CategoryPieChart data={pieData} />
        </div>

        {/* Monthly bar chart */}
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

      {/* Spending breakdown table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-[#1a1d24]">
          <h3 className="font-display font-700 text-[15px] text-black dark:text-white">Category Breakdown</h3>
          <p className="text-[12px] text-[#8890a0] mt-0.5">Detailed spending by category</p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-[#1a1d24]">
          {data.byCategory.map((cat: any, i: number) => {
            const color = getCategoryColor(cat.category, i)
            const amount = parseFloat(cat.total_amount)
            const maxAmount = parseFloat(data.byCategory[0].total_amount)
            const barWidth = (amount / maxAmount) * 100
            return (
              <div key={cat.category} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-[#111318]/60 transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}20` }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[14px] font-600 text-black dark:text-white">{cat.category}</span>
                    <span className="text-[14px] font-display font-700" style={{ color }}>{formatCurrency(amount)}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-[#1a1d24] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${barWidth}%`, background: color }} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0 w-24">
                  <p className="text-[12px] text-[#8890a0]">{cat.transaction_count} txns</p>
                  <p className="text-[11px] text-[#8890a0]">avg {formatCurrency(parseFloat(cat.avg_amount))}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Trend line */}
      <div className="card p-6">
        <div className="mb-4">
          <h3 className="font-display font-700 text-[15px] text-black dark:text-white">Cash Flow Trend</h3>
          <p className="text-[12px] text-[#8890a0] mt-0.5">Deposits vs withdrawals over time</p>
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
