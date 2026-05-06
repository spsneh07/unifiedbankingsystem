import { CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { formatCurrency, maskAccountNo } from '@/lib/utils'

const bankColors: Record<string, { from: string; to: string; badge: string }> = {
  SBI: { from: 'rgba(0,212,170,0.08)', to: 'rgba(0,212,170,0.03)', badge: '#00d4aa' },
  HDFC: { from: 'rgba(64,144,240,0.08)', to: 'rgba(64,144,240,0.03)', badge: '#4090f0' },
  ICICI: { from: 'rgba(240,192,64,0.08)', to: 'rgba(240,192,64,0.03)', badge: '#f0c040' },
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
  const router = useRouter()
  const colors = bankColors[account.bank_name] || bankColors.SBI
  const isActive = account.status?.toLowerCase() === 'active'

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}
      className="relative rounded-2xl p-5 overflow-hidden card transition-all border border-gray-100 dark:border-white/5 cursor-pointer"
      style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }}
    >
      {/* Decorative circle */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10" 
        style={{ background: colors.badge }} 
      />

      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-display font-600 uppercase tracking-widest mb-1" style={{ color: colors.badge }}>{account.bank_name}</p>
          <p className="text-[12px] text-[#8890a0]">{account.account_type}</p>
        </div>
        <motion.div 
          whileHover={{ rotate: 15 }}
          className="w-9 h-9 rounded-xl flex items-center justify-center" 
          style={{ background: `${colors.badge}20` }}
        >
          <CreditCard size={16} style={{ color: colors.badge }} />
        </motion.div>
      </div>

      <p className="font-mono text-[14px] text-[#8890a0] mb-3">{maskAccountNo(account.account_no)}</p>
      <p className="font-display font-700 text-[22px] text-black dark:text-white">{formatCurrency(account.balance)}</p>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-black/5 dark:border-white/5">
        <span className={`badge ${isActive ? 'badge-green' : account.status === 'frozen' ? 'badge-blue' : 'badge-red'}`}>
          {account.status}
        </span>
        <div className="flex gap-2">
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(0,212,170,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); router.push('/transactions?action=transfer'); }}
            title="Transfer / Send"
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/5 transition-colors text-[#00d4aa]"
          >
            <ArrowUpRight size={14} />
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(240,80,80,0.1)' }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); router.push('/transactions?action=deposit'); }}
            title="Deposit"
            className="w-7 h-7 rounded-lg flex items-center justify-center bg-black/5 dark:bg-white/5 transition-colors text-[#f05050]"
          >
            <ArrowDownLeft size={14} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
