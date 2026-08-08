'use client'
import { useState } from 'react'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Header from '@/components/layout/Header'
import RoleGuard from '@/components/auth/RoleGuard'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <RoleGuard allowedRole="admin">
      <div className="flex min-h-screen bg-[#0a0c10]">
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
        <div className={`fixed inset-y-0 left-0 z-50 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0`}>
          <AdminSidebar />
        </div>
        <main className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
          <div className="flex-1 overflow-y-auto" onClick={() => setIsMobileMenuOpen(false)}>{children}</div>
        </main>
      </div>
    </RoleGuard>
  )
}
