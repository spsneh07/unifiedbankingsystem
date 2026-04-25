'use client';
import { useEffect, useState } from 'react';
import { getSession } from '@/lib/auth';
import Link from 'next/link';

export default function FooterBranchLink() {
  const [href, setHref] = useState('/branches');

  useEffect(() => {
    const session = getSession();
    if (session?.role === 'admin') {
      setHref('/admin/branches');
    } else if (session?.role === 'employee') {
      // Employees can also see the admin branch view or a separate one
      setHref('/admin/branches');
    } else {
      setHref('/branches');
    }
  }, []);

  return (
    <a href={href} style={{ fontSize: 14, color: '#8890a0', transition: 'color 0.2s' }} className="nav-link">
      Branch Locator
    </a>
  );
}
