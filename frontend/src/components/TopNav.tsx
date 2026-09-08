'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NotificationBell from './NotificationBell';
import SearchBox from './SearchBox';

interface TopNavProps {
  user: any;
  onMenuClick: () => void;
  onLogout: () => void;
}

export default function TopNav({ user, onMenuClick, onLogout }: TopNavProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setShowUserMenu(false);
    router.push('/settings');
  };

  const handleSettingsClick = () => {
    setShowUserMenu(false);
    router.push('/settings');
  };

  return (
    <header
      style={{
        height: '80px',
        background: 'white',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Left Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <button
          onClick={onMenuClick}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '8px',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--background)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        >
          ☰
        </button>

        <SearchBox />
      </div>

      {/* Right Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <NotificationBell />

        {/* User Menu */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '600',
              }}
            >
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '600', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                {user?.fullName || 'User'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {user?.role || 'User'}
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>▼</span>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 0.5rem)',
                right: 0,
                background: 'white',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
                minWidth: '200px',
                zIndex: 1000,
              }}
              className="animate-slideIn"
            >
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{user?.fullName}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{user?.email}</div>
              </div>

              <div style={{ padding: '0.5rem' }}>
                <button
                  onClick={handleProfileClick}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--background)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>👤</span>
                  <span>Profile</span>
                </button>

                <button
                  onClick={handleSettingsClick}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    textAlign: 'left',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--background)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>⚙️</span>
                  <span>Settings</span>
                </button>

                <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0' }} />

                <button
                  onClick={onLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    color: 'var(--error)',
                    textAlign: 'left',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245, 101, 101, 0.1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>🚪</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
