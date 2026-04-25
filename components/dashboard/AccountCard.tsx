import { CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { formatCurrency, maskAccountNo } from '@/lib/mockData'

const bankColors: Record<string, { from: string; to: string; badge: string }> = {
  SBI: { from: '#1a2a1a', to: '#0f1a0f', badge: '#00d4aa' },
  HDFC: { from: '#1a1a2a', to: '#0f0f1a', badge: '#4090f0' },
  ICICI: { from: '#2a1a10', to: '#1a0f0a', badge: '#f0c040' },
}

interface Account {
  account_id: number
  account_no: string
  bank_name: string
  account_type: string
  balance: number
  status: string
}

export default function AccountCard({ account }: { account: Account }) {
  const colors = bankColors[account.bank_name] || bankColors.SBI
  const isActive = account.status === 'active'

  return (
    <div
      className="relative rounded-2xl p-5 overflow-hidden card-hover cursor-pointer"
      style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`, border: '1px solid #1a1d24' }}
    >
      {/* Decorative circle */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10" style={{ background: colors.badge }} />

      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-display font-600 uppercase tracking-widest mb-1" style={{ color: colors.badge }}>{account.bank_name}</p>
          <p className="text-[12px] text-[#8890a0]">{account.account_type}</p>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${colors.badge}20` }}>
          <CreditCard size={16} style={{ color: colors.badge }} />
        </div>
      </div>

      <p className="font-mono text-[14px] text-[#8890a0] mb-3">{maskAccountNo(account.account_no)}</p>
      <p className="font-display font-700 text-[22px] text-white">{formatCurrency(account.balance)}</p>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <span className={`badge ${isActive ? 'badge-green' : account.status === 'frozen' ? 'badge-blue' : 'badge-red'}`}>
          {account.status}
        </span>
        <div className="flex gap-2">
          <button className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors text-[#00d4aa]">
            <ArrowUpRight size={14} />
          </button>
          <button className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors text-[#f05050]">
            <ArrowDownLeft size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
