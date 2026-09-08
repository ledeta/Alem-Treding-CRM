'use client'

import Link from 'next/link'

export default function NotFound() {
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
          fontSize: '3rem',
          fontWeight: 'bold',
          color: '#667eea',
          marginBottom: '0.5rem'
        }}>
          404
        </h1>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: '#2d3748',
          marginBottom: '1rem'
        }}>
          Page Not Found
        </h2>
        <p style={{
          color: '#666',
          marginBottom: '2rem',
          fontSize: '0.95rem'
        }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <button style={{
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
            Go Back Home
          </button>
        </Link>
      </div>
    </div>
  )
}
