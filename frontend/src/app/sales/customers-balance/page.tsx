'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import { ArrowLeft, Users, TrendingUp, TrendingDown, ChevronRight, ChevronDown, CreditCard, Banknote, Clock } from 'lucide-react'

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
                    <>
                      {/* Customer Row */}
                      <tr
                        key={customer.name}
                        onClick={() => toggleCustomerExpand(customer.name)}
                        style={{
                          cursor: 'pointer',
                          borderBottom: expandedCustomer === customer.name ? 'none' : '1px solid #e2e8f0',
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
                          {expandedCustomer === customer.name ? (
                            <ChevronDown size={20} />
                          ) : (
                            <ChevronRight size={20} />
                          )}
                        </td>
                      </tr>

                      {/* Expanded Transaction Details */}
                      {expandedCustomer === customer.name && (
                        <tr key={`${customer.name}-details`}>
                          <td colSpan={5} style={{
                            padding: 0,
                            borderBottom: idx < customers.length - 1 ? '1px solid #e2e8f0' : 'none',
                          }}>
                            <div style={{
                              background: '#f8fafc',
                              borderTop: '1px solid #e2e8f0',
                              padding: '1.5rem',
                            }}>
                              <h3 style={{
                                fontSize: '0.875rem',
                                fontWeight: '600',
                                color: '#475569',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                margin: '0 0 1rem 0',
                              }}>
                                Transaction History
                              </h3>
                              <div style={{
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
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
                                        padding: '0.75rem 1rem',
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
                                        padding: '0.75rem 1rem',
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
                                        padding: '0.75rem 1rem',
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
                                        padding: '0.75rem 1rem',
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
                                    {getCustomerTransactions(customer.name).map((transaction, tIdx) => (
                                      <tr
                                        key={transaction.id}
                                        style={{
                                          borderBottom: tIdx < getCustomerTransactions(customer.name).length - 1 ? '1px solid #e2e8f0' : 'none',
                                        }}
                                      >
                                        <td style={{
                                          padding: '0.75rem 1rem',
                                          fontSize: '0.875rem',
                                        }}>
                                          <div style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '6px',
                                            background: transaction.type === 'Payment' ? '#dcfce7' : '#dbeafe',
                                            color: transaction.type === 'Payment' ? '#166534' : '#1e40af',
                                            fontSize: '0.75rem',
                                            fontWeight: '600',
                                          }}>
                                            {transaction.type === 'Payment' ? <Banknote size={14} /> : <CreditCard size={14} />}
                                            {transaction.type}
                                          </div>
                                          {transaction.type === 'Credit' && (
                                            <div style={{
                                              display: 'inline-flex',
                                              alignItems: 'center',
                                              gap: '0.25rem',
                                              marginLeft: '0.5rem',
                                              padding: '0.25rem 0.5rem',
                                              borderRadius: '6px',
                                              background: '#fef3c7',
                                              color: '#92400e',
                                              fontSize: '0.7rem',
                                              fontWeight: '600',
                                            }}>
                                              <Clock size={12} />
                                              {calculateWaitingDays(transaction.date)} days
                                            </div>
                                          )}
                                        </td>
                                        <td style={{
                                          padding: '0.75rem 1rem',
                                          fontSize: '0.875rem',
                                          color: '#374151',
                                          fontWeight: '500',
                                        }}>
                                          {transaction.type === 'Payment' ? transaction.bank : transaction.reason || 'Credit'}
                                        </td>
                                        <td style={{
                                          padding: '0.75rem 1rem',
                                          fontSize: '0.875rem',
                                          fontWeight: '700',
                                          textAlign: 'right',
                                          color: transaction.type === 'Payment' ? '#16a34a' : '#2563eb',
                                        }}>
                                          {parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td style={{
                                          padding: '0.75rem 1rem',
                                          fontSize: '0.875rem',
                                          color: '#64748b',
                                        }}>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                                            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1f2937' }}>
                                              {formatDate(transaction.date)}
                                            </span>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
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
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
