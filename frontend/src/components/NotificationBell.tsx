'use client';

import { useState, useEffect, useRef } from 'react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  createdAt: Date | string;
  isRead: boolean;
}

// Mock notifications - real-time feature unavailable due to backend issues
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: 'System Notification',
    message: 'Backend is currently unavailable. Real-time notifications will be available soon.',
    type: 'info',
    createdAt: new Date(),
    isRead: false,
  },
];

export default function NotificationBell() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [unreadCount, setUnreadCount] = useState(1);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get userId from localStorage
  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserId(userData.id);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'approval':
      case 'payment_request':
        return '💳';
      case 'credit_request':
        return '💵';
      case 'refund_request':
        return '↩️';
      case 'upload':
        return '📤';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      case 'system':
        return '🔔';
      default:
        return '📢';
    }
  };

  const getTimeAgo = (date: string | Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Show connection status in the bell icon
  const bellColor = 'rgba(239, 68, 68, 1)'; // Always show disconnected state
  const bellTitle = 'Notifications (Offline - Backend Unavailable)';

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        title={bellTitle}
        style={{
          position: 'relative',
          background: 'none',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '0.5rem',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          fontSize: '1.25rem',
          color: bellColor,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: 'var(--error)',
              color: 'white',
              borderRadius: '9999px',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
              fontWeight: '600',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showNotifications && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: 0,
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            boxShadow: 'var(--shadow-xl)',
            width: '400px',
            maxHeight: '500px',
            zIndex: 1000,
          }}
          className="animate-slideIn"
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  color: 'var(--text-secondary)',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔕</div>
                <div>No notifications</div>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => markAsRead(notif.id)}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--border-light)',
                    cursor: 'pointer',
                    background: notif.isRead ? 'transparent' : 'rgba(102, 126, 234, 0.05)',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--background)')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = notif.isRead
                      ? 'transparent'
                      : 'rgba(102, 126, 234, 0.05)')
                  }
                >
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>{getIcon(notif.type)}</div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: notif.isRead ? '500' : '600',
                          marginBottom: '0.25rem',
                          fontSize: '0.875rem',
                        }}
                      >
                        {notif.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {notif.message}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                        {getTimeAgo(notif.createdAt)}
                      </div>
                    </div>
                    {!notif.isRead && (
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          flexShrink: 0,
                          marginTop: '0.5rem',
                        }}
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div
              style={{
                padding: '1rem',
                borderTop: '1px solid var(--border)',
                textAlign: 'center',
              }}
            >
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
