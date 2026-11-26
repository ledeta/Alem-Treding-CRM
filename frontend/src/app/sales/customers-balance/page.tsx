'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import { ArrowLeft, Users, TrendingUp, TrendingDown, ChevronRight, CreditCard, Banknote, Clock } from 'lucide-react'

interface Transaction {
  id: number
  type: 'Payment' | 'Credit'
  customerName: string
  amount: string
  bank: string
  reason: string
  additional?: string
  status: string
  date: string
}

interface CustomerBalance {
  name: string
  totalPaid: number
  totalCredit: number
  balance: number
}

export default function CustomersBalancePage() {
  const router = useRouter()
  const [customers, setCustomers] = useState<CustomerBalance[]>([])
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerBalance | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [selectedBank, setSelectedBank] = useState('CBE')
  const [paymentReference, setPaymentReference] = useState('')
  const [additionalBanks, setAdditionalBanks] = useState<Array<{bank: string, amount: string, reason: string, verifyStatus: 'idle'|'loading'|'verified'|'failed', verifyData: any, verifyAccount: string}>>([])
  const [verifyStatus, setVerifyStatus] = useState<'idle'|'loading'|'verified'|'failed'>('idle')
  const [verifyData, setVerifyData] = useState<any | null>(null)
  const [verifyAccount, setVerifyAccount] = useState('')
  const [showAccountSuggestions, setShowAccountSuggestions] = useState(false)
  const [savedAccounts, setSavedAccounts] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('saved_verify_accounts') || '[]') } catch { return [] }
  })
  const [paymentNotes, setPaymentNotes] = useState('')
  
  // Refund states - Direct item input (no add button)
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [refundTransactionId, setRefundTransactionId] = useState('')
  const [refundItems, setRefundItems] = useState<Array<{name: string, quantity: number, price: number}>>([])
  const [refundItemName, setRefundItemName] = useState('')
  const [refundItemQuantity, setRefundItemQuantity] = useState('')
  const [refundItemPrice, setRefundItemPrice] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = () => {
    const stored = localStorage.getItem('confirmed_transactions')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        // Filter approved transactions only
        const approvedTransactions = data.filter((t: any) => t.approvalStatus === 'approved')
        setTransactions(approvedTransactions)

        // Get unique customer names
        const uniqueNames = [...new Set(approvedTransactions.map((t: any) => t.customerName))].sort()
        
        // Calculate balances for each customer
        const customersWithBalance = uniqueNames.map(name => {
          const customerTrans = approvedTransactions.filter((t: any) => t.customerName === name)
          
          const totalPaid = customerTrans
            .filter((t: any) => t.type === 'Payment')
            .reduce((sum: number, t: any) => sum + parseFloat(t.amount || '0'), 0)
          
          const totalCredit = customerTrans
            .filter((t: any) => t.type === 'Credit')
            .reduce((sum: number, t: any) => sum + parseFloat(t.amount || '0'), 0)
          
          const balance = totalPaid - totalCredit

          return {
            name,
            totalPaid,
            totalCredit,
            balance
          }
        })

        setCustomers(customersWithBalance)
      } catch (error) {
        console.error('Error loading customers:', error)
        setCustomers([])
      }
    }
  }

  const getCustomerTransactions = (customerName: string): Transaction[] => {
    return transactions
      .filter(t => t.customerName === customerName)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const calculateWaitingDays = (dateString: string): number => {
    try {
      const creditDate = new Date(dateString)
      const today = new Date()
      const diffTime = Math.abs(today.getTime() - creditDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    } catch {
      return 0
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const toggleCustomerExpand = (customerName: string) => {
    setExpandedCustomer(expandedCustomer === customerName ? null : customerName)
  }

  const handlePaymentRequest = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid amount')
      return
    }
    if (!paymentReference.trim()) {
      alert('Please enter a Transaction ID')
      return
    }
    const allTransactionIDsFilled = additionalBanks.every(bank => bank.reason && bank.reason.trim() !== '')
    if (!allTransactionIDsFilled) {
      alert('⚠️ Please enter Transaction ID for all bank payments!')
      return
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const mainAmount = parseFloat(paymentAmount) || 0
      const additionalBankTotal = additionalBanks.reduce((sum, bank) => sum + (parseFloat(bank.amount) || 0), 0)
      const grandTotal = mainAmount + additionalBankTotal

      const transactions = []

      // Main bank payment
      transactions.push({
        id: Date.now(),
        type: 'Payment',
        customerName: selectedCustomer?.name || '',
        amount: paymentAmount,
        bank: selectedBank,
        reason: paymentReference,
        notes: paymentNotes,
        status: 'Pending',
        approvalStatus: 'pending',
        date: new Date().toISOString(),
        requestedBy: currentUser.username || 'Sales User',
        isMultiBankPayment: additionalBanks.length > 0,
        totalPaymentAmount: grandTotal.toString(),
        bankNumber: 1,
        totalBanks: 1 + additionalBanks.length,
      })

      // Additional bank payments
      additionalBanks.forEach((bankPayment, index) => {
        transactions.push({
          id: Date.now() + index + 1,
          type: 'Payment',
          customerName: selectedCustomer?.name || '',
          amount: bankPayment.amount,
          bank: bankPayment.bank,
          reason: bankPayment.reason,
          notes: paymentNotes,
          status: 'Pending',
          approvalStatus: 'pending',
          date: new Date().toISOString(),
          requestedBy: currentUser.username || 'Sales User',
          isMultiBankPayment: true,
          totalPaymentAmount: grandTotal.toString(),
          bankNumber: index + 2,
          totalBanks: 1 + additionalBanks.length,
        })
      })

      const existing = JSON.parse(localStorage.getItem('confirmed_transactions') || '[]')
      localStorage.setItem('confirmed_transactions', JSON.stringify([...existing, ...transactions]))

      // ALSO save to shop-specific storage
      const shopRequests = JSON.parse(localStorage.getItem('shop_payment_requests') || '[]')
      localStorage.setItem('shop_payment_requests', JSON.stringify([...shopRequests, ...transactions]))
      
      // Dispatch event for admin payments page
      window.dispatchEvent(new CustomEvent('shopRequestCreated'))

      let bankDetails = `🏦 ${selectedBank}: ${parseFloat(paymentAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      if (additionalBanks.length > 0) {
        additionalBanks.forEach(b => {
          bankDetails += `\n🏦 ${b.bank}: ${parseFloat(b.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        })
      }

      alert(`✅ Payment Submitted!\n\n👤 Customer: ${selectedCustomer?.name || ''}\n💰 Total: ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n\n${bankDetails}\n\n⏳ ${transactions.length} payment(s) pending admin approval!`)

      // Close modal and reset
      setShowPaymentModal(false)
      setPaymentAmount('')
      setSelectedBank('CBE')
      setPaymentReference('')
      setAdditionalBanks([])
      setPaymentNotes('')
      
      // Reload customers
      loadCustomers()
    } catch (error) {
      console.error('Error submitting payment request:', error)
      alert('Failed to submit payment request')
    }
  }

  return (
    <MainLayout>
      <div style={{
        background: '#ffffff',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
      }}>
        {/* Page Header */}
        <div style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 1.5rem',
        }}>
          <div style={{
            maxWidth: '1400px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <button
              onClick={() => router.push('/sales/requests')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#475569',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f5f9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8fafc'
              }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: '#0f172a',
                margin: 0,
              }}>
                Customer Balances
              </h1>
              <p style={{
                fontSize: '0.85rem',
                color: '#64748b',
                margin: '0.25rem 0 0 0',
              }}>
                {customers.length} customers
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '1.5rem',
        }}>
          {/* Customers Table */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            {customers.length === 0 ? (
              <div style={{
                padding: '4rem 2rem',
                textAlign: 'center',
              }}>
                <Users size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
                <p style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#475569',
                  margin: 0,
                }}>
                  No customers found
                </p>
              </div>
            ) : (
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}>
                <thead>
                  <tr style={{
                    background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0',
                  }}>
                    <th style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'left',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Customer Name
                    </th>
                    <th style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'right',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Total Paid
                    </th>
                    <th style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'right',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Total Credit
                    </th>
                    <th style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'right',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Balance
                    </th>
                    <th style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#475569',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      width: '60px',
                    }}>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, idx) => (
                    <tr
                      key={customer.name}
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setShowCustomerModal(true)
                      }}
                      style={{
                        cursor: 'pointer',
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f8fafc'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ffffff'
                      }}
                    >
                      <td style={{
                        padding: '1rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#0f172a',
                      }}>
                        {customer.name}
                      </td>
                      <td style={{
                        padding: '1rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#16a34a',
                        textAlign: 'right',
                      }}>
                        {customer.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{
                        padding: '1rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#2563eb',
                        textAlign: 'right',
                      }}>
                        {customer.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{
                        padding: '1rem',
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        textAlign: 'right',
                        color: customer.balance > 0 ? '#16a34a' : customer.balance < 0 ? '#dc2626' : '#64748b',
                      }}>
                        {customer.balance > 0 ? '+' : ''}{customer.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{
                        padding: '1rem',
                        textAlign: 'center',
                        color: '#64748b',
                      }}>
                        <ChevronRight size={20} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Professional Customer Status Modal */}
        {showCustomerModal && selectedCustomer && (
          <div
            onClick={() => setShowCustomerModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1rem',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '2rem 2rem 1.5rem 2rem',
                color: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{
                      fontSize: '1.75rem',
                      fontWeight: '900',
                      margin: '0 0 0.5rem 0',
                      letterSpacing: '-0.01em',
                    }}>
                      {selectedCustomer.name}
                    </h2>
                    <p style={{
                      fontSize: '0.95rem',
                      margin: 0,
                      opacity: 0.9,
                      fontWeight: '500',
                    }}>
                      Customer Payment Status
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCustomerModal(false)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: '700'
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
                
                {/* Balance Summary Cards */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '1rem',
                  marginTop: '1.5rem',
                }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      opacity: 0.9,
                      marginBottom: '0.5rem',
                    }}>
                      Total Paid
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '900',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                      <TrendingUp size={24} />
                      {selectedCustomer.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      opacity: 0.9,
                      marginBottom: '0.5rem',
                    }}>
                      Total Credit
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '900',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                      <TrendingDown size={24} />
                      {selectedCustomer.totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  
                  <div style={{
                    background: selectedCustomer.balance >= 0 
                      ? 'rgba(16, 185, 129, 0.25)'
                      : 'rgba(239, 68, 68, 0.25)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: '12px',
                    padding: '1rem',
                    border: `1px solid ${selectedCustomer.balance >= 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
                  }}>
                    <div style={{
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      opacity: 0.9,
                      marginBottom: '0.5rem',
                    }}>
                      Balance
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: '900',
                    }}>
                      {selectedCustomer.balance > 0 ? '+' : ''}{selectedCustomer.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction History */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    color: '#0f172a',
                    margin: 0,
                  }}>
                    Transaction History
                  </h3>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowPaymentModal(true)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <CreditCard size={18} />
                      Make Payment
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowRefundModal(true)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.5rem',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)'
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                      Refund
                    </button>
                  </div>
                </div>

                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                  }}>
                    <thead>
                      <tr style={{
                        background: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                      }}>
                        <th style={{
                          padding: '1rem 1.5rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#475569',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          Type
                        </th>
                        <th style={{
                          padding: '1rem 1.5rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#475569',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          Bank/Reason
                        </th>
                        <th style={{
                          padding: '1rem 1.5rem',
                          textAlign: 'right',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#475569',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          Amount
                        </th>
                        <th style={{
                          padding: '1rem 1.5rem',
                          textAlign: 'left',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          color: '#475569',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCustomerTransactions(selectedCustomer.name).map((transaction, tIdx) => (
                        <tr
                          key={transaction.id}
                          style={{
                            borderBottom: tIdx < getCustomerTransactions(selectedCustomer.name).length - 1 ? '1px solid #e2e8f0' : 'none',
                            transition: 'background 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f8fafc'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ffffff'
                          }}
                        >
                          <td style={{
                            padding: '1rem 1.5rem',
                            fontSize: '0.875rem',
                          }}>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem 1rem',
                              borderRadius: '8px',
                              background: transaction.type === 'Payment' ? '#dcfce7' : '#dbeafe',
                              color: transaction.type === 'Payment' ? '#166534' : '#1e40af',
                              fontSize: '0.875rem',
                              fontWeight: '700',
                            }}>
                              {transaction.type === 'Payment' ? <Banknote size={16} /> : <CreditCard size={16} />}
                              {transaction.type}
                            </div>
                            {transaction.type === 'Credit' && (
                              <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                marginLeft: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                borderRadius: '8px',
                                background: '#fef3c7',
                                color: '#92400e',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                              }}>
                                <Clock size={14} />
                                {calculateWaitingDays(transaction.date)} days
                              </div>
                            )}
                          </td>
                          <td style={{
                            padding: '1rem 1.5rem',
                            fontSize: '0.875rem',
                            color: '#374151',
                            fontWeight: '600',
                          }}>
                            {transaction.type === 'Payment' ? transaction.bank : transaction.reason || 'Credit'}
                          </td>
                          <td style={{
                            padding: '1rem 1.5rem',
                            fontSize: '1rem',
                            fontWeight: '800',
                            textAlign: 'right',
                            color: transaction.type === 'Payment' ? '#16a34a' : '#2563eb',
                          }}>
                            {parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{
                            padding: '1rem 1.5rem',
                            fontSize: '0.875rem',
                            color: '#64748b',
                          }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                              <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                                {formatDate(transaction.date)}
                              </span>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>
                                {formatTime(transaction.date)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Professional Payment Modal */}
        {showPaymentModal && (
          <div
            onClick={() => setShowPaymentModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '1rem',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '20px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                padding: '2rem 2rem 1.5rem 2rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '900',
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}>
                    Payment Confirmation
                  </h2>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: 'none',
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      color: 'white',
                      fontSize: '20px',
                      fontWeight: '700'
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
                <p style={{
                  fontSize: '1.1rem',
                  margin: 0,
                  fontWeight: '600',
                  opacity: 0.95
                }}>
                  {selectedCustomer?.name || ''} - <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>{paymentAmount || '0.00'}</span>
                </p>
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {/* Amount */}
                  <div>
                    <label style={{
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: '#64748b',
                      display: 'block',
                      marginBottom: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Amount (ብር) *
                    </label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="Enter amount"
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: '#f8fafc',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit',
                        fontWeight: '600',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#10b981'
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.background = '#f8fafc'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  {/* Bank Selection */}
                  <div>
                    <label style={{
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: '#64748b',
                      display: 'block',
                      marginBottom: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Bank
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: '#f8fafc',
                        outline: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontWeight: '600',
                        boxSizing: 'border-box',
                      }}
                    >
                      <option value="CBE">CBE — Commercial Bank of Ethiopia</option>
                      <option value="BOA">BOA — Bank of Abyssinia</option>
                      <option value="Dashen">Dashen Bank</option>
                      <option value="Awash">Awash Bank</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>

                  {/* Payment Verification Section */}
                  <div style={{ background: '#f8fafc', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '14px', display: 'grid', gap: '10px' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                      Payment Verification
                    </div>
                    <div>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>Transaction ID *</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="text" value={paymentReference}
                          onChange={(e) => { setPaymentReference(e.target.value); setVerifyStatus('idle'); setVerifyData(null) }}
                          placeholder={selectedBank === 'CBE' ? 'FT26326L38T6 or receipt link' : selectedBank === 'BOA' ? 'BOA slip link or ref' : selectedBank === 'Dashen' ? '387ETAP2522000WK' : selectedBank === 'Awash' ? 'Share link from SMS' : 'No verification needed'}
                          style={{ flex: 1, padding: '0.78rem 1rem', border: `1.5px solid ${verifyStatus === 'verified' ? '#22c55e' : verifyStatus === 'failed' ? '#ef4444' : '#cbd5e1'}`, borderRadius: '10px', fontSize: '0.9rem', background: verifyStatus === 'verified' ? '#f0fdf4' : verifyStatus === 'failed' ? '#fef2f2' : 'white', outline: 'none', fontFamily: 'inherit', fontWeight: 600, boxSizing: 'border-box' }} />
                        <button onClick={async () => {
                            if (!paymentReference.trim() || selectedBank === 'Cash') return
                            setVerifyStatus('loading'); setVerifyData(null)
                            try {
                              const ctrl = new AbortController(); const tid = setTimeout(() => ctrl.abort(), 25000)
                              const res = await fetch('/api/verify-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transactionId: paymentReference.trim(), bank: selectedBank, account: verifyAccount.trim() }), signal: ctrl.signal })
                              clearTimeout(tid); const result = await res.json()
                              if (result.success && result.verified) {
                                setVerifyStatus('verified'); setVerifyData(result.data)
                                if (result.data?.amount) setPaymentAmount(String(result.data.amount))
                                if (verifyAccount.trim()) {
                                  const updated = [verifyAccount.trim(), ...savedAccounts.filter(a => a !== verifyAccount.trim())].slice(0, 10)
                                  setSavedAccounts(updated); localStorage.setItem('saved_verify_accounts', JSON.stringify(updated))
                                }
                              } else { setVerifyStatus('failed'); setVerifyData({ error: result.error, hint: result.hint, fallbackUrl: result.fallbackUrl }) }
                            } catch (e: any) { setVerifyStatus('failed'); setVerifyData({ error: e?.name === 'AbortError' ? 'Timed out.' : 'Network error.' }) }
                          }}
                          disabled={!paymentReference.trim() || verifyStatus === 'loading' || selectedBank === 'Cash'}
                          style={{ padding: '0.78rem 1rem', borderRadius: '10px', border: 'none', cursor: (!paymentReference.trim() || selectedBank === 'Cash') ? 'not-allowed' : 'pointer', fontWeight: 800, minWidth: '72px', background: verifyStatus === 'verified' ? 'linear-gradient(135deg,#22c55e,#16a34a)' : verifyStatus === 'failed' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : verifyStatus === 'loading' ? '#94a3b8' : selectedBank === 'Cash' ? '#d1d5db' : 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {verifyStatus === 'loading' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                            : verifyStatus === 'verified' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            : verifyStatus === 'failed' ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            : selectedBank === 'Cash' ? <span>—</span>
                            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '5px' }}>Account Number <span style={{ color: '#94a3b8', fontWeight: 500 }}>(optional)</span></label>
                      <div style={{ position: 'relative' }}>
                        <input type="text" value={verifyAccount}
                          onChange={(e) => { setVerifyAccount(e.target.value); setVerifyStatus('idle'); setVerifyData(null); setShowAccountSuggestions(true) }}
                          onFocus={() => setShowAccountSuggestions(true)}
                          onBlur={() => setTimeout(() => setShowAccountSuggestions(false), 150)}
                          placeholder={selectedBank === 'CBE' ? 'Last 8 digits e.g. 57401608' : selectedBank === 'BOA' ? 'Last 5 digits e.g. 06171' : 'Account number (if required)'}
                          style={{ width: '100%', padding: '0.78rem 1rem', border: '1.5px solid #cbd5e1', borderRadius: '10px', fontSize: '0.9rem', background: 'white', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                          onFocusCapture={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                          onBlurCapture={(e) => e.currentTarget.style.borderColor = '#cbd5e1'} />
                        {showAccountSuggestions && savedAccounts.filter(a => a.includes(verifyAccount.trim()) || verifyAccount.trim() === '').length > 0 && (
                          <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: 'white', borderRadius: '10px', zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                            <div style={{ padding: '5px 12px', fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>Recent Accounts</div>
                            {savedAccounts.filter(a => a.includes(verifyAccount.trim()) || verifyAccount.trim() === '').map((account, i) => (
                              <div key={i} onMouseDown={() => { setVerifyAccount(account); setShowAccountSuggestions(false); setVerifyStatus('idle'); setVerifyData(null) }}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', cursor: 'pointer' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f5f3ff'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                                  </div>
                                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{account}</span>
                                </div>
                                <button onMouseDown={(e) => { e.stopPropagation(); const u = savedAccounts.filter(a => a !== account); setSavedAccounts(u); localStorage.setItem('saved_verify_accounts', JSON.stringify(u)) }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', padding: '2px', display: 'flex', alignItems: 'center' }}
                                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444' }}
                                  onMouseLeave={(e) => { e.currentTarget.style.color = '#cbd5e1' }}>
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    {verifyStatus === 'verified' && verifyData && (
                      <div style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '1.5px solid #86efac', borderRadius: '10px', padding: '12px' }}>
                        <div style={{ fontWeight: 800, color: '#15803d', fontSize: '0.82rem', marginBottom: '8px' }}>✓ Transaction Verified</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          {[{ label: 'Payer', value: verifyData.payer_name }, { label: 'Amount', value: verifyData.amount ? `${Number(verifyData.amount).toLocaleString()} ETB` : null }, { label: 'Receiver', value: verifyData.receiver_name }, { label: 'Date', value: verifyData.date }].filter(f => f.value).map(f => (
                            <div key={f.label} style={{ background: 'white', padding: '7px 10px', borderRadius: '7px', border: '1px solid #bbf7d0' }}>
                              <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>{f.label}</div>
                              <div style={{ fontSize: '12px', fontWeight: 800, color: '#111827' }}>{f.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {verifyStatus === 'failed' && verifyData && (
                      <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '10px', padding: '10px 12px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#dc2626', fontWeight: 700 }}>{verifyData.error || 'Could not verify. You can still submit manually.'}</div>
                        {verifyData.hint && <div style={{ marginTop: '5px', fontSize: '0.72rem', color: '#854d0e', background: '#fef9c3', padding: '4px 8px', borderRadius: '5px', fontWeight: 600 }}>💡 {verifyData.hint}</div>}
                        {verifyData.fallbackUrl && <a href={verifyData.fallbackUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '5px', fontSize: '0.76rem', color: '#2563eb', fontWeight: 700 }}>🔗 Open official receipt page</a>}
                      </div>
                    )}
                  </div>

                  {/* Add Bank Button */}
                  <button
                    onClick={() => {
                      setAdditionalBanks([...additionalBanks, { bank: 'CBE', amount: '', reason: '', verifyStatus: 'idle', verifyData: null, verifyAccount: '' }])
                    }}
                    style={{
                      padding: '0.75rem',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      transition: 'all 0.2s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#059669'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#10b981'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    + Add Bank
                  </button>

                  {/* Additional Banks */}
                  {additionalBanks.map((bank, index) => (
                    <div key={index} style={{ padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1.5px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Bank #{index + 2}</span>
                        <button onClick={() => setAdditionalBanks(additionalBanks.filter((_, i) => i !== index))}
                          style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                          Remove
                        </button>
                      </div>
                      <div style={{ display: 'grid', gap: '0.75rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Bank</label>
                            <div style={{ position: 'relative' }}>
                              <select value={bank.bank}
                                onChange={(e) => { const u = [...additionalBanks]; u[index].bank = e.target.value; u[index].verifyStatus = 'idle'; u[index].verifyData = null; setAdditionalBanks(u) }}
                                style={{ width: '100%', padding: '0.7rem 1.5rem 0.7rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, color: '#0f172a', background: 'white', outline: 'none', cursor: 'pointer', appearance: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}>
                                <option value="CBE">CBE</option>
                                <option value="BOA">BOA</option>
                                <option value="Dashen">Dashen</option>
                                <option value="Awash">Awash</option>
                                <option value="Cash">Cash</option>
                              </select>
                              <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#6366f1', fontSize: '10px' }}>▼</div>
                            </div>
                          </div>
                          <div>
                            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Amount</label>
                            <input type="number" placeholder="0.00" value={bank.amount}
                              onChange={(e) => { const u = [...additionalBanks]; u[index].amount = e.target.value; setAdditionalBanks(u) }}
                              style={{ width: '100%', padding: '0.7rem 0.75rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', background: 'white', outline: 'none', fontFamily: 'inherit', fontWeight: 600, boxSizing: 'border-box' }} />
                          </div>
                        </div>
                        <div style={{ background: 'white', borderRadius: '10px', border: '1.5px solid #e2e8f0', padding: '10px' }}>
                          <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            Verify Payment
                          </div>
                          <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                            <input type="text" value={bank.reason}
                              onChange={(e) => { const u = [...additionalBanks]; u[index].reason = e.target.value; u[index].verifyStatus = 'idle'; u[index].verifyData = null; setAdditionalBanks(u) }}
                              placeholder={bank.bank === 'CBE' ? 'FT... or receipt link' : bank.bank === 'BOA' ? 'BOA ref' : 'Transaction ID (required)'}
                              style={{ flex: 1, padding: '0.65rem 0.75rem', border: `1.5px solid ${bank.verifyStatus === 'verified' ? '#22c55e' : bank.verifyStatus === 'failed' ? '#ef4444' : '#cbd5e1'}`, borderRadius: '8px', fontSize: '0.85rem', background: bank.verifyStatus === 'verified' ? '#f0fdf4' : bank.verifyStatus === 'failed' ? '#fef2f2' : 'white', outline: 'none', fontFamily: 'inherit', fontWeight: 600, boxSizing: 'border-box' }} />
                            <button onClick={async () => {
                                if (!bank.reason.trim() || bank.bank === 'Cash') return
                                const u = [...additionalBanks]; u[index].verifyStatus = 'loading'; u[index].verifyData = null; setAdditionalBanks(u)
                                try {
                                  const ctrl = new AbortController(); const tid = setTimeout(() => ctrl.abort(), 25000)
                                  const res = await fetch('/api/verify-payment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ transactionId: bank.reason.trim(), bank: bank.bank, account: bank.verifyAccount || '' }), signal: ctrl.signal })
                                  clearTimeout(tid); const result = await res.json()
                                  const u2 = [...additionalBanks]
                                  if (result.success && result.verified) { u2[index].verifyStatus = 'verified'; u2[index].verifyData = result.data; if (result.data?.amount) u2[index].amount = String(result.data.amount) }
                                  else { u2[index].verifyStatus = 'failed'; u2[index].verifyData = { error: result.error, fallbackUrl: result.fallbackUrl } }
                                  setAdditionalBanks(u2)
                                } catch (e: any) { const u2 = [...additionalBanks]; u2[index].verifyStatus = 'failed'; u2[index].verifyData = { error: e?.name === 'AbortError' ? 'Timed out.' : 'Network error.' }; setAdditionalBanks(u2) }
                              }}
                              disabled={!bank.reason.trim() || bank.verifyStatus === 'loading' || bank.bank === 'Cash'}
                              style={{ padding: '0.65rem 0.75rem', borderRadius: '8px', border: 'none', cursor: (!bank.reason.trim() || bank.bank === 'Cash') ? 'not-allowed' : 'pointer', fontWeight: 800, minWidth: '56px', background: bank.verifyStatus === 'verified' ? 'linear-gradient(135deg,#22c55e,#16a34a)' : bank.verifyStatus === 'failed' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : bank.verifyStatus === 'loading' ? '#94a3b8' : bank.bank === 'Cash' ? '#d1d5db' : 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {bank.verifyStatus === 'verified' ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                : bank.verifyStatus === 'failed' ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                : bank.bank === 'Cash' ? <span>—</span>
                                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>}
                            </button>
                          </div>
                          <input type="text" value={bank.verifyAccount || ''}
                            onChange={(e) => { const u = [...additionalBanks]; u[index].verifyAccount = e.target.value; u[index].verifyStatus = 'idle'; u[index].verifyData = null; setAdditionalBanks(u) }}
                            placeholder={bank.bank === 'CBE' ? 'Last 8 digits (optional)' : 'Account number (optional)'}
                            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1.5px solid #cbd5e1', borderRadius: '8px', fontSize: '0.82rem', background: '#f8fafc', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                            onFocus={(e) => e.currentTarget.style.borderColor = '#6366f1'}
                            onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e1'} />
                          {bank.verifyStatus === 'verified' && bank.verifyData && (
                            <div style={{ marginTop: '8px', padding: '8px 10px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}>
                              <div style={{ fontWeight: 800, color: '#15803d', fontSize: '0.76rem', marginBottom: '4px' }}>✓ Verified</div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                                {[{ l: 'Payer', v: bank.verifyData.payer_name }, { l: 'Amount', v: bank.verifyData.amount ? `${Number(bank.verifyData.amount).toLocaleString()} ETB` : null }].filter(f => f.v).map(f => (
                                  <div key={f.l} style={{ background: 'white', padding: '4px 8px', borderRadius: '5px', border: '1px solid #bbf7d0' }}>
                                    <div style={{ fontSize: '8px', color: '#6b7280', fontWeight: 700, textTransform: 'uppercase' }}>{f.l}</div>
                                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#111827' }}>{f.v}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {bank.verifyStatus === 'failed' && bank.verifyData && (
                            <div style={{ marginTop: '8px', padding: '7px 10px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px' }}>
                              <div style={{ fontSize: '0.76rem', color: '#dc2626', fontWeight: 700 }}>{bank.verifyData.error || 'Could not verify.'}</div>
                              {bank.verifyData.fallbackUrl && <a href={bank.verifyData.fallbackUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700 }}>🔗 Open receipt page</a>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Notes */}
                  <div>
                    <label style={{
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: '#64748b',
                      display: 'block',
                      marginBottom: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Add notes..."
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: '#f8fafc',
                        outline: 'none',
                        fontFamily: 'inherit',
                        fontWeight: '600',
                        boxSizing: 'border-box',
                        minHeight: '80px',
                        resize: 'vertical',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: '1.5rem 2rem',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  style={{
                    padding: '0.875rem',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e2e8f0'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f1f5f9'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentRequest}
                  style={{
                    padding: '0.875rem',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  ✓ Confirm Payment
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>

      {/* Refund Modal - Professional Design */}
      {showRefundModal && selectedCustomer && (
        <div 
          onClick={() => setShowRefundModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10002,
            backdropFilter: 'blur(2px)',
            padding: '1rem',
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
              overflow: 'hidden',
            }}
          >
            {/* Simple Header */}
            <div style={{
              padding: '1.5rem 1.5rem 1rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#111827',
                  margin: 0,
                }}>
                  Refund Request
                </h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: '0.25rem 0 0 0',
                }}>
                  {selectedCustomer.name}
                </p>
              </div>
              <button
                onClick={() => setShowRefundModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  color: '#6b7280',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3f4f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
              <div style={{ display: 'grid', gap: '1.25rem' }}>

                {/* Refund Items - Direct Input (No Add Button) */}
                <div>
                  <label style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    display: 'block',
                    marginBottom: '0.5rem',
                  }}>
                    Refund Item Details <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <input
                      type="text"
                      value={refundItemName}
                      onChange={(e) => setRefundItemName(e.target.value)}
                      placeholder="Item name"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '0.9375rem',
                        background: 'white',
                        outline: 'none',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <input
                        type="number"
                        value={refundItemQuantity}
                        onChange={(e) => setRefundItemQuantity(e.target.value)}
                        placeholder="Quantity"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '0.9375rem',
                          background: 'white',
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#3b82f6'
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#d1d5db'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      />
                      <input
                        type="number"
                        value={refundItemPrice}
                        onChange={(e) => setRefundItemPrice(e.target.value)}
                        placeholder="Price (ብር)"
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          border: '1px solid #d1d5db',
                          borderRadius: '8px',
                          fontSize: '0.9375rem',
                          background: 'white',
                          outline: 'none',
                          boxSizing: 'border-box',
                          transition: 'all 0.2s',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#3b82f6'
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#d1d5db'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Refund Reason */}
                <div>
                  <label style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    display: 'block',
                    marginBottom: '0.5rem',
                  }}>
                    Refund Reason <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => {
                      const value = e.target.value
                      setRefundReason(value)
                      console.log('📝 Refund reason:', value)
                      console.log('🔘 Button should be enabled:', value.trim().length > 0)
                    }}
                    placeholder="Explain the reason for this refund..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      background: 'white',
                      outline: 'none',
                      transition: 'all 0.2s',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box',
                      minHeight: '100px',
                      resize: 'vertical',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6'
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#d1d5db'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  />
                </div>

              </div>
            </div>

            {/* Footer - Clean Buttons */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb',
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setShowRefundModal(false)}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3f4f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (refundItemName && refundItemQuantity && refundItemPrice && refundReason.trim() && selectedCustomer) {
                    // Calculate total amount from direct inputs
                    const quantity = parseFloat(refundItemQuantity)
                    const price = parseFloat(refundItemPrice)
                    const finalAmount = quantity * price
                    
                    // Create item object
                    const item = {
                      name: refundItemName,
                      quantity: quantity,
                      price: price
                    }
                    
                    // Create refund request
                    const refundRequest = {
                      id: Date.now(),
                      type: 'Refund',
                      customerName: selectedCustomer.name,
                      customer: selectedCustomer.name,
                      amount: finalAmount,
                      reason: refundReason,
                      items: [item], // Single item
                      status: 'Pending',
                      approvalStatus: 'pending',
                      date: new Date().toISOString(),
                      requestedBy: localStorage.getItem('user_email') || 'sales',
                      requestedAt: new Date().toISOString(),
                      isRefund: true,
                    }
                    
                    console.log('🔥 REFUND REQUEST - Saving to payment_requests:', refundRequest)
                    
                    // Save to payment_requests (warehouse requests)
                    const existingRequests = JSON.parse(localStorage.getItem('payment_requests') || '[]')
                    const updatedRequests = [...existingRequests, refundRequest]
                    localStorage.setItem('payment_requests', JSON.stringify(updatedRequests))
                    
                    console.log('💾 Refund request saved to warehouse requests')
                    console.log('📋 Total requests:', updatedRequests.length)
                    
                    // Trigger event for admin payments page
                    window.dispatchEvent(new Event('storage'))
                    
                    // Show success message
                    alert(`✅ Refund Request Submitted!\n\n👤 Customer: ${selectedCustomer.name}\n💸 Total: ${finalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር\n\n📦 Item: ${refundItemName}\n   Qty: ${quantity} × ${price.toLocaleString()} ብር\n\n📝 Reason: ${refundReason}\n⏳ Status: PENDING\n\nThis refund request has been sent to admin for approval.`)
                    
                    setShowRefundModal(false)
                    setShowCustomerModal(false)
                    setSelectedCustomer(null)
                    setRefundAmount('')
                    setRefundReason('')
                    setRefundTransactionId('')
                    setRefundItems([])
                    setRefundItemName('')
                    setRefundItemQuantity('')
                    setRefundItemPrice('')
                  }
                }}
                disabled={!refundItemName || !refundItemQuantity || !refundItemPrice || !refundReason.trim()}
                style={{
                  padding: '0.625rem 1.5rem',
                  background: (!refundItemName || !refundItemQuantity || !refundItemPrice || !refundReason.trim()) ? '#d1d5db' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: (!refundItemName || !refundItemQuantity || !refundItemPrice || !refundReason.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: (!refundItemName || !refundItemQuantity || !refundItemPrice || !refundReason.trim()) ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (refundItemName && refundItemQuantity && refundItemPrice && refundReason.trim()) {
                    e.currentTarget.style.background = '#2563eb'
                  }
                }}
                onMouseLeave={(e) => {
                  if (refundItemName && refundItemQuantity && refundItemPrice && refundReason.trim()) {
                    e.currentTarget.style.background = '#3b82f6'
                  }
                }}
              >
                Submit Refund
              </button>
            </div>
          </div>
        </div>
      )}

    </MainLayout>
  )
}
