'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatNav from '@/components/ChatNav';

export default function ChatSalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        
        // Check if user is admin or sales
        if (userData.role !== 'admin' && userData.role !== 'sales') {
          router.push('/sales');
          return;
        }
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }

    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{ fontSize: '1.25rem', color: 'white' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', paddingBottom: '120px' }}>
      {children}
      <ChatNav />
    </div>
  );
}
