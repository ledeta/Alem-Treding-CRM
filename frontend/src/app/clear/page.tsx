'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ClearCachePage() {
  const router = useRouter()

  useEffect(() => {
    // Clear all localStorage
    localStorage.clear()
    
    // Show message for 1.5 seconds then redirect
    const timer = setTimeout(() => {
      router.push('/login')
    }, 1500)
    
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
        <h1 style={{ color: '#27ae60', marginBottom: '10px' }}>Cache Cleared!</h1>
        <p style={{ color: '#666', marginBottom: '20px' }}>Local data has been cleared.</p>
        <p style={{ color: '#999', fontSize: '12px' }}>Redirecting to login...</p>
      </div>
    </div>
  )
}
