'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Add a small delay to ensure localStorage is ready
    const timer = setTimeout(() => {
      // Check if user is logged in
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      
      if (token) {
        try {
          // Verify token is valid by checking if user data exists
          const user = localStorage.getItem('user')
          if (user) {
            const userData = JSON.parse(user)
            // If logged in with valid user data, redirect to admin dashboard
            router.push('/admin')
          } else {
            // Token exists but no user data - clear and go to login
            localStorage.removeItem('token')
            router.push('/login')
          }
        } catch (e) {
          // Corrupted data - clear and go to login
          console.error('Error parsing user data:', e)
          localStorage.clear()
          router.push('/login')
        }
      } else {
        // If not logged in, redirect to login
        router.push('/login')
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'sans-serif',
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{ color: '#1B4FA5', marginBottom: '10px' }}>ALEM CRM</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>Redirecting to Dashboard...</p>
        <p style={{ color: '#999', fontSize: '12px', marginBottom: '20px' }}>Loading...</p>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #1B4FA5',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto',
        }}>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    </div>
  )
}
