'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#e53e3e',
          marginBottom: '1rem'
        }}>
          ⚠️ Something went wrong!
        </h1>
        <p style={{
          color: '#666',
          marginBottom: '1.5rem',
          fontSize: '0.95rem'
        }}>
          {error.message || 'An unexpected error occurred'}
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#5568d3')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#667eea')}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
