'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminBottomNav from '@/components/AdminBottomNav'
import { User, Mail, Phone, Calendar, LogOut, MapPin, Shield, Edit2 } from 'lucide-react'

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    const userFullName = localStorage.getItem('userFullName')
    const userRole = localStorage.getItem('userRole')

    if (!token) {
      router.push('/login')
      return
    }

    try {
      const userData = storedUser ? JSON.parse(storedUser) : {}
      setUser({
        ...userData,
        fullName: userFullName || userData.fullName || 'User',
        role: userRole || userData.role || 'user',
        email: userData.email || 'user@alemcrm.com',
        phone: userData.phone || '+251911234567',
        address: userData.address || 'Addis Ababa, Ethiopia',
        joinDate: userData.createdAt || new Date().toISOString(),
      })
    } catch (e) {
      router.push('/login')
      return
    }

    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userFullName')
    router.push('/login')
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    } catch {
      return 'N/A'
    }
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f7fa' }}>
        <div style={{ background: 'white', padding: '3rem', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
          <div style={{ width: '50px', height: '50px', border: '4px solid #f0f0f0', borderTop: '4px solid #a855f7', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: '#718096', fontSize: '1rem' }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <>
      <div style={{ background: '#f5f7fa', minHeight: '100vh', paddingBottom: '140px' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', color: 'white', padding: '2rem 1.5rem', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.2)' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                <User size={32} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>My Account</h1>
                <p style={{ fontSize: '0.9rem', margin: '0.5rem 0 0 0', opacity: 0.9 }}>Manage your profile and settings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          {/* Profile Card */}
          <div style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', border: '1px solid #f0f0f0', overflow: 'hidden', marginBottom: '2rem' }}>
            {/* Profile Header */}
            <div style={{ background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', padding: '3rem 2rem', display: 'flex', alignItems: 'flex-end', gap: '2rem', position: 'relative' }}>
              {/* Avatar */}
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '3rem',
                fontWeight: '700',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '3px solid rgba(255, 255, 255, 0.3)',
              }}>
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </div>

              {/* User Info */}
              <div style={{ flex: 1, color: 'white' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
                  {user?.fullName}
                </h2>
                <p style={{ fontSize: '1rem', opacity: 0.9, margin: '0.5rem 0 0 0', textTransform: 'capitalize' }}>
                  {user?.role === 'admin' ? 'Administrator' : 'Sales Representative'}
                </p>
              </div>

              {/* Edit Button */}
              <button
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'
                }}
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            </div>

            {/* Profile Details */}
            <div style={{ padding: '3rem 2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                {/* Email */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Mail size={22} color='#0284c7' />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</p>
                      <p style={{ fontSize: '0.95rem', color: '#111827', fontWeight: '600', margin: '0.25rem 0 0 0' }}>{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Phone size={22} color='#ca8a04' />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number</p>
                      <p style={{ fontSize: '0.95rem', color: '#111827', fontWeight: '600', margin: '0.25rem 0 0 0' }}>{user?.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Shield size={22} color='#16a34a' />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Role</p>
                      <p style={{ fontSize: '0.95rem', color: '#111827', fontWeight: '600', margin: '0.25rem 0 0 0', textTransform: 'capitalize' }}>
                        {user?.role === 'admin' ? 'Administrator' : 'Sales Representative'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Join Date */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={22} color='#0284c7' />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Member Since</p>
                      <p style={{ fontSize: '0.95rem', color: '#111827', fontWeight: '600', margin: '0.25rem 0 0 0' }}>{formatDate(user?.joinDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin size={22} color='#dc2626' />
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: '600', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</p>
                      <p style={{ fontSize: '0.95rem', color: '#111827', fontWeight: '600', margin: '0.25rem 0 0 0' }}>{user?.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{ background: '#fee2e2', borderRadius: '16px', border: '2px solid #fecaca', padding: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#991b1b', margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }}></div>
              Danger Zone
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#7f1d1d', margin: '0 0 1.5rem 0', lineHeight: '1.5' }}>
              Once you logout, you will need to login again with your credentials. Your session will be terminated securely.
            </p>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#b91c1c'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#dc2626'
              }}
            >
              <LogOut size={18} />
              Logout from Account
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }} onClick={() => setShowLogoutConfirm(false)}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
            padding: '2.5rem',
            maxWidth: '450px',
            width: '100%',
            textAlign: 'center',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontSize: '2.5rem' }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: '0 0 0.75rem 0' }}>Logout Confirmation</h2>
            <p style={{ fontSize: '0.95rem', color: '#6b7280', margin: '0 0 1.5rem 0', lineHeight: '1.6' }}>
              Are you sure you want to logout? You will need to login again with your credentials to access the system.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e5e7eb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f3f4f6'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#b91c1c'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#dc2626'
                }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </>
  )
}
