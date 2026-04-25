'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, CreditCard, ArrowLeftRight,
  LogOut, Landmark
} from 'lucide-react'
import { clearSession } from '@/lib/auth'

const nav = [
  { href: '/employee', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/employee/customers', icon: Users, label: 'Customers' },
  { href: '/employee/accounts', icon: CreditCard, label: 'Accounts' },
  { href: '/employee/transactions', icon: ArrowLeftRight, label: 'Transactions' },
]

export default function EmployeeSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <aside className="h-screen sticky top-0 w-64 bg-gray-50 dark:bg-[#0d0f14] border-r border-gray-200 dark:border-[#1a1d24] flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#4090f0] flex items-center justify-center">
          <Landmark size={18} className="text-[#0a0c10]" />
        </div>
        <div>
          <span className="font-display font-800 text-black dark:text-white text-[16px] block leading-tight">Nexus<span className="text-[#4090f0]">Ops</span></span>
          <span className="text-[10px] text-[#4090f0]/60 font-600 tracking-[0.15em]">EMPLOYEE</span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {nav.map(item => {
          const active = pathname === item.href || (item.href !== '/employee' && pathname.startsWith(item.href + '/'))
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all ${active ? 'bg-[#4090f0]/10 text-[#4090f0]' : 'text-[#8890a0] hover:bg-[#1a1d24] hover:text-black dark:text-white'}`}>
              <item.icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-[#1a1d24]">
        <button onClick={() => { clearSession(); router.push('/') }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-[#8890a0] hover:bg-[#f05050]/10 hover:text-[#f05050] transition-all">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  )
}
