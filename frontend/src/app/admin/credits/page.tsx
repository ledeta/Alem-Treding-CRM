'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MOCK_CREDITS } from '@/lib/mock-data'
import { TrendingUp } from 'lucide-react'

interface Credit {
  id: number
  customer: string
  amount: number
  usedAmount: number
  remainingAmount: number
  expiryDate: string
  status: 'Active' | 'Expired'
}

export default function CreditsPage() {
  const router = useRouter()
  const [credits, setCredits] = useState<Credit[]>(MOCK_CREDITS)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  const totalCredit = credits.reduce((sum, c) => sum + c.amount, 0)
  const totalUsed = credits.reduce((sum, c) => sum + c.usedAmount, 0)
  const totalRemaining = credits.reduce((sum, c) => sum + c.remainingAmount, 0)
  const utilizationRate = totalCredit > 0 ? Math.round((totalUsed / totalCredit) * 100) : 0

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1.5rem' }}>
        💵 Credit Management
      </h1>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0, color: '#6b7280' }}>Total Credit Available</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>ETB {totalCredit.toLocaleString()}</p>
          </div>
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0, color: '#1e40af' }}>Total Used</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>ETB {totalUsed.toLocaleString()}</p>
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0, color: '#166534' }}>Remaining</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>ETB {totalRemaining.toLocaleString()}</p>
          </div>
          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0, color: '#92400e' }}>Utilization Rate</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>{utilizationRate}%</p>
          </div>
        </div>

        {/* Credits List */}
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#4a5568' }}>Customer</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#4a5568' }}>Total Credit</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#4a5568' }}>Used</th>
                <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#4a5568' }}>Remaining</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#4a5568' }}>Usage %</th>
                <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#4a5568' }}>Expiry</th>
              </tr>
            </thead>
            <tbody>
              {credits.map(credit => {
                const usage = credit.amount > 0 ? Math.round((credit.usedAmount / credit.amount) * 100) : 0
                return (
                  <tr
                    key={credit.id}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      background: usage > 80 ? '#fef2f2' : undefined,
                    }}
                  >
                    <td style={{ padding: '1rem', fontWeight: '500' }}>{credit.customer}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>ETB {credit.amount.toLocaleString()}</td>
                    <td style={{ padding: '1rem', textAlign: 'right', color: usage > 80 ? '#dc2626' : '#4a5568' }}>
                      ETB {credit.usedAmount.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '500' }}>
                      ETB {credit.remainingAmount.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <div style={{
                        background: usage > 80 ? '#fee2e2' : '#f0fdf4',
                        color: usage > 80 ? '#dc2626' : '#16a34a',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        display: 'inline-block',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                      }}>
                        {usage}%
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#718096' }}>
                      {new Date(credit.expiryDate).toLocaleDateString()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
