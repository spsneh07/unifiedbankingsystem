'use client'
import AppLayout from '@/components/layout/AppLayout'
import Header from '@/components/layout/Header'
import { MonthlyBarChart, DonutChart, SpendingBarChart, TrendLineChart } from '@/components/charts/Charts'
import { mockAnalytics, formatCurrency, mockAccounts, mockTransactions } from '@/lib/mockData'
import StatCard from '@/components/ui/StatCard'
import { Wallet, TrendingUp, ArrowLeftRight, PieChart } from 'lucide-react'

const totalDeposits = mockTransactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0)
const totalWithdrawals = mockTransactions.filter(t => t.type === 'withdraw').reduce((s, t) => s + t.amount, 0)

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <Header title="Analytics" />
      <div className="p-6 space-y-6 animate-fade-in">

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Balance" value={formatCurrency(mockAnalytics.totalBalance)} icon={Wallet} accent="green" />
          <StatCard label="Total Deposits" value={formatCurrency(totalDeposits)} icon={TrendingUp} accent="green" />
          <StatCard label="Total Withdrawals" value={formatCurrency(totalWithdrawals)} icon={ArrowLeftRight} accent="red" />
          <StatCard label="Net Flow" value={formatCurrency(totalDeposits - totalWithdrawals)} icon={PieChart} accent={totalDeposits > totalWithdrawals ? 'green' : 'red'} />
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-display font-600 text-[14px] text-white mb-1">Monthly Cash Flow</h3>
            <p className="text-[12px] text-[#8890a0] mb-4">Deposits vs withdrawals over last 6 months</p>
            <MonthlyBarChart data={mockAnalytics.monthlySpending} />
          </div>
          <div className="card p-5">
            <h3 className="font-display font-600 text-[14px] text-white mb-1">Transaction Trend</h3>
            <p className="text-[12px] text-[#8890a0] mb-4">Line view of cash movement</p>
            <TrendLineChart data={mockAnalytics.monthlySpending} />
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5">
            <h3 className="font-display font-600 text-[14px] text-white mb-1">Bank Distribution</h3>
            <p className="text-[12px] text-[#8890a0] mb-2">Accounts by bank</p>
            <DonutChart data={mockAnalytics.bankDistribution} />
          </div>
          <div className="card p-5">
            <h3 className="font-display font-600 text-[14px] text-white mb-1">Transaction Types</h3>
            <p className="text-[12px] text-[#8890a0] mb-2">Split by type</p>
            <DonutChart data={mockAnalytics.transactionTypes} />
          </div>
          <div className="card p-5">
            <h3 className="font-display font-600 text-[14px] text-white mb-1">Spending by Category</h3>
            <p className="text-[12px] text-[#8890a0] mb-2">Where money goes</p>
            <SpendingBarChart data={mockAnalytics.spendingByCategory} />
          </div>
        </div>

        {/* Account balance table */}
        <div className="card">
          <div className="px-5 py-4 border-b border-[#1a1d24]">
            <h3 className="font-display font-600 text-[14px] text-white">Account Balance Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a1d24]">
                  {['Bank', 'Accounts', 'Total Balance', 'Avg Balance', 'Min', 'Max'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-display font-600 uppercase tracking-widest text-[#8890a0]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['SBI', 'HDFC', 'ICICI'].map(bank => {
                  const accs = mockAccounts.filter(a => a.bank_name === bank)
                  const total = accs.reduce((s, a) => s + a.balance, 0)
                  const min = Math.min(...accs.map(a => a.balance))
                  const max = Math.max(...accs.map(a => a.balance))
                  return (
                    <tr key={bank} className="table-row">
                      <td className="px-5 py-3 font-display font-700 text-white">{bank}</td>
                      <td className="px-5 py-3 text-[#8890a0]">{accs.length}</td>
                      <td className="px-5 py-3 text-[#00d4aa] font-700">{formatCurrency(total)}</td>
                      <td className="px-5 py-3 text-white">{formatCurrency(total / accs.length)}</td>
                      <td className="px-5 py-3 text-[#f05050]">{formatCurrency(min)}</td>
                      <td className="px-5 py-3 text-[#00d4aa]">{formatCurrency(max)}</td>
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
