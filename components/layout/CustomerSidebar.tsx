'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Wallet, ArrowLeftRight, CreditCard, Banknote,
  BarChart2, Bell, LogOut, Landmark, CalendarClock
} from 'lucide-react'
import { clearSession } from '@/lib/auth'
import Logo from '@/components/ui/Logo'

const nav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/accounts', icon: Wallet, label: 'My Accounts' },
  { href: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/credit-cards', icon: CreditCard, label: 'Credit Cards' },
  { href: '/loans', icon: Banknote, label: 'Loans' },
  { href: '/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/branches', icon: Landmark, label: 'Branch Locator' },
  { href: '/scheduled', icon: CalendarClock, label: 'Auto-Pay' },
  { href: '/alerts', icon: Bell, label: 'Alerts' },
]

const sidebarVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut', staggerChildren: 0.05 } }
}

const itemVariants = {
  hidden: { x: -10, opacity: 0 },
  visible: { x: 0, opacity: 1 }
}

export default function CustomerSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <motion.aside 
      initial="hidden"
      animate="visible"
      variants={sidebarVariants}
      className="h-screen sticky top-0 w-64 bg-gray-50 dark:bg-[#0d0f14] border-r border-gray-200 dark:border-[#1a1d24] flex flex-col"
    >
      <div className="p-6 flex items-center gap-3">
        <Logo size={36} />
        <div>
          <span className="font-display font-800 text-black dark:text-white text-[16px] block leading-tight">Nexus<span className="text-[#00d4aa]">Bank</span></span>
          <span className="text-[10px] text-[#00d4aa]/60 font-600 tracking-[0.15em]">PERSONAL</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
          return (
            <motion.div key={item.href} variants={itemVariants}>
              <Link href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${active ? 'bg-[#00d4aa]/10 text-[#00d4aa]' : 'text-[#8890a0] hover:bg-[#1a1d24] hover:text-black dark:text-white'}`}>
                <item.icon size={18} />
                {item.label}
              </Link>
            </motion.div>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-[#1a1d24]">
        <motion.button 
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { clearSession(); router.push('/') }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#8890a0] hover:bg-[#f05050]/10 hover:text-[#f05050] transition-all"
        >
          <LogOut size={18} /> Logout
        </motion.button>
      </div>
    </motion.aside>
  )
}
