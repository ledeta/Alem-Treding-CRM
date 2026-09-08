'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface SalesLayoutProps {
  children: ReactNode;
}

export default function SalesLayout({ children }: SalesLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!storedToken) {
      router.push('/login');
      return;
    }

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (e) {
        router.push('/login');
        return;
      }
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Main Content */}
      <div style={{ flex: 1, paddingBottom: '20px' }}>
        {children}
      </div>
    </div>
  );
}
