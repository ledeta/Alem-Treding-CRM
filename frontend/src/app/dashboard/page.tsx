'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
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
            setUser(userData);
            
            // If user is admin, redirect to /admin
            if (userData.role === 'admin' || userData.role?.toLowerCase().includes('admin')) {
              router.push('/admin');
            } else if (userData.role === 'sales' || userData.role?.toLowerCase().includes('sales')) {
              // For sales users, redirect to /sales
              router.push('/sales');
            } else {
              // For other non-admin users, stay on dashboard
              setLoading(false);
            }
          } catch (e) {
            console.error('Failed to parse user data:', e);
            localStorage.clear();
            router.push('/login');
          }
        } else {
          localStorage.removeItem('token');
          router.push('/login');
        }
      } catch (err) {
        console.error('Dashboard error:', err);
        router.push('/login');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [router]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.clear();
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f5f5fa',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading Dashboard...</h2>
          <p>Welcome, {user?.fullName}!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f5f5fa',
    }}>
      {/* Main Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        padding: '20px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '500px' }}>
          <h1 style={{ color: '#1B4FA5', marginBottom: '20px', fontSize: '32px', fontWeight: 'bold' }}>Welcome to ALEM CRM</h1>
          <p style={{ fontSize: '18px', marginBottom: '30px', fontWeight: 'bold' }}>
            Hello, <strong>{user?.fullName}</strong>!
          </p>
          <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '20px' }}>
            You are logged in as a <strong>{user?.role}</strong> user.
          </p>
          <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Dashboard content for {user?.role} users will be displayed here.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar - Professional */}
      <div style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
        padding: '0',
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          height: '80px',
        }}>
          {/* Dashboard Button */}
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '13px',
              color: '#2563eb',
              backgroundColor: '#eff6ff',
              border: '1px solid #dbeafe',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '100px',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dbeafe';
              e.currentTarget.style.borderColor = '#bfdbfe';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#eff6ff';
              e.currentTarget.style.borderColor = '#dbeafe';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '20px' }}>📊</span>
            <span>Dashboard</span>
          </button>

          {/* Customers Button */}
          <button
            onClick={() => router.push('/admin/customers')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '13px',
              color: '#059669',
              backgroundColor: '#f0fdf4',
              border: '1px solid #dcfce7',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '100px',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dcfce7';
              e.currentTarget.style.borderColor = '#bbf7d0';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f0fdf4';
              e.currentTarget.style.borderColor = '#dcfce7';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '20px' }}>👥</span>
            <span>Customers</span>
          </button>

          {/* Account Button */}
          <button
            onClick={() => router.push('/profile')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '13px',
              color: '#dc2626',
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '100px',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fee2e2';
              e.currentTarget.style.borderColor = '#fecaca';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
              e.currentTarget.style.borderColor = '#fee2e2';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '20px' }}>👤</span>
            <span>Account</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '13px',
              color: '#dc2626',
              backgroundColor: '#fef2f2',
              border: '2px solid #dc2626',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              minWidth: '100px',
              gap: '6px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#dc2626';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
              e.currentTarget.style.color = '#dc2626';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '20px' }}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
