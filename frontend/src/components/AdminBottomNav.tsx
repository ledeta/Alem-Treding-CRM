'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import {
  BarChart3,
  MessageCircle,
  Users,
  CreditCard,
  User,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function AdminBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [forceShow, setForceShow] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      
      const user = JSON.parse(userData);
      const isAdminOrSales = user.role === 'admin' || user.role === 'sales' || user.role?.toLowerCase().includes('admin') || user.role?.toLowerCase().includes('sales');
      setIsAdmin(isAdminOrSales);
    } catch (e) {
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check modal state
  useEffect(() => {
    const checkModalState = () => {
      const isModalOpen = localStorage.getItem('modalOpen') === 'true'
      setModalOpen(isModalOpen)
    }

    checkModalState()
    
    // Listen for storage changes
    window.addEventListener('storage', checkModalState)
    
    // Also check periodically for modal state changes
    const interval = setInterval(checkModalState, 100)
    
    return () => {
      window.removeEventListener('storage', checkModalState)
      clearInterval(interval)
    }
  }, [])

  // Auto-hide/show nav on scroll
  useEffect(() => {
    setIsVisible(true); // Always keep visible
  }, []);

  const shouldShowNav = () => {
    if (isLoading) return false;
    if (!isAdmin) return false;
    if (pathname.includes('/login') || pathname.includes('/register') || pathname.includes('/forgot-password')) {
      return false;
    }
    if (pathname.includes('/profile')) {
      return false;
    }
    // Show nav for /admin OR /sales paths
    if (pathname.startsWith('/admin') || pathname.startsWith('/sales')) {
      return true;
    }
    return false;
  };

  if (!shouldShowNav()) {
    return null;
  }

  // Hide nav if modal is open
  if (modalOpen) {
    return null;
  }

  // Show different nav items based on path
  const isSalesPath = pathname.startsWith('/sales');
  
  const navItems = isSalesPath ? [
    { id: 'sales', label: 'Sales Dashboard', path: '/sales', icon: BarChart3, color: '#3b82f6' },
    { id: 'chat', label: 'Messaging', path: '/sales/chat', icon: MessageCircle, color: '#10b981' },
    { id: 'requests', label: 'Transactions', path: '/sales/requests', icon: Users, color: '#f59e0b' },
  ] : [
    { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: BarChart3, color: '#667eea' },
    { id: 'chat', label: 'Chat', path: '/admin/chat-admin', icon: MessageCircle, color: '#48bb78' },
    { id: 'customers', label: 'Customers', path: '/admin/customers', icon: Users, color: '#4299e1' },
    { id: 'payments', label: 'Payments', path: '/admin/payments', icon: CreditCard, color: '#ed8936' },
    { id: 'account', label: 'Account', path: '/admin/users', icon: User, color: '#9f7aea' },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin' || pathname === '/admin/';
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
        bottom: '0px',
        left: 0,
        right: 0,
        width: '100%',
        height: '75px',
        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(250, 251, 252, 1) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: '1.5px solid rgba(59, 130, 246, 0.1)',
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.08), 0 -4px 16px rgba(59, 130, 246, 0.04)',
        zIndex: 40,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: '8px',
        paddingTop: '10px',
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
        paddingRight: '8px',
      }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0px',
                padding: '0px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                flex: 1,
                minHeight: '52px',
                position: 'relative',
                fontFamily: 'inherit',
              }}
            >
              {/* Icon Only - No Background Frame */}
              <IconComponent 
                size={24} 
                color={active ? item.color : '#9ca3af'}
                strokeWidth={2.5}
                style={{
                  marginBottom: '4px',
                  transition: 'all 0.3s ease',
                  transform: active ? 'scale(1.15)' : 'scale(1)',
                }}
              />

              {/* Label - Clean */}
              <div
                style={{
                  fontSize: '8px',
                  fontWeight: active ? 800 : 700,
                  color: active ? item.color : '#9ca3af',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                  transition: 'all 0.3s ease',
                  letterSpacing: '-0.2px',
                  lineHeight: '1.2',
                  textTransform: 'uppercase',
                  paddingX: '2px',
                }}
              >
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Hide/Unhide Button - Professional */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35)',
          zIndex: 41,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
          fontSize: '18px',
          fontWeight: 700,
        }}
        title={isVisible ? 'Hide navigation' : 'Show navigation'}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 24px rgba(59, 130, 246, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.35)';
        }}
      >
        {isVisible ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
      </button>
    </div>
  );
}
