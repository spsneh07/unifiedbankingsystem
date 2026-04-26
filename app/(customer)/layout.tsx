'use client'
import CustomerSidebar from '@/components/layout/CustomerSidebar'
import Header from '@/components/layout/Header'
import RoleGuard from '@/components/auth/RoleGuard'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="customer">
      <div className="flex min-h-screen bg-[#f8f9fa] dark:bg-[#0a0c10]">
        <CustomerSidebar />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </main>
      </div>
    </RoleGuard>
  )
}
