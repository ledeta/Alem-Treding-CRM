'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  MessageCircle,
  Users,
  CreditCard,
  User,
} from 'lucide-react';

export default function SalesBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSales, setIsSales] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        setIsSales(false);
        setIsLoading(false);
        return;
      }
      
      const user = JSON.parse(userData);
      const isSalesUser = user.role === 'sales' || user.role?.toLowerCase().includes('sales');
      setIsSales(isSalesUser);
    } catch (e) {
      setIsSales(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-hide/show nav on scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } 
      else if (currentScrollY > lastScrollY && currentScrollY > 150) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [lastScrollY]);

  const shouldShowNav = () => {
    if (isLoading) return false;
    if (pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/forgot-password')) {
      return false;
    }
    if (pathname.includes('/sales')) {
      return true;
    }
    return false;
  };

  if (!shouldShowNav()) {
    return null;
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/sales', icon: BarChart3, color: '#667eea' },
    { id: 'chat', label: 'Chat', path: '/sales/chat', icon: MessageCircle, color: '#48bb78' },
    { id: 'customers', label: 'Customers', path: '/sales/requests', icon: Users, color: '#4299e1' },
    { id: 'payments', label: 'Payments', path: '/sales/payments', icon: CreditCard, color: '#ed8936' },
    { id: 'account', label: 'Account', path: '/profile', icon: User, color: '#a855f7' },
  ];

  const isActive = (path: string) => {
    if (path === '/sales') {
      return pathname === '/sales' || pathname === '/sales/';
    }
    return pathname.startsWith(path);
  };

  const handleNavClick = (path: string) => {
    router.push(path);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: isVisible ? '0px' : '-65px',
        left: 0,
        right: 0,
        width: '100%',
        height: '65px',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.99) 0%, rgba(255, 255, 255, 1) 100%)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)',
        zIndex: 40,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '8px',
        paddingTop: '8px',
        paddingLeft: '8px',
        paddingRight: '8px',
        boxSizing: 'border-box',
        gap: '2px',
        overflow: 'hidden',
        transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Navigation Buttons Container */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        flex: 1,
        gap: '4px',
      }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                padding: '8px 12px',
                background: active ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                flex: 1,
                minWidth: '60px',
                transition: 'all 0.2s ease',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = active ? 'rgba(102, 126, 234, 0.1)' : 'transparent';
              }}
            >
              <Icon
                size={20}
                strokeWidth={2}
                style={{
                  color: active ? item.color : '#999',
                  transition: 'color 0.2s ease',
                }}
              />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: active ? '600' : '500',
                  color: active ? item.color : '#666',
                  transition: 'color 0.2s ease',
                  textAlign: 'center',
                  lineHeight: 1,
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
