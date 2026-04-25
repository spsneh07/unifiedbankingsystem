'use client'
import { Bell, Search, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'
import { mockUser } from '@/lib/mockData'
import { useToast } from '@/components/ui/Toast'

export default function Header({ title }: { title?: string }) {
  const [dark, setDark] = useState(true)
  const [unreadAlerts, setUnreadAlerts] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/alerts')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUnreadAlerts(data.unreadCount)
          if (data.unreadCount > 0) {
            toast('info', `You have ${data.unreadCount} unread alerts.`)
          }
        }
      })
      .catch(console.error)
  }, [])

  return (
    <header className="h-16 border-b border-[#1a1d24] bg-[#0d0f14] flex items-center px-6 gap-4 sticky top-0 z-30">
      {title && (
        <h1 className="font-display font-700 text-[17px] text-white mr-4">{title}</h1>
      )}
      <div className="flex-1 max-w-sm">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3d4455]" />
          <input className="input pl-9 py-2 text-sm" placeholder="Search accounts, customers…" />
        </div>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <button onClick={() => setDark(!dark)} className="w-9 h-9 rounded-lg bg-[#1a1d24] flex items-center justify-center text-[#8890a0] hover:text-white transition-colors">
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <a href="/alerts" className="relative w-9 h-9 rounded-lg bg-[#1a1d24] flex items-center justify-center text-[#8890a0] hover:text-white transition-colors">
          <Bell size={16} />
          {unreadAlerts > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full" />}
        </a>
        <div className="flex items-center gap-2 pl-3 border-l border-[#1a1d24]">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-[#0a0c10] font-display font-700 text-sm">
            {mockUser.avatar}
          </div>
          <div className="hidden sm:block">
            <div className="text-[13px] font-display font-600 text-white leading-tight">{mockUser.name}</div>
            <div className="text-[11px] text-[#8890a0] capitalize">{mockUser.role}</div>
          </div>
        </div>
      </div>
    </header>
  )
}
