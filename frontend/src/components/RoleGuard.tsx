'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RoleGuardProps {
  requiredRoles: string[];
  children: React.ReactNode;
}

export default function RoleGuard({ requiredRoles, children }: RoleGuardProps) {
  const router = useRouter();

  useEffect(() => {
    const user = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const userData = JSON.parse(user);
      const userRole = userData.role || userData.roleId;

      // Normalize role name for comparison
      const normalizedRole = userRole?.toLowerCase?.() || '';
      const hasAccess = requiredRoles.some(role => 
        normalizedRole.includes(role.toLowerCase()) || 
        normalizedRole === role.toLowerCase()
      );

      if (!hasAccess) {
        // Redirect to dashboard if they don't have access
        router.push('/dashboard');
      }
    } catch (error) {
      router.push('/login');
    }
  }, [requiredRoles, router]);

  return <>{children}</>;
}
