'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MOCK_REFUNDS } from '@/lib/mock-data'
import { Clock, CheckCircle } from 'lucide-react'

interface Refund {
  id: number
  invoiceNumber: string
  customer: string
  amount: number
  reason: string
  status: 'Pending' | 'Approved'
  createdAt: string
}

export default function RefundsPage() {
  const router = useRouter()
  const [refunds, setRefunds] = useState<Refund[]>(MOCK_REFUNDS)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved'>('all')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  const filteredRefunds = refunds.filter(r => {
    if (activeTab === 'pending') return r.status === 'Pending'
    if (activeTab === 'approved') return r.status === 'Approved'
    return true
  })

  const totalRefundAmount = filteredRefunds.reduce((sum, r) => sum + r.amount, 0)
  const pendingAmount = refunds.filter(r => r.status === 'Pending').reduce((sum, r) => sum + r.amount, 0)

  const approveRefund = (id: number) => {
    setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: 'Approved' as const } : r))
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '1.5rem' }}>
        ↩️ Refunds
      </h1>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '8px', padding: '1.5rem' }}>
            <p style={{ color: '#92400e', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>Pending Refunds</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>ETB {pendingAmount.toLocaleString()}</p>
          </div>
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '1.5rem' }}>
            <p style={{ color: '#166534', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>Total Approved</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>
              ETB {refunds.filter(r => r.status === 'Approved').reduce((sum, r) => sum + r.amount, 0).toLocaleString()}
            </p>
          </div>
          <div style={{ background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1.5rem' }}>
            <p style={{ color: '#1e40af', fontSize: '0.875rem', fontWeight: '500', margin: 0 }}>Total Refund Requests</p>
            <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0.5rem 0 0 0' }}>{refunds.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          {(['all', 'pending', 'approved'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.5rem 1rem',
                background: activeTab === tab ? '#667eea' : 'transparent',
                color: activeTab === tab ? 'white' : '#4a5568',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 500,
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({
                tab === 'all' ? filteredRefunds.length :
                tab === 'pending' ? refunds.filter(r => r.status === 'Pending').length :
                refunds.filter(r => r.status === 'Approved').length
              })
            </button>
          ))}
        </div>

        {/* Refunds List */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {filteredRefunds.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: '#f7fafc', borderRadius: '8px' }}>
              <p style={{ color: '#718096' }}>No refunds to show</p>
            </div>
          ) : (
            filteredRefunds.map(refund => (
              <div
                key={refund.id}
                style={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                  gap: '2rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    {refund.status === 'Pending' ? (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                      {refund.invoiceNumber}
                    </h3>
                    <span style={{
                      background: refund.status === 'Approved' ? '#dcfce7' : '#fef3c7',
                      color: refund.status === 'Approved' ? '#16a34a' : '#ca8a04',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}>
                      {refund.status}
                    </span>
                  </div>
                  <p style={{ color: '#718096', margin: '0.5rem 0 0 0' }}>{refund.reason}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#a0aec0', margin: 0 }}>Customer</p>
                      <p style={{ fontWeight: '500', margin: '0.25rem 0 0 0' }}>{refund.customer}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#a0aec0', margin: 0 }}>Amount</p>
                      <p style={{ fontWeight: '500', margin: '0.25rem 0 0 0' }}>ETB {refund.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#a0aec0', margin: 0 }}>Date Requested</p>
                      <p style={{ fontWeight: '500', margin: '0.25rem 0 0 0' }}>{new Date(refund.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {refund.status === 'Pending' && (
                  <button
                    onClick={() => approveRefund(refund.id)}
                    style={{
                      padding: '0.5rem 1.5rem',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    )
  }
