import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatCardProps {
  label: string
  value: string
  sub?: string
  icon: LucideIcon
  trend?: { value: string; up: boolean }
  accent?: 'green' | 'gold' | 'blue' | 'red'
}

const accentMap = {
  green: { bg: 'rgba(0,212,170,0.1)', text: '#00d4aa', border: 'rgba(0,212,170,0.2)' },
  gold: { bg: 'rgba(240,192,64,0.1)', text: '#f0c040', border: 'rgba(240,192,64,0.2)' },
  blue: { bg: 'rgba(64,144,240,0.1)', text: '#4090f0', border: 'rgba(64,144,240,0.2)' },
  red: { bg: 'rgba(240,80,80,0.1)', text: '#f05050', border: 'rgba(240,80,80,0.2)' },
}

export default function StatCard({ label, value, sub, icon: Icon, trend, accent = 'green' }: StatCardProps) {
  const colors = accentMap[accent] || accentMap['green']
  return (
    <motion.div 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="card p-5 hover:border-[#00d4aa]/30 transition-all cursor-default"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-display font-600 uppercase tracking-widest text-[#8890a0] mb-2">{label}</p>
          <motion.p 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-[26px] font-display font-700 text-black dark:text-white leading-tight"
          >
            {value}
          </motion.p>
          {sub && <p className="text-[12px] text-[#8890a0] mt-1">{sub}</p>}
          {trend && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`inline-flex items-center gap-1 text-[12px] font-600 mt-2 ${trend.up ? 'text-[#00d4aa]' : 'text-[#f05050]'}`}
            >
              {trend.up ? '↑' : '↓'} {trend.value}
            </motion.span>
          )}
        </div>
        <motion.div 
          whileHover={{ rotate: 10 }}
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" 
          style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
        >
          <Icon size={20} style={{ color: colors.text }} />
        </motion.div>
      </div>
    </motion.div>
  )
}
