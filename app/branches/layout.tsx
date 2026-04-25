'use client';
import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import CustomerSidebar from '@/components/layout/CustomerSidebar';
import AdminSidebar from '@/components/layout/AdminSidebar';
import EmployeeSidebar from '@/components/layout/EmployeeSidebar';
import Header from '@/components/layout/Header';

export default function BranchesLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSession(getSession());
  }, []);

  if (!mounted) return null;

  // If not logged in, show a minimal version or just the children
  if (!session) {
    return (
      <div className="min-h-screen bg-[#0a0c10] flex flex-col">
        <Header title="Branch Locator" />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    );
  }

  const role = session.role?.toLowerCase();

  return (
    <div className="flex min-h-screen bg-[#0a0c10]">
      {role === 'admin' && <AdminSidebar />}
      {role === 'employee' && <EmployeeSidebar />}
      {role === 'customer' && <CustomerSidebar />}
      
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Header title="Branch Locator" />
        <div className="flex-1 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
