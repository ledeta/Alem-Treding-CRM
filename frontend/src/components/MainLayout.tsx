'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Get auth state from Zustand store
  const { token, user: authStoreUser, logout: zustandLogout } = useAuthStore();

  useEffect(() => {
    // Immediate auth check - no delay to prevent route issues
    const storedToken = localStorage.getItem('token');
    const storeToken = token;
    
    // Check if we have a token from either source
    if (!storedToken && !storeToken) {
      router.push('/login');
      return;
    }

    // Load user from Zustand store first, then fall back to localStorage
    const userData = authStoreUser || 
      (() => {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
      })();

    if (userData) {
      setUser(userData);
    }

    setLoading(false);
  }, [token, authStoreUser, router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    zustandLogout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  return (
    <main
      style={{
        padding: '2rem',
        minHeight: '100vh',
        paddingBottom: '140px',
        background: '#f5f7fa',
      }}
    >
      {children}
    </main>
  );
}
