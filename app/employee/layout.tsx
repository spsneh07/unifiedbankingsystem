'use client'
import EmployeeSidebar from '@/components/layout/EmployeeSidebar'
import Header from '@/components/layout/Header'
import RoleGuard from '@/components/auth/RoleGuard'

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRole="employee">
      <div className="flex min-h-screen bg-[#0a0c10]">
        <EmployeeSidebar />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <Header />
          <div className="flex-1 overflow-y-auto">{children}</div>
        </main>
      </div>
    </RoleGuard>
  )
}
