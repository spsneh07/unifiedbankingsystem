'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Users, CreditCard, ArrowLeftRight,
  BarChart2, ShieldAlert, Clock, GitBranch, Terminal,
  Bell, LogOut, ChevronLeft, ChevronRight, Landmark
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { mockAlerts } from '@/lib/mockData'
import { clearSession, getSession } from '@/lib/auth'

const allNav = [
  { href: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard',       roles: ['admin','employee','customer'] },
  { href: '/customers',       icon: Users,            label: 'Customers',       roles: ['admin','employee'] },
  { href: '/accounts',        icon: CreditCard,       label: 'Accounts',        roles: ['admin','employee','customer'] },
  { href: '/transactions',    icon: ArrowLeftRight,   label: 'Transactions',    roles: ['admin','employee','customer'] },
  { href: '/analytics',       icon: BarChart2,        label: 'Analytics',       roles: ['admin','employee','customer'] },
  { href: '/fraud',           icon: ShieldAlert,      label: 'Fraud Detection', roles: ['admin','employee'] },
  { href: '/scheduled',       icon: Clock,            label: 'Scheduled',       roles: ['admin','employee','customer'] },
  { href: '/branches',        icon: GitBranch,        label: 'Branches',        roles: ['admin'] },
  { href: '/query-dashboard', icon: Terminal,         label: 'Query Dashboard', roles: ['admin'] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [unreadAlerts, setUnreadAlerts] = useState(0)
  const session = getSession()
  const role = session?.role || 'customer'
  const nav = allNav.filter(item => item.roles.includes(role))

  const handleLogout = () => {
    clearSession()
    router.push('/')
  }

  useEffect(() => {
    fetch('/api/alerts')
      .then(res => res.json())
      .then(data => {
        if (data.success) setUnreadAlerts(data.unreadCount)
      })
      .catch(console.error)
  }, [pathname]) // refresh when navigating

  return (
    <aside
      style={{ width: collapsed ? 64 : 240, minWidth: collapsed ? 64 : 240 }}
      className="sticky top-0 h-screen bg-gray-50 dark:bg-[#0d0f14] border-r border-gray-200 dark:border-[#1a1d24] flex flex-col transition-all duration-300 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-[#1a1d24]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Landmark size={16} className="text-[#0a0c10]" />
            </div>
            <span className="font-display font-700 text-[15px] tracking-wide text-black dark:text-white">NexusBank</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center mx-auto">
            <Landmark size={16} className="text-[#0a0c10]" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#3d4455] hover:text-black dark:text-white transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${active ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-[#1a1d24] p-3 space-y-1">
        <Link href="/alerts" className={`sidebar-link ${collapsed ? 'justify-center px-0' : ''}`} title={collapsed ? 'Alerts' : undefined}>
          <div className="relative flex-shrink-0">
            <Bell size={18} />
            {unreadAlerts > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-[9px] flex items-center justify-center text-black dark:text-white font-bold">{unreadAlerts}</span>
            )}
          </div>
          {!collapsed && <span>Alerts <span className="ml-auto badge badge-red">{unreadAlerts}</span></span>}
        </Link>
        <button onClick={handleLogout} className={`sidebar-link w-full ${collapsed ? 'justify-center px-0' : ''} text-[#f05050] hover:text-[#f05050]`}>
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}
