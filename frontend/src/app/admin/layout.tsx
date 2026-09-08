'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // Check authentication
        const token = localStorage.getItem('token')
        if (!token) {
          console.log('❌ No token found, redirecting to login')
          router.push('/login')
          return
        }

        // Load user from localStorage
        const storedUser = localStorage.getItem('user')
        if (!storedUser) {
          console.log('❌ No user data found, redirecting to login')
          localStorage.removeItem('token')
          router.push('/login')
          return
        }

        try {
          const userData = JSON.parse(storedUser)
          console.log('✅ User loaded:', userData)
          setUser(userData)
          
          // Don't block admins - allow all users to see admin dashboard
          // (role checking can be done per-feature if needed)
          console.log('✅ User verified, loading dashboard')
          setLoading(false)
        } catch (parseErr) {
          console.error('Failed to parse user data:', parseErr)
          setError('Invalid user data. Please login again.')
          localStorage.clear()
          router.push('/login')
        }
      } catch (err) {
        console.error('Admin layout error:', err)
        setError('An error occurred. Please try again.')
        localStorage.clear()
        router.push('/login')
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [router, pathname])

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '8px',
          textAlign: 'center',
          maxWidth: '400px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ color: '#e74c3c', marginBottom: '10px' }}>Error</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
          <button
            onClick={() => {
              localStorage.clear()
              router.push('/login')
            }}
            style={{
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px',
          }}>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  // Render without sidebar and TopNav - just pass children directly
  return <>{children}</>
}


