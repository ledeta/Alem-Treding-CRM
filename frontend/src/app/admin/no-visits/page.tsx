'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MOCK_NO_VISITS } from '@/lib/mock-data'
import { AlertTriangle, Mail, Phone } from 'lucide-react'

interface InactiveCustomer {
  id: number
  name: string
  customerIdRef: string
  lastVisitDate: string
  phone: string
  email: string
  status: string
}

export default function NoVisitsPage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<InactiveCustomer[]>(MOCK_NO_VISITS)
  const [contacted, setContacted] = useState<Set<number>>(new Set())

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    }
  }, [router])

  const handleContact = (id: number) => {
    setContacted(prev => new Set(prev).add(id))
  }

  const daysSinceVisit = (date: string) => {
    const lastVisit = new Date(date).getTime()
    const now = new Date().getTime()
    return Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24))
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1a202c', marginBottom: '0.5rem' }}>
        ⚠️ No Visits (15+ Days)
      </h1>
        <p style={{ color: '#718096', marginBottom: '1.5rem' }}>
          Customers who haven't made a purchase in 15 or more days
        </p>

        {/* Alert */}
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 style={{ fontWeight: '600', margin: 0, color: '#92400e' }}>At Risk Customers</h3>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#b45309' }}>
              {customers.length} customer{customers.length !== 1 ? 's' : ''} need immediate attention
            </p>
          </div>
        </div>

        {/* Customers List */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {customers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', background: '#f7fafc', borderRadius: '8px' }}>
              <p style={{ color: '#718096' }}>Great! All customers are active.</p>
            </div>
          ) : (
            customers.map(customer => {
              const daysSince = daysSinceVisit(customer.lastVisitDate)
              const isContacted = contacted.has(customer.id)
              return (
                <div
                  key={customer.id}
                  style={{
                    background: isContacted ? '#f0fdf4' : 'white',
                    border: isContacted ? '2px solid #86efac' : '2px solid #fca5a5',
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
                      <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                        {customer.name}
                      </h3>
                      <span style={{
                        background: daysSince >= 30 ? '#fee2e2' : '#fef3c7',
                        color: daysSince >= 30 ? '#dc2626' : '#ca8a04',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                      }}>
                        {daysSince} days
                      </span>
                      {isContacted && (
                        <span style={{
                          background: '#dcfce7',
                          color: '#16a34a',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                        }}>
                          ✓ Contacted
                        </span>
                      )}
                    </div>
                    <p style={{ color: '#718096', margin: '0.5rem 0 0 0', fontSize: '0.875rem' }}>
                      ID: {customer.customerIdRef}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#a0aec0', margin: 0, fontWeight: '500' }}>Last Visit</p>
                        <p style={{ fontWeight: '500', margin: '0.25rem 0 0 0' }}>
                          {new Date(customer.lastVisitDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#a0aec0', margin: 0, fontWeight: '500' }}>Phone</p>
                        <p style={{ fontWeight: '500', margin: '0.25rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: '#a0aec0', margin: 0, fontWeight: '500' }}>Email</p>
                        <p style={{ fontWeight: '500', margin: '0.25rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {!isContacted && (
                    <button
                      onClick={() => handleContact(customer.id)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      📞 Contact
                    </button>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    )
  }
