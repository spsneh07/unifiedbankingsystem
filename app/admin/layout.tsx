'use client'
import AdminSidebar from '@/components/layout/AdminSidebar'
import Header from '@/components/layout/Header'
import RoleGuard from '@/components/auth/RoleGuard'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="admin">
      <div className="flex min-h-screen bg-[#0a0c10]">
        <AdminSidebar />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </main>
      </div>
    </RoleGuard>
  )
}
