'use client'

import { useState, useEffect } from 'react'
import AdminBottomNav from '@/components/AdminBottomNav'
import { CreditCard, Check, X, Eye } from 'lucide-react'

interface ConfirmedTransaction {
  id: number
  customer: string
  type: 'Payment' | 'Credit'
  amount: string
  additional?: string
  additionalAmount?: string
  date: string
  status: 'Approved' | 'Pending' | 'Rejected'
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  bank?: string
  reason?: string
  paymentNotes?: string
  isMultiBankPayment?: boolean
  totalPaymentAmount?: string
  bankNumber?: number
  totalBanks?: number
}

export default function PaymentsPage() {
  const [activeSection, setActiveSection] = useState<'approvals' | 'transactions'>('approvals')
  const [confirmedTransactions, setConfirmedTransactions] = useState<ConfirmedTransaction[]>([])
  const [isConfirmedMinimized, setIsConfirmedMinimized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Modal states
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<ConfirmedTransaction | null>(null)

  useEffect(() => {
    const fetchPaymentRequests = async () => {
      try {
        setIsLoading(true)
        
        let transactions: ConfirmedTransaction[] = []

        // Load from confirmed_transactions
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
                additional: trans.additional || '',
                additionalAmount: trans.additionalAmount || '',
                date: trans.date || new Date().toLocaleDateString('en-US', {
                  year: '2-digit',
                  month: 'short',
                  day: 'numeric'
                }),
                status: trans.status || 'Pending',
                approvalStatus: trans.approvalStatus || 'pending',
                bank: trans.bank || '',
                reason: trans.reason || '',
                paymentNotes: trans.paymentNotes || '',
                isMultiBankPayment: trans.isMultiBankPayment || false,
                totalPaymentAmount: trans.totalPaymentAmount,
                bankNumber: trans.bankNumber || 1,
                totalBanks: trans.totalBanks || 1,
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

        // Fallback to payment_requests
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
                additional: request.additional || '',
                additionalAmount: request.additionalAmount || '',
                date: new Date(request.createdAt || new Date()).toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }),
                status: request.status === 'Approved' ? 'Approved' : request.status === 'Rejected' ? 'Rejected' : 'Pending',
                approvalStatus: request.approvalStatus || (request.status === 'Approved' ? 'approved' : request.status === 'Rejected' ? 'rejected' : 'pending'),
                bank: request.bank || '',
                reason: request.reason || '',
                paymentNotes: request.paymentNotes || '',
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

        // Try API
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
                additional: payment.additional || '',
                additionalAmount: payment.additionalAmount || '',
                date: new Date(payment.requestDate || payment.createdAt).toLocaleDateString('en-US', {
                  year: '2-digit',
                  month: 'short',
                  day: 'numeric'
                }),
                status: payment.status === 'Approved' ? 'Approved' : payment.status === 'Rejected' ? 'Rejected' : 'Pending',
                approvalStatus: payment.status === 'Approved' ? 'approved' : payment.status === 'Rejected' ? 'rejected' : 'pending',
                bank: payment.bank || '',
                reason: payment.reason || '',
                paymentNotes: payment.paymentNotes || '',
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

        console.log('⚠️ No data found')
      } catch (error) {
        console.error('❌ Error fetching payment requests:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentRequests()

    // Listen for localStorage changes (for real-time updates from sales page)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'confirmed_transactions') {
        console.log('🔔 Detected new transaction, reloading...')
        fetchPaymentRequests()
      }
    }

    // Listen for custom events (same-tab updates)
    const handleCustomUpdate = () => {
      console.log('🔔 Detected custom transaction update, reloading...')
      fetchPaymentRequests()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('transactionCreated', handleCustomUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('transactionCreated', handleCustomUpdate)
    }
  }, [])

  const handleApprove = (transaction: ConfirmedTransaction) => {
    setConfirmedTransactions(prev => prev.map(t => t.id === transaction.id ? { ...t, approvalStatus: 'approved', status: 'Approved' } : t))
    
    const storedTransactions = localStorage.getItem('confirmed_transactions')
    if (storedTransactions) {
      try {
        const allTransactions = JSON.parse(storedTransactions)
        const updatedTransactions = allTransactions.map((t: any) => 
          t.id === transaction.id ? { ...t, approvalStatus: 'approved', status: 'Approved' } : t
        )
        localStorage.setItem('confirmed_transactions', JSON.stringify(updatedTransactions))
        console.log('✅ Synced approved transaction to localStorage')
        
        window.dispatchEvent(new CustomEvent('transactionApproved', { 
          detail: { transaction, allTransactions: updatedTransactions }
        }))
        console.log('📢 Fired transactionApproved event')
      } catch (e) {
        console.error('❌ Error syncing to localStorage:', e)
      }
    }
  }

  const handleReject = (transaction: ConfirmedTransaction) => {
    // Mark as rejected in state
    setConfirmedTransactions(prev => prev.map(t => t.id === transaction.id ? { ...t, approvalStatus: 'rejected', status: 'Rejected' } : t))
    
    // Update localStorage
    const storedTransactions = localStorage.getItem('confirmed_transactions')
    if (storedTransactions) {
      try {
        const allTransactions = JSON.parse(storedTransactions)
        const updatedTransactions = allTransactions.map((t: any) => 
          t.id === transaction.id ? { ...t, approvalStatus: 'rejected', status: 'Rejected' } : t
        )
        localStorage.setItem('confirmed_transactions', JSON.stringify(updatedTransactions))
        
        // Move rejected transaction back to uploaded_customers for re-editing
        const uploadedCustomers = JSON.parse(localStorage.getItem('uploaded_customers_persist') || '[]')
        
        // Get the original customer data if it exists in the transaction
        const rejectedCustomer = {
          name: transaction.customer,
          _rejectedTransaction: {
            id: transaction.id,
            amount: transaction.amount,
            bank: transaction.bank,
            reason: transaction.reason,
            paymentNotes: transaction.paymentNotes,
            additionalAmount: transaction.additionalAmount,
            additional: transaction.additional,
            isMultiBankPayment: transaction.isMultiBankPayment,
            totalPaymentAmount: transaction.totalPaymentAmount,
            bankNumber: transaction.bankNumber,
            totalBanks: transaction.totalBanks,
          },
          _isRejectedPayment: true,
          matched: false,
          inDatabase: false,
          // Add any item data if it was stored with the transaction
          ...(transaction as any).customerData,
        }
        
        // Add back to uploaded customers
        uploadedCustomers.push(rejectedCustomer)
        localStorage.setItem('uploaded_customers_persist', JSON.stringify(uploadedCustomers))
        
        console.log('✅ Saved rejected customer to localStorage:', rejectedCustomer.name)
        console.log('📊 Total customers in localStorage:', uploadedCustomers.length)
        
        // Fire event to notify sales page
        window.dispatchEvent(new CustomEvent('paymentRejected', { 
          detail: { transaction, customer: rejectedCustomer }
        }))
        console.log('📢 Fired paymentRejected event')
        
        alert(`❌ Payment Rejected\n\nCustomer: ${transaction.customer}\nAmount: ${transaction.amount}\n\nThe customer will appear in sales dashboard for resubmission.`)
        
      } catch (e) {
        console.error('❌ Error handling rejection:', e)
      }
    }
  }

  const openTransactionModal = (transaction: ConfirmedTransaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionModal(true)
  }

  const openReasonModal = (transaction: ConfirmedTransaction) => {
    setSelectedTransaction(transaction)
    setShowReasonModal(true)
  }

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
              <Check size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Approve Sales Request
            </button>
            <button onClick={() => setActiveSection('transactions')} style={{ padding: '0.75rem 1.5rem', background: activeSection === 'transactions' ? '#a855f7' : 'white', color: activeSection === 'transactions' ? 'white' : '#6b7280', border: activeSection === 'transactions' ? 'none' : '1px solid #e5e7eb', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
              <CreditCard size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
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
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Customer</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Type</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Amount</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Payed By</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Additional</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Transaction</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Reason</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Date</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Action</th>
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
                              background: transaction.transactionType === 'Refund' ? '#fee2e2' : transaction.transactionType === 'Pay Credit' ? '#dbeafe' : transaction.type === 'Payment' ? '#dbeafe' : '#fef3c7',
                              color: transaction.transactionType === 'Refund' ? '#dc2626' : transaction.transactionType === 'Pay Credit' ? '#0284c7' : transaction.type === 'Payment' ? '#0284c7' : '#ca8a04',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}>
                              {transaction.transactionType || transaction.type}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#111827', fontWeight: '600' }}>
                            {parseFloat(transaction.amount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                            {transaction.bank ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.4rem 0.8rem',
                                background: '#eff6ff',
                                color: '#1e40af',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                border: '1px solid #bfdbfe'
                              }}>
                                🏦 {transaction.bank}
                              </span>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                            {transaction.additionalAmount ? (
                              <span style={{
                                display: 'inline-block',
                                padding: '0.3rem 0.6rem',
                                background: '#fef3c7',
                                color: '#92400e',
                                borderRadius: '5px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}>
                                +{parseFloat(transaction.additionalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                              </span>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {transaction.reason ? (
                              <button
                                onClick={() => openTransactionModal(transaction)}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  background: '#f0fdf4',
                                  color: '#16a34a',
                                  border: '1px solid #bbf7d0',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#dcfce7'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#f0fdf4'
                                }}
                              >
                                <Eye size={14} />
                                View
                              </button>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {transaction.paymentNotes ? (
                              <button
                                onClick={() => openReasonModal(transaction)}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  background: '#fef3c7',
                                  color: '#92400e',
                                  border: '1px solid #fde68a',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#fde68a'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#fef3c7'
                                }}
                              >
                                <Eye size={14} />
                                View
                              </button>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                            {transaction.date}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              {transaction.approvalStatus === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(transaction)}
                                    style={{
                                      padding: '0.5rem 1rem',
                                      background: '#f0fdf4',
                                      color: '#16a34a',
                                      border: '1px solid #bbf7d0',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      fontSize: '0.85rem',
                                      fontWeight: '600',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#dcfce7'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = '#f0fdf4'
                                    }}
                                  >
                                    <Check size={16} />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(transaction)}
                                    style={{
                                      padding: '0.5rem 1rem',
                                      background: '#fef2f2',
                                      color: '#dc2626',
                                      border: '1px solid #fecaca',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      fontSize: '0.85rem',
                                      fontWeight: '600',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#fee2e2'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = '#fef2f2'
                                    }}
                                  >
                                    <X size={16} />
                                    Reject
                                  </button>
                                </>
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

              {!isConfirmedMinimized && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Customer</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Type</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Amount</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Payed By</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Additional</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Transaction</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Reason</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Date</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {confirmedTransactions.map(transaction => (
                        <tr key={transaction.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#111827', fontWeight: '500' }}>
                            {transaction.customer}
                            {transaction.isMultiBankPayment && (
                              <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{
                                  fontSize: '0.7rem',
                                  color: '#6b7280',
                                  background: '#f3f4f6',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '4px',
                                  fontWeight: '600'
                                }}>
                                  Payment {transaction.bankNumber}/{transaction.totalBanks}
                                </span>
                                <span style={{
                                  fontSize: '0.7rem',
                                  color: '#2563eb',
                                  fontWeight: '600'
                                }}>
                                  Total: {parseFloat(transaction.totalPaymentAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                                </span>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.375rem 0.75rem',
                              background: transaction.transactionType === 'Refund' ? '#fee2e2' : transaction.transactionType === 'Pay Credit' ? '#dbeafe' : transaction.type === 'Payment' ? '#dbeafe' : '#fef3c7',
                              color: transaction.transactionType === 'Refund' ? '#dc2626' : transaction.transactionType === 'Pay Credit' ? '#0284c7' : transaction.type === 'Payment' ? '#0284c7' : '#ca8a04',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}>
                              {transaction.transactionType || transaction.type}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#111827', fontWeight: '600' }}>
                            {parseFloat(transaction.amount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                            {transaction.bank ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.4rem 0.8rem',
                                background: '#eff6ff',
                                color: '#1e40af',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                border: '1px solid #bfdbfe'
                              }}>
                                🏦 {transaction.bank}
                              </span>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                            {transaction.additionalAmount ? (
                              <span style={{
                                display: 'inline-block',
                                padding: '0.3rem 0.6rem',
                                background: '#fef3c7',
                                color: '#92400e',
                                borderRadius: '5px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}>
                                +{parseFloat(transaction.additionalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                              </span>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {transaction.reason ? (
                              <button
                                onClick={() => openTransactionModal(transaction)}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  background: '#f0fdf4',
                                  color: '#16a34a',
                                  border: '1px solid #bbf7d0',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#dcfce7'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#f0fdf4'
                                }}
                              >
                                <Eye size={14} />
                                View
                              </button>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {transaction.paymentNotes ? (
                              <button
                                onClick={() => openReasonModal(transaction)}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  background: '#fef3c7',
                                  color: '#92400e',
                                  border: '1px solid #fde68a',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#fde68a'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#fef3c7'
                                }}
                              >
                                <Eye size={14} />
                                View
                              </button>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                            {transaction.date}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {transaction.status === 'Approved' && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.4rem 0.8rem',
                                background: '#dcfce7',
                                color: '#16a34a',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                border: '1px solid #bbf7d0'
                              }}>
                                <Check size={14} />
                                Approved
                              </span>
                            )}
                            {transaction.status === 'Pending' && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.4rem 0.8rem',
                                background: '#fef3c7',
                                color: '#92400e',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                border: '1px solid #fde68a'
                              }}>
                                ⏳ Pending
                              </span>
                            )}
                            {transaction.status === 'Rejected' && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.4rem 0.8rem',
                                background: '#fee2e2',
                                color: '#dc2626',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                border: '1px solid #fecaca'
                              }}>
                                <X size={14} />
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

      {/* Transaction ID Modal */}
      {showTransactionModal && selectedTransaction && (
        <div
          onClick={() => setShowTransactionModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Transaction ID</h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '2rem' }}>
              <div style={{
                background: '#f0fdf4',
                border: '2px solid #bbf7d0',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Customer
                </p>
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#111827', fontWeight: '700' }}>
                  {selectedTransaction.customer}
                </p>
              </div>
              <div style={{
                background: '#f0fdf4',
                border: '2px solid #bbf7d0',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Transaction ID
                </p>
                <p style={{ margin: 0, fontSize: '1.3rem', color: '#16a34a', fontWeight: '700', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {selectedTransaction.reason}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Reason Modal */}
      {showReasonModal && selectedTransaction && (
        <div
          onClick={() => setShowReasonModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Payment Notes/Reason</h3>
              <button
                onClick={() => setShowReasonModal(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '2rem' }}>
              <div style={{
                background: '#fef3c7',
                border: '2px solid #fde68a',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Customer
                </p>
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#111827', fontWeight: '700' }}>
                  {selectedTransaction.customer}
                </p>
              </div>
              <div style={{
                background: '#fef3c7',
                border: '2px solid #fde68a',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Payment Notes
                </p>
                <p style={{ margin: 0, fontSize: '1rem', color: '#111827', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {selectedTransaction.paymentNotes}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </>
  )
}
