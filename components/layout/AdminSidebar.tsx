'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, CreditCard, ArrowLeftRight,
  BarChart2, ShieldAlert, Bell, Terminal, LogOut, Landmark, Banknote
} from 'lucide-react'
import { useSession } from '@/components/SessionProvider'

const nav = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/customers', icon: Users, label: 'Customers' },
  { href: '/admin/accounts', icon: CreditCard, label: 'Accounts' },
  { href: '/admin/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { href: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/admin/branches', icon: Landmark, label: 'Branches' },
  { href: '/admin/fraud', icon: ShieldAlert, label: 'Fraud Detection' },
  { href: '/admin/loans', icon: Banknote, label: 'Loans' },
  { href: '/admin/alerts', icon: Bell, label: 'Alerts' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useSession()

  return (
    <aside className="h-screen sticky top-0 w-64 bg-gray-50 dark:bg-[#0d0f14] border-r border-gray-200 dark:border-[#1a1d24] flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#f0c040] flex items-center justify-center">
          <Landmark size={18} className="text-[#0a0c10]" />
        </div>
        <div>
          <span className="font-display font-800 text-black dark:text-white text-[16px] block leading-tight">Nexus<span className="text-[#f0c040]">Admin</span></span>
          <span className="text-[10px] text-[#f0c040]/60 font-600 tracking-[0.15em]">ROOT ACCESS</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href + '/'))
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${active ? 'bg-[#f0c040]/10 text-[#f0c040]' : 'text-[#8890a0] hover:bg-[#1a1d24] hover:text-black dark:text-white'}`}>
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-[#1a1d24]">
        <button onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#8890a0] hover:bg-[#f05050]/10 hover:text-[#f05050] transition-all">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  )
}
