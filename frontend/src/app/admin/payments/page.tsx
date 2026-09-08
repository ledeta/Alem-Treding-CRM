'use client'

import { useState, useEffect } from 'react'
import AdminBottomNav from '@/components/AdminBottomNav'
import { CreditCard, Check, X } from 'lucide-react'

interface ConfirmedTransaction {
  id: number
  customer: string
  type: 'Payment' | 'Credit'
  amount: string
  additional?: string
  date: string
  status: 'Approved' | 'Pending' | 'Rejected'
  approvalStatus?: 'pending' | 'approved' | 'rejected'
}

export default function PaymentsPage() {
  const [activeSection, setActiveSection] = useState<'approvals' | 'transactions'>('approvals')
  const [confirmedTransactions, setConfirmedTransactions] = useState<ConfirmedTransaction[]>([])
  const [isConfirmedMinimized, setIsConfirmedMinimized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch sales requests from multiple sources
    const fetchPaymentRequests = async () => {
      try {
        setIsLoading(true)
        
        let transactions: ConfirmedTransaction[] = []

        // Try 1: Load from confirmed_transactions (same source as customers page)
        const storedConfirmedTransactions = localStorage.getItem('confirmed_transactions')
        if (storedConfirmedTransactions) {
          try {
            const confirmedTrans = JSON.parse(storedConfirmedTransactions)
            if (Array.isArray(confirmedTrans) && confirmedTrans.length > 0) {
              transactions = confirmedTrans.map((trans: any) => ({
                id: trans.id,
                customer: trans.customerName || trans.customer || 'Unknown',
                type: trans.type === 'Credit' ? 'Credit' : 'Payment',
                amount: String(trans.amount || 0),
                additional: trans.bank || trans.reason || trans.additional || '-',
                date: trans.date || new Date().toLocaleDateString('en-US', {
                  year: '2-digit',
                  month: 'short',
                  day: 'numeric'
                }),
                status: trans.status || 'Pending',
                approvalStatus: trans.approvalStatus || 'pending'
              }))
              console.log('✅ Loaded from confirmed_transactions:', transactions.length)
              setConfirmedTransactions(transactions)
              setIsLoading(false)
              return
            }
          } catch (e) {
            console.error('❌ Error parsing confirmed_transactions:', e)
          }
        }

        // Try 2: Load from payment_requests localStorage
        const storedPaymentRequests = localStorage.getItem('payment_requests')
        if (storedPaymentRequests) {
          try {
            const paymentRequests = JSON.parse(storedPaymentRequests)
            if (Array.isArray(paymentRequests) && paymentRequests.length > 0) {
              transactions = paymentRequests.map((request: any) => ({
                id: request.id || Math.random(),
                customer: request.customerName || request.customer || 'Unknown',
                type: 'Payment',
                amount: String(request.amount || 0),
                additional: request.reason || request.bank || '-',
                date: new Date(request.createdAt || new Date()).toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }),
                status: request.status === 'Approved' ? 'Approved' : request.status === 'Rejected' ? 'Rejected' : 'Pending',
                approvalStatus: request.approvalStatus || (request.status === 'Approved' ? 'approved' : request.status === 'Rejected' ? 'rejected' : 'pending')
              }))
              console.log('✅ Loaded from payment_requests:', transactions.length)
              setConfirmedTransactions(transactions)
              setIsLoading(false)
              return
            }
          } catch (e) {
            console.error('❌ Error parsing payment_requests:', e)
          }
        }

        // Try 3: API endpoint
        try {
          const response = await fetch('http://localhost:3001/payments?page=1&limit=100', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (response.ok) {
            const data = await response.json()
            const payments = Array.isArray(data) ? data : data.data || []
            
            if (payments.length > 0) {
              transactions = payments.map((payment: any) => ({
                id: payment.id,
                customer: payment.customer?.name || payment.customerName || 'Unknown',
                type: 'Payment',
                amount: String(payment.amount || 0),
                additional: payment.bank || payment.reason || '-',
                date: new Date(payment.requestDate || payment.createdAt).toLocaleDateString('en-US', {
                  year: '2-digit',
                  month: 'short',
                  day: 'numeric'
                }),
                status: payment.status === 'Approved' ? 'Approved' : payment.status === 'Rejected' ? 'Rejected' : 'Pending',
                approvalStatus: payment.status === 'Approved' ? 'approved' : payment.status === 'Rejected' ? 'rejected' : 'pending'
              }))
              console.log('✅ Loaded from API:', transactions.length)
              setConfirmedTransactions(transactions)
              setIsLoading(false)
              return
            }
          }
        } catch (apiError) {
          console.error('❌ API error:', apiError)
        }

        // Fallback: Load mock data
        console.log('⚠️ No real data found, loading mock data')
        loadMockData()
      } catch (error) {
        console.error('❌ Error fetching payment requests:', error)
        loadMockData()
      } finally {
        setIsLoading(false)
      }
    }

    const loadMockData = () => {
      const mockTransactions: ConfirmedTransaction[] = [
        { id: 1, customer: 'Mehori Tuludimetu - B CBE', type: 'Payment', amount: '2', additional: '-', date: 'Aug 31', status: 'Approved', approvalStatus: 'pending' },
        { id: 2, customer: 'Mame negele CBE', type: 'Payment', amount: '2', additional: '-', date: 'Aug 31', status: 'Approved', approvalStatus: 'pending' },
        { id: 3, customer: 'Mame negele sdfgwsd', type: 'Credit', amount: '456', additional: '-', date: 'Sep 1', status: 'Approved', approvalStatus: 'pending' },
        { id: 4, customer: 'Mame negele CBE', type: 'Payment', amount: '2', additional: '-', date: 'Sep 1', status: 'Approved', approvalStatus: 'approved' },
        { id: 5, customer: 'Mame negele Abyssinio', type: 'Payment', amount: '2', additional: '-', date: 'Sep 1', status: 'Approved', approvalStatus: 'approved' },
        { id: 6, customer: 'Mame negele CBE', type: 'Payment', amount: '2', additional: '-', date: 'Sep 1', status: 'Approved', approvalStatus: 'approved' },
      ]
      setConfirmedTransactions(mockTransactions)
    }

    fetchPaymentRequests()
  }, [])

  const approvedCount = confirmedTransactions.filter(t => t.status === 'Approved').length
  const pendingCount = confirmedTransactions.filter(t => t.status === 'Pending').length

  return (
    <>
      <div style={{ background: '#f5f7fa', minHeight: '100vh', paddingBottom: '140px' }}>
        <div style={{ background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', color: 'white', padding: '1.5rem 1.25rem', boxShadow: '0 2px 8px rgba(168, 85, 247, 0.2)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CreditCard size={28} />
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>Payments</h1>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Section Toggle */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'white', padding: '1rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', width: 'fit-content', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveSection('approvals')} style={{ padding: '0.75rem 1.5rem', background: activeSection === 'approvals' ? '#a855f7' : 'white', color: activeSection === 'approvals' ? 'white' : '#6b7280', border: activeSection === 'approvals' ? 'none' : '1px solid #e5e7eb', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
              <Check size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Approve Sales Request
            </button>
            <button onClick={() => setActiveSection('transactions')} style={{ padding: '0.75rem 1.5rem', background: activeSection === 'transactions' ? '#a855f7' : 'white', color: activeSection === 'transactions' ? 'white' : '#6b7280', border: activeSection === 'transactions' ? 'none' : '1px solid #e5e7eb', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
              <CreditCard size={18} style={{ display: 'inline', marginRight: '0.5rem' }} />
              Transactions
            </button>
          </div>

          {/* APPROVE SALES REQUEST SECTION */}
          {activeSection === 'approvals' && (
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>Approve Sales Request</h2>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                    {confirmedTransactions.length} total • {confirmedTransactions.filter(t => t.approvalStatus === 'pending').length} pending • {confirmedTransactions.filter(t => t.approvalStatus === 'approved').length} approved
                  </p>
                </div>
              </div>

              {/* Sales Requests Table */}
              <div style={{ overflowX: 'auto' }}>
                {isLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                    <p>Loading sales requests...</p>
                  </div>
                ) : confirmedTransactions.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                    <p>No sales requests available</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Additional</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status / Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {confirmedTransactions.filter(t => t.approvalStatus === 'pending').map(transaction => (
                        <tr key={transaction.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#111827', fontWeight: '500' }}>
                            {transaction.customer}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.375rem 0.75rem',
                              background: transaction.type === 'Payment' ? '#dbeafe' : '#fef3c7',
                              color: transaction.type === 'Payment' ? '#0284c7' : '#ca8a04',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}>
                              {transaction.type}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#111827', fontWeight: '600' }}>
                            {transaction.amount} ብር
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
                            {transaction.additional}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
                            {transaction.date}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                              {transaction.approvalStatus === 'pending' && (
                                <>
                                  <button
                                    onClick={() => {
                                      // Update local state
                                      setConfirmedTransactions(prev => prev.map(t => t.id === transaction.id ? { ...t, approvalStatus: 'approved', status: 'Approved' } : t))
                                      
                                      // 🔄 SYNC TO LOCALSTORAGE - Update confirmed_transactions
                                      const storedTransactions = localStorage.getItem('confirmed_transactions')
                                      if (storedTransactions) {
                                        try {
                                          const allTransactions = JSON.parse(storedTransactions)
                                          const updatedTransactions = allTransactions.map((t: any) => 
                                            t.id === transaction.id ? { ...t, approvalStatus: 'approved', status: 'Approved' } : t
                                          )
                                          localStorage.setItem('confirmed_transactions', JSON.stringify(updatedTransactions))
                                          console.log('✅ Synced approved transaction to localStorage')
                                          
                                          // 🔔 TRIGGER EVENT for customers page to reload
                                          window.dispatchEvent(new CustomEvent('transactionApproved', { 
                                            detail: { transaction, allTransactions: updatedTransactions }
                                          }))
                                          console.log('📢 Fired transactionApproved event')
                                        } catch (e) {
                                          console.error('❌ Error syncing to localStorage:', e)
                                        }
                                      }
                                    }}
                                    style={{
                                      padding: '0.4rem 0.8rem',
                                      background: '#f0fdf4',
                                      color: '#16a34a',
                                      border: '1px solid #bbf7d0',
                                      borderRadius: '5px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '0.3rem',
                                      fontSize: '0.8rem',
                                      fontWeight: '500',
                                      transition: 'all 0.15s ease',
                                      outline: 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#dcfce7'
                                      e.currentTarget.style.borderColor = '#86efac'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = '#f0fdf4'
                                      e.currentTarget.style.borderColor = '#bbf7d0'
                                    }}
                                  >
                                    <Check size={14} style={{ strokeWidth: 2.5 }} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setConfirmedTransactions(prev => prev.map(t => t.id === transaction.id ? { ...t, approvalStatus: 'rejected', status: 'Rejected' } : t))
                                    }}
                                    style={{
                                      padding: '0.4rem 0.8rem',
                                      background: '#fef2f2',
                                      color: '#dc2626',
                                      border: '1px solid #fecaca',
                                      borderRadius: '5px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '0.3rem',
                                      fontSize: '0.8rem',
                                      fontWeight: '500',
                                      transition: 'all 0.15s ease',
                                      outline: 'none',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#fee2e2'
                                      e.currentTarget.style.borderColor = '#fca5a5'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = '#fef2f2'
                                      e.currentTarget.style.borderColor = '#fecaca'
                                    }}
                                  >
                                    <X size={14} style={{ strokeWidth: 2.5 }} />
                                  </button>
                                </>
                              )}
                              {transaction.approvalStatus === 'approved' && (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  padding: '0.4rem 0.8rem',
                                  background: '#f0fdf4',
                                  color: '#16a34a',
                                  borderRadius: '5px',
                                  fontSize: '0.8rem',
                                  fontWeight: '500',
                                  border: '1px solid #bbf7d0',
                                }}>
                                  <Check size={14} style={{ strokeWidth: 2.5 }} />
                                  Approved
                                </span>
                              )}
                              {transaction.approvalStatus === 'rejected' && (
                                <span style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.3rem',
                                  padding: '0.4rem 0.8rem',
                                  background: '#fef2f2',
                                  color: '#dc2626',
                                  borderRadius: '5px',
                                  fontSize: '0.8rem',
                                  fontWeight: '500',
                                  border: '1px solid #fecaca',
                                }}>
                                  <X size={14} style={{ strokeWidth: 2.5 }} />
                                  Rejected
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* CONFIRMED SALES SECTION */}
          {activeSection === 'transactions' && (
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>Confirmed Sales</h2>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                    {confirmedTransactions.length} total • {pendingCount} pending • {approvedCount} approved
                  </p>
                </div>
                <button
                  onClick={() => setIsConfirmedMinimized(!isConfirmedMinimized)}
                  style={{
                    background: '#f3f4f6',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isConfirmedMinimized ? '▼' : '▲'}
                </button>
              </div>

              {/* Table */}
              {!isConfirmedMinimized && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Additional</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status / Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {confirmedTransactions.map(transaction => (
                        <tr key={transaction.id} style={{ borderBottom: '1px solid #e5e7eb', hoverColor: '#f9fafb' }}>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#111827', fontWeight: '500' }}>
                            {transaction.customer}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.375rem 0.75rem',
                              background: transaction.type === 'Payment' ? '#dbeafe' : '#fef3c7',
                              color: transaction.type === 'Payment' ? '#0284c7' : '#ca8a04',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}>
                              {transaction.type}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#111827', fontWeight: '600' }}>
                            {transaction.amount}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
                            {transaction.additional}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
                            {transaction.date}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {transaction.status === 'Approved' && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.375rem 0.75rem',
                                background: '#dcfce7',
                                color: '#16a34a',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}>
                                <Check size={14} />
                                Approved
                              </span>
                            )}
                            {transaction.status === 'Pending' && (
                              <span style={{
                                display: 'inline-block',
                                padding: '0.375rem 0.75rem',
                                background: '#fef3c7',
                                color: '#ca8a04',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}>
                                Pending
                              </span>
                            )}
                            {transaction.status === 'Rejected' && (
                              <span style={{
                                display: 'inline-block',
                                padding: '0.375rem 0.75rem',
                                background: '#fee2e2',
                                color: '#dc2626',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}>
                                Rejected
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <AdminBottomNav />
    </>
  )
}
