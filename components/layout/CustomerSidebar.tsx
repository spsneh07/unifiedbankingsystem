'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Wallet, ArrowLeftRight, CreditCard, Banknote,
  BarChart2, Bell, LogOut, Landmark, CalendarClock, Settings
} from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { useSession } from '@/components/SessionProvider'

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
  { href: '/settings', icon: Settings, label: 'Settings' },
]

export default function CustomerSidebar() {
  const pathname = usePathname()
  const { logout } = useSession()

  return (
    <aside className="h-screen sticky top-0 w-64 bg-white dark:bg-[#0d0f14] border-r border-gray-200 dark:border-[#1a1d24] flex flex-col z-20">
      <div className="p-6">
        <Logo size={42} className="mb-2" />
        <span className="font-display font-800 text-black dark:text-white text-[20px] block leading-tight tracking-tight">Nexus<span className="text-accent">Bank</span></span>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${active ? 'bg-accent/10 text-accent' : 'text-[#8890a0] hover:bg-[#1a1d24] hover:text-black dark:text-white'}`}>
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-[#1a1d24]">
        <motion.button 
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#8890a0] hover:bg-[#f05050]/10 hover:text-[#f05050] transition-all"
        >
          <LogOut size={18} /> Logout
        </motion.button>
      </div>
    </aside>
  )
}
