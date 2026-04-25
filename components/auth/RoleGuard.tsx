'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: 'admin' | 'employee' | 'customer';
}

export default function RoleGuard({ children, allowedRole }: RoleGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const session = getSession();
    console.log('RoleGuard Debug:', { pathname: window.location.pathname, sessionRole: session?.role, allowedRole });
    
    if (!session) {
      console.log('RoleGuard: No session, redirecting to login');
      router.push('/auth/login');
      return;
    }

    const userRole = session.role?.toLowerCase();
    const targetRole = allowedRole.toLowerCase();

    if (userRole !== targetRole) {
      console.log(`RoleGuard: Role mismatch (${userRole} vs ${targetRole}), redirecting to dashboard`);
      
      if (userRole === 'admin') router.push('/admin');
      else if (userRole === 'employee') router.push('/employee');
      else router.push('/dashboard');
      return;
    }

    setAuthorized(true);
  }, [allowedRole, router]);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0c10] text-[#8890a0] font-display">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin mb-4" />
          Verifying security credentials...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
