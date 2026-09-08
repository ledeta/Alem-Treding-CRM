'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { BarChart3, MessageCircle, Users, CreditCard, User } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userFullName');
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin' || pathname === '/admin/';
    }
    return pathname.startsWith(path);
  };

  // Show different nav items based on route
  const navItems = pathname.includes('/sales') || pathname.includes('/chat') || pathname === '/profile'
    ? [] // No bottom nav for sales, chat, or profile pages
    : [
        { path: '/admin', label: 'Dashboard', icon: BarChart3, color: '#667eea' },
        { path: '/admin/chat-admin', label: 'Chat', icon: MessageCircle, color: '#48bb78' },
        { path: '/admin/customers', label: 'Customers', icon: Users, color: '#4299e1' },
        { path: '/admin/payments', label: 'Payments', icon: CreditCard, color: '#ed8936' },
        { path: '/admin/account', label: 'Account', icon: User, color: '#a855f7' },
      ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f5f7fa' }}>
      {/* Main Content */}
      <div style={{ flex: 1, paddingBottom: navItems.length > 0 ? '100px' : '0px' }}>
        {children}
      </div>

      {/* Bottom Navigation - Modern 5 Button Design */}
      {navItems.length > 0 && (
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 1) 100%)',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
        zIndex: 40,
        paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          height: '75px',
          paddingBottom: 'env(safe-area-inset-bottom)',
          gap: '8px',
          padding: '8px 12px',
          boxSizing: 'border-box',
        }}>
          {/* Navigation Items */}
          {navItems.map(({ path, label, icon: Icon, color }) => {
            const active = isActive(path);
            return (
              <button
                key={path}
                onClick={() => router.push(path)}
                style={{
                  flex: 1,
                  height: '60px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  padding: '8px 14px',
                  background: active 
                    ? `${color}10` 
                    : 'transparent',
                  border: 'none',
                  borderRadius: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  color: active ? color : '#6b7280',
                  fontWeight: active ? '700' : '600',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }
                }}
                title={label}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: active 
                      ? color 
                      : `${color}08`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: active 
                      ? `0 4px 12px ${color}25`
                      : 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Icon 
                    size={20} 
                    color={active ? 'white' : color}
                    strokeWidth={2}
                  />
                </div>
                <span style={{ fontSize: '10px', letterSpacing: '-0.3px' }}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      )}
    </div>
  );
}
