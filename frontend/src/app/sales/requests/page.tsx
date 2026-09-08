'use client'

import { useState, useEffect } from 'react'
import MainLayout from '@/components/MainLayout'
import { Trash2, Download, BarChart3 } from 'lucide-react'
import jsPDF from 'jspdf'

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
  balance: number
}

export default function RequestsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filterType, setFilterType] = useState<'All' | 'Payment' | 'Credit'>('All')
  const [showCustomersModal, setShowCustomersModal] = useState(false)
  const [customersList, setCustomersList] = useState<CustomerBalance[]>([])
  const [selectedCustomerDetail, setSelectedCustomerDetail] = useState<string | null>(null)

  useEffect(() => {
    // Add animations CSS
    const style = document.createElement('style')
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideInLeft {
        from {
          opacity: 0;
          transform: translateX(-20px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-20px); }
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Handle navigation visibility based on modal state
  useEffect(() => {
    // Store modal state in localStorage so AdminBottomNav can read it
    if (showCustomersModal || selectedCustomerDetail) {
      localStorage.setItem('modalOpen', 'true')
    } else {
      localStorage.removeItem('modalOpen')
    }
  }, [showCustomersModal, selectedCustomerDetail])

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    // Listen for changes to uploaded_customers_persist (from sales page)
    const handleStorageChange = () => {
      if (showCustomersModal) {
        // Refresh customers list when modal is open and customers change
        openCustomersModal()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [showCustomersModal])

  const loadTransactions = () => {
    const stored = localStorage.getItem('confirmed_transactions')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        console.log('[Load Transactions] Loaded', data.length, 'transactions')
        console.log('[Load Transactions] Raw data:', data)
        setTransactions(data.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      } catch (error) {
        console.error('Error loading transactions:', error)
        setTransactions([])
      }
    } else {
      console.log('[Load Transactions] No transactions found in localStorage')
    }
  }

  const deleteTransaction = (id: number) => {
    const updated = transactions.filter(t => t.id !== id)
    setTransactions(updated)
    localStorage.setItem('confirmed_transactions', JSON.stringify(updated))
  }

  const getCustomerBalance = (customerName: string): number => {
    const custTrans = transactions.filter(t => t.customerName === customerName)
    
    // Sum all PAYMENTS (these are POSITIVE additions to balance)
    const totalPayments = custTrans
      .filter(t => t.type === 'Payment')
      .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)
    
    // Sum all CREDITS (these are NEGATIVE subtractions from balance)
    const totalCredits = custTrans
      .filter(t => t.type === 'Credit')
      .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)
    
    // Balance = Payments (+) minus Credits (-)
    // Example: 5000 payments - 4000 credits = +1000 balance
    const balance = totalPayments - totalCredits
    
    // DEBUG: Log balance calculation
    console.log(`[Balance] ${customerName}: Payments=${totalPayments}, Credits=${totalCredits}, Balance=${balance}`)
    
    return balance
  }

  const getCustomerTransactions = (customerName: string): Transaction[] => {
    return transactions.filter(t => t.customerName === customerName).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  const openCustomersModal = () => {
    // IMPORTANT: Always use ALL transactions to calculate balances (not filtered by type)
    // Show ALL customers regardless of confirmation status
    const allTransactions = transactions
    const uniqueNames = [...new Set(allTransactions.map(t => t.customerName))].sort()
    const customersWithBalance = uniqueNames.map(name => ({
      name,
      balance: getCustomerBalance(name)
    }))
    console.log('[Customers Modal] Total customers:', customersWithBalance.length)
    console.log('[Customers Modal] Customer list:', customersWithBalance)
    setCustomersList(customersWithBalance)
    setShowCustomersModal(true)
  }

  const filteredTransactions = filterType === 'All' 
    ? transactions 
    : transactions.filter(t => t.type === filterType)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  }

  const totalAmount = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)
  const totalPaymentsAmount = filteredTransactions.filter(t => t.type === 'Payment').reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)
  const totalCreditsAmount = filteredTransactions.filter(t => t.type === 'Credit').reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)

  const downloadPDF = () => {
    if (filteredTransactions.length === 0) {
      alert('No transactions to export')
      return
    }

    try {
      const doc = new jsPDF()
      
      doc.setFontSize(16)
      doc.setFont(undefined, 'bold')
      doc.text('Confirmed Transactions Report', 14, 15)
      
      doc.setFontSize(9)
      doc.setFont(undefined, 'normal')
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 23)
      
      const pageHeight = doc.internal.pageSize.getHeight()
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 14
      const tableTop = 30
      const cellHeight = 7
      const headerHeight = 8
      
      const colWidths = {
        dateTime: 35,
        type: 18,
        customer: 45,
        amount: 35,
        additional: 25,
      }
      
      doc.setFillColor(59, 130, 246)
      doc.setTextColor(255, 255, 255)
      doc.setFont(undefined, 'bold')
      doc.setFontSize(9)
      
      let xPos = margin
      doc.rect(margin, tableTop, pageWidth - 2 * margin, headerHeight, 'F')
      
      doc.text('Date & Time', xPos, tableTop + 5)
      xPos += colWidths.dateTime
      doc.text('Type', xPos, tableTop + 5)
      xPos += colWidths.type
      doc.text('Customer', xPos, tableTop + 5)
      xPos += colWidths.customer
      doc.text('Amount', xPos, tableTop + 5, { align: 'right' })
      xPos += colWidths.amount
      doc.text('Additional', xPos, tableTop + 5, { align: 'center' })
      xPos += colWidths.additional
      
      doc.setTextColor(0, 0, 0)
      doc.setFont(undefined, 'normal')
      doc.setFontSize(8)
      
      let yPos = tableTop + headerHeight + 2
      
      filteredTransactions.forEach((transaction, idx) => {
        if (yPos > pageHeight - 15) {
          doc.addPage()
          yPos = 15
        }
        
        xPos = margin
        const dateTime = `${formatDate(transaction.date)} ${formatTime(transaction.date)}`
        const amount = parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })
        const additional = transaction.additional ? parseFloat(transaction.additional).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '-'
        
        doc.text(dateTime, xPos, yPos)
        xPos += colWidths.dateTime
        doc.text(transaction.type, xPos, yPos)
        xPos += colWidths.type
        doc.text(transaction.customerName, xPos, yPos)
        xPos += colWidths.customer
        doc.text(amount, xPos, yPos, { align: 'right' })
        xPos += colWidths.amount
        doc.text(additional, xPos, yPos, { align: 'center' })
        xPos += colWidths.additional
        
        yPos += cellHeight
      })
      
      doc.save(`transactions-${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  return (
    <MainLayout>
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%)',
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
        paddingBottom: '2rem',
      }}>
        {/* Bright Premium Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
          color: '#1e293b',
          padding: '1.2rem 1.5rem',
          marginBottom: '1.2rem',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '150px',
            height: '150px',
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <h1 style={{
              fontSize: '1.3rem',
              fontWeight: '900',
              margin: 0,
              color: '#0f172a',
              letterSpacing: '-0.02em',
            }}>
              Confirmed Transactions
            </h1>
          </div>
        </div>

        <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 1rem' }}>
          {/* Statistics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            <StatCard
              icon="📊"
              label="Total Transactions"
              value={filteredTransactions.length}
              color="#667eea"
              trend={`${filteredTransactions.length} total`}
            />
            <StatCard
              icon="↑"
              label="Total Payments"
              value={filteredTransactions.filter(t => t.type === 'Payment').length}
              color="#10b981"
              trend={`${totalPaymentsAmount.toLocaleString()} ብር`}
            />
            <StatCard
              icon="↓"
              label="Total Credits"
              value={filteredTransactions.filter(t => t.type === 'Credit').length}
              color="#3b82f6"
              trend={`${totalCreditsAmount.toLocaleString()} ብር`}
            />
            <StatCard
              icon="💰"
              label="Total Amount"
              value={totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              color="#f59e0b"
              trend="ብር"
            />
          </div>

          {/* Transactions Table */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          }}>
            {/* Toolbar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f3f4f6 100%)',
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}>
              {/* Filter Buttons */}
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                alignItems: 'center',
              }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  color: '#64748b',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <BarChart3 size={14} />
                </span>
                {(['All', 'Payment', 'Credit'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: filterType === type
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : '#f3f4f6',
                      color: filterType === type ? 'white' : '#64748b',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '0.75rem',
                      transition: 'all 0.2s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                    onMouseEnter={(e) => {
                      if (filterType !== type) {
                        e.currentTarget.style.background = '#e5e7eb'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (filterType !== type) {
                        e.currentTarget.style.background = '#f3f4f6'
                      }
                    }}
                  >
                    {type}
                  </button>
                ))}

                <button
                  onClick={openCustomersModal}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f3f4f6',
                    color: '#64748b',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    transition: 'all 0.2s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#10b981'
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f3f4f6'
                    e.currentTarget.style.color = '#64748b'
                  }}
                >
                  Customers
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={downloadPDF}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.6rem 1.2rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '0.75rem',
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(16, 185, 129, 0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <Download size={14} /> Export PDF
              </button>
            </div>

            {/* Table Content */}
            {filteredTransactions.length === 0 ? (
              <div style={{
                padding: '4rem 2rem',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
                <p style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: '#1e293b',
                  margin: '0 0 0.5rem 0',
                }}>
                  No confirmed transactions yet
                </p>
                <p style={{
                  fontSize: '0.9rem',
                  color: '#64748b',
                  margin: 0,
                }}>
                  Confirmed payments and credits will appear here
                </p>
              </div>
            ) : (
              <div style={{
                overflowX: 'auto',
              }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                }}>
                  <thead>
                    <tr style={{
                      background: '#f8fafc',
                      borderBottom: '2px solid #e2e8f0',
                    }}>
                      <th style={{
                        padding: '1rem 1.5rem',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>Type</th>
                      <th style={{
                        padding: '1rem 1.5rem',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>Customer</th>
                      <th style={{
                        padding: '1rem 1.5rem',
                        textAlign: 'right',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>Amount</th>
                      <th style={{
                        padding: '1rem 1.5rem',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>Additional</th>
                      <th style={{
                        padding: '1rem 1.5rem',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                      }}>Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction, idx) => (
                      <tr
                        key={transaction.id}
                        style={{
                          borderBottom: idx < filteredTransactions.length - 1 ? '1px solid #e2e8f0' : 'none',
                          transition: 'all 0.2s ease',
                          background: 'white',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f8fafc'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'white'
                        }}
                      >
                        <td style={{
                          padding: '1rem 1.5rem',
                          fontSize: '0.95rem',
                        }}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            background: transaction.type === 'Payment'
                              ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                              : 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                            fontWeight: '700',
                            color: transaction.type === 'Payment' ? '#065f46' : '#1e40af',
                          }}>
                            <span>{transaction.type === 'Payment' ? '✓' : '⊘'}</span>
                            <span>{transaction.type}</span>
                          </div>
                        </td>
                        <td style={{
                          padding: '1rem 1.5rem',
                          fontSize: '0.95rem',
                          fontWeight: '600',
                          color: '#1f2937',
                        }}>
                          {transaction.customerName}
                        </td>
                        <td style={{
                          padding: '1rem 1.5rem',
                          fontSize: '1rem',
                          fontWeight: '800',
                          color: transaction.type === 'Payment' ? '#10b981' : '#3b82f6',
                          textAlign: 'right',
                        }}>
                          {parseFloat(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                        </td>
                        <td style={{
                          padding: '1rem 1.5rem',
                          fontSize: '0.9rem',
                          fontWeight: '700',
                          color: transaction.additional ? '#8b5cf6' : '#cbd5e1',
                          textAlign: 'center',
                        }}>
                          {transaction.additional ? `${parseFloat(transaction.additional).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td style={{
                          padding: '1rem 1.5rem',
                          fontSize: '0.85rem',
                          color: '#64748b',
                        }}>
                          <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            alignItems: 'center',
                            fontWeight: '850',
                            fontSize: '0.9rem',
                            color: '#1f2937',
                            letterSpacing: '0.01em',
                          }}>
                            <span>{formatDate(transaction.date)}</span>
                            <span style={{
                              fontWeight: '700',
                              fontSize: '0.8rem',
                              color: '#64748b',
                              letterSpacing: '0.02em',
                            }}>
                              {formatTime(transaction.date)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Customers Modal - ATTRACTIVE */}
        {showCustomersModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(6px)',
            padding: '1rem',
            animation: 'fadeIn 0.3s ease-out',
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '540px',
              maxHeight: '82vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.18), 0 0 50px rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.12)',
              overflow: 'hidden',
              animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>
              {/* STUNNING Header - Premium Gradient */}
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #2563eb 100%)',
                padding: '2.5rem 2.2rem 2rem 2.2rem',
                borderBottom: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}>
                {/* Animated background elements */}
                <div style={{
                  position: 'absolute',
                  top: '-40%',
                  right: '-15%',
                  width: '280px',
                  height: '280px',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  animation: 'float 6s ease-in-out infinite',
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '-30%',
                  left: '-20%',
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  animation: 'float 8s ease-in-out infinite reverse',
                }} />
                
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h2 style={{
                    fontSize: '1.65rem',
                    fontWeight: '900',
                    color: 'white',
                    margin: 0,
                    letterSpacing: '-0.02em',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  }}>
                    💰 Customers
                  </h2>
                  <p style={{
                    fontSize: '0.85rem',
                    color: 'rgba(255, 255, 255, 0.95)',
                    margin: '0.5rem 0 0 0',
                    fontWeight: '600',
                    letterSpacing: '0.02em',
                  }}>
                    {customersList.length} active customers
                  </p>
                </div>

                <button
                  onClick={() => setShowCustomersModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.3)',
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    color: 'white',
                    fontSize: '1.3rem',
                    fontWeight: 'bold',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.transform = 'rotate(0deg) scale(1)'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Content - Scroll area */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.8rem 1.8rem',
                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f0f4f8 100%)',
              }}>
                {customersList.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '3rem 1rem',
                    color: '#999',
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
                    <p style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      margin: 0,
                    }}>
                      No customers found
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}>
                    {customersList.map((customer, idx) => {
                      const balance = customer.balance
                      const isPositive = balance > 0
                      const isNegative = balance < 0
                      const absoluteBalance = Math.abs(balance)
                      
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedCustomerDetail(customer.name)}
                          style={{
                            padding: '1.3rem 1.5rem',
                            background: 'white',
                            borderRadius: '16px',
                            border: '2px solid transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.2rem',
                            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'pointer',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
                            animation: `slideInLeft 0.5s ease-out ${idx * 0.08}s both`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = isPositive ? '#eff6ff' : isNegative ? '#fef2f2' : '#f0f4f8'
                            e.currentTarget.style.borderColor = isPositive ? '#3b82f6' : isNegative ? '#ef4444' : '#6b7280'
                            e.currentTarget.style.boxShadow = isPositive 
                              ? '0 12px 28px rgba(59, 130, 246, 0.18)'
                              : isNegative
                              ? '0 12px 28px rgba(239, 68, 68, 0.18)'
                              : '0 12px 28px rgba(107, 114, 128, 0.12)'
                            e.currentTarget.style.transform = 'translateY(-4px)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'white'
                            e.currentTarget.style.borderColor = 'transparent'
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.06)'
                            e.currentTarget.style.transform = 'translateY(0)'
                          }}
                        >
                          {/* Avatar - Premium */}
                          <div style={{
                            width: '54px',
                            height: '54px',
                            borderRadius: '14px',
                            background: isPositive 
                              ? 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)'
                              : isNegative
                              ? 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)'
                              : 'linear-gradient(135deg, #6b7280 0%, #374151 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '900',
                            fontSize: '1.2rem',
                            flexShrink: 0,
                            boxShadow: isPositive 
                              ? '0 8px 20px rgba(59, 130, 246, 0.35)'
                              : isNegative
                              ? '0 8px 20px rgba(239, 68, 68, 0.35)'
                              : '0 8px 20px rgba(107, 114, 128, 0.25)',
                            transition: 'all 0.3s ease',
                          }}>
                            {customer.name.charAt(0).toUpperCase()}
                          </div>

                          {/* Name & Details */}
                          <div style={{
                            flex: 1,
                            minWidth: 0,
                          }}>
                            <p style={{
                              fontSize: '1rem',
                              fontWeight: '800',
                              color: '#0f172a',
                              margin: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              letterSpacing: '-0.01em',
                            }}>
                              {customer.name}
                            </p>
                            <p style={{
                              fontSize: '0.8rem',
                              color: '#64748b',
                              margin: '0.4rem 0 0 0',
                              fontWeight: '600',
                              letterSpacing: '0.02em',
                            }}>
                              → Click to view details
                            </p>
                          </div>

                          {/* Balance Badge - Clean */}
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.3s ease',
                          }}>
                            <span style={{
                              fontWeight: '900',
                              fontSize: '1.25rem',
                              color: isPositive ? '#10b981' : isNegative ? '#ef4444' : '#6b7280',
                              letterSpacing: '-0.01em',
                            }}>
                              {isPositive ? '+' : isNegative ? '−' : ''}{absoluteBalance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div style={{
                background: 'linear-gradient(135deg, #fafbfc 0%, #f0f4f8 100%)',
                borderTop: '2px solid rgba(59, 130, 246, 0.08)',
                padding: '1.5rem 1.8rem',
                textAlign: 'center',
              }}>
                <button
                  onClick={() => setShowCustomersModal(false)}
                  style={{
                    padding: '1rem 2.5rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.35)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.25)'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Customer Detail Modal - ATTRACTIVE */}
        {selectedCustomerDetail && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            backdropFilter: 'blur(6px)',
            padding: '1rem',
            animation: 'fadeIn 0.3s ease-out',
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '460px',
              maxHeight: '78vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.18), 0 0 50px rgba(59, 130, 246, 0.12)',
              border: '1px solid rgba(59, 130, 246, 0.12)',
              overflow: 'hidden',
              animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>
              {/* PREMIUM Header - Gradient */}
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 50%, #2563eb 100%)',
                padding: '1.8rem 2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-30%',
                  right: '-20%',
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  animation: 'float 6s ease-in-out infinite',
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 1 }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.3rem',
                    fontWeight: '900',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                  }}>
                    {selectedCustomerDetail.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: '1.35rem',
                      fontWeight: '900',
                      color: 'white',
                      margin: 0,
                      letterSpacing: '-0.01em',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    }}>
                      {selectedCustomerDetail}
                    </h2>
                    <p style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.85)',
                      margin: '0.3rem 0 0 0',
                      fontWeight: '600',
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                    }}>
                      Transaction Details
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCustomerDetail(null)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    border: '1.5px solid rgba(255, 255, 255, 0.3)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '1.2rem',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.transform = 'rotate(90deg) scale(1.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.transform = 'rotate(0deg) scale(1)'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1.8rem',
                background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f0f4f8 100%)',
              }}>
                {(() => {
                  const customerTransactions = getCustomerTransactions(selectedCustomerDetail)
                  const totalPayments = customerTransactions
                    .filter(t => t.type === 'Payment')
                    .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)
                  const totalCredits = customerTransactions
                    .filter(t => t.type === 'Credit')
                    .reduce((sum, t) => sum + parseFloat(t.amount || '0'), 0)
                  const finalBalance = totalPayments - totalCredits

                  return (
                    <>
                      {/* Summary Stats - PREMIUM */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '1rem',
                        marginBottom: '1.8rem',
                      }}>
                        {/* Balance - LARGEST - No Frame */}
                        <div style={{
                          padding: '2rem 1.5rem',
                          borderRadius: '16px',
                          textAlign: 'center',
                          background: 'transparent',
                          border: 'none',
                          animation: 'slideInUp 0.5s ease-out',
                        }}>
                          <p style={{
                            fontSize: '0.8rem',
                            fontWeight: '900',
                            color: '#64748b',
                            margin: 0,
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                          }}>
                            Current Balance
                          </p>
                          <p style={{
                            fontSize: '2.6rem',
                            fontWeight: '950',
                            color: finalBalance >= 0 ? '#10b981' : '#ef4444',
                            margin: '0.8rem 0 0 0',
                            letterSpacing: '-0.02em',
                          }}>
                            {finalBalance >= 0 ? '+' : '−'}{Math.abs(finalBalance).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </p>
                        </div>

                        {/* Payments & Credits Row - No Frames */}
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '1rem',
                        }}>
                          <div style={{
                            background: 'transparent',
                            padding: '1.2rem',
                            borderRadius: '14px',
                            textAlign: 'center',
                            border: 'none',
                            boxShadow: 'none',
                            animation: 'slideInUp 0.5s ease-out 0.1s both',
                          }}>
                            <p style={{
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              color: '#3b82f6',
                              margin: 0,
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                            }}>
                              📥 Paid
                            </p>
                            <p style={{
                              fontSize: '1.8rem',
                              fontWeight: '900',
                              color: '#3b82f6',
                              margin: '0.6rem 0 0 0',
                              letterSpacing: '-0.01em',
                            }}>
                              +{totalPayments.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                          </div>

                          <div style={{
                            background: 'transparent',
                            padding: '1.2rem',
                            borderRadius: '14px',
                            textAlign: 'center',
                            border: 'none',
                            boxShadow: 'none',
                            animation: 'slideInUp 0.5s ease-out 0.15s both',
                          }}>
                            <p style={{
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              color: '#6b7280',
                              margin: 0,
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                            }}>
                              📤 Credit
                            </p>
                            <p style={{
                              fontSize: '1.8rem',
                              fontWeight: '900',
                              color: '#6b7280',
                              margin: '0.6rem 0 0 0',
                              letterSpacing: '-0.01em',
                            }}>
                              −{totalCredits.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Transactions History */}
                      <div>
                        <p style={{
                          fontSize: '0.8rem',
                          fontWeight: '900',
                          color: '#475569',
                          margin: '0 0 1rem 0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}>
                          📋 Recent Transactions
                        </p>
                        {customerTransactions.length === 0 ? (
                          <div style={{
                            textAlign: 'center',
                            padding: '2rem 1rem',
                            color: '#999',
                          }}>
                            <p style={{
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              margin: 0,
                            }}>
                              No transactions yet
                            </p>
                          </div>
                        ) : (
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.8rem',
                          }}>
                            {customerTransactions.slice(0, 8).map((trans, idx) => (
                              <div
                                key={trans.id}
                                style={{
                                  background: trans.type === 'Payment' ? '#eff6ff' : '#f9fafb',
                                  padding: '1rem',
                                  borderRadius: '12px',
                                  border: trans.type === 'Payment' 
                                    ? '1.5px solid #bfdbfe'
                                    : '1.5px solid #e5e7eb',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                  transition: 'all 0.3s ease',
                                  animation: `slideInLeft 0.5s ease-out ${0.2 + idx * 0.05}s both`,
                                }}
                              >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.3rem 0.8rem',
                                    borderRadius: '6px',
                                    background: trans.type === 'Payment' ? '#bfdbfe' : '#d1d5db',
                                    fontWeight: '700',
                                    fontSize: '0.65rem',
                                    color: trans.type === 'Payment' ? '#1e40af' : '#4b5563',
                                    marginBottom: '0.5rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                  }}>
                                    <span>{trans.type === 'Payment' ? '✓' : '⊘'}</span>
                                    {trans.type}
                                  </div>
                                  <p style={{
                                    fontSize: '0.8rem',
                                    color: '#1f2937',
                                    margin: '0.3rem 0 0 0',
                                    fontWeight: '600',
                                  }}>
                                    {trans.type === 'Payment' ? trans.bank : trans.reason || 'Credit'}
                                  </p>
                                  <p style={{
                                    fontSize: '0.7rem',
                                    color: '#9ca3af',
                                    margin: '0.2rem 0 0 0',
                                    fontWeight: '500',
                                  }}>
                                    {formatDate(trans.date)}
                                  </p>
                                </div>
                                <div style={{
                                  textAlign: 'right',
                                  marginLeft: '1rem',
                                  whiteSpace: 'nowrap',
                                }}>
                                  <p style={{
                                    fontSize: '1.15rem',
                                    fontWeight: '900',
                                    color: trans.type === 'Payment' ? '#3b82f6' : '#6b7280',
                                    margin: 0,
                                    letterSpacing: '-0.01em',
                                  }}>
                                    {trans.type === 'Payment' ? '+' : '−'}{parseFloat(trans.amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {customerTransactions.length > 8 && (
                              <p style={{
                                fontSize: '0.75rem',
                                color: '#9ca3af',
                                textAlign: 'center',
                                margin: '0.8rem 0 0 0',
                                fontWeight: '600',
                              }}>
                                +{customerTransactions.length - 8} more transactions
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Footer */}
              <div style={{
                background: 'linear-gradient(135deg, #fafbfc 0%, #f0f4f8 100%)',
                borderTop: '2px solid rgba(59, 130, 246, 0.08)',
                padding: '1.5rem 1.8rem',
                textAlign: 'center',
              }}>
                <button
                  onClick={() => setSelectedCustomerDetail(null)}
                  style={{
                    padding: '0.95rem 2.2rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '800',
                    fontSize: '0.85rem',
                    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    boxShadow: '0 8px 20px rgba(59, 130, 246, 0.25)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.35)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.25)'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

function StatCard({ icon, label, value, color, trend }: any) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      border: '1px solid rgba(0, 0, 0, 0.03)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)'
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.08)'
      e.currentTarget.style.borderColor = color
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)'
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)'
      e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.03)'
    }}
    >
      <div style={{
        position: 'absolute',
        top: '-30px',
        right: '-30px',
        width: '100px',
        height: '100px',
        background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: '800',
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            {label}
          </span>
          <div style={{
            fontSize: '1.1rem',
          }}>
            {icon}
          </div>
        </div>

        <p style={{
          fontSize: '1.5rem',
          fontWeight: '950',
          margin: '0 0 0.5rem 0',
          color: '#0f172a',
          letterSpacing: '-0.03em',
        }}>
          {value}
        </p>

        <p style={{
          fontSize: '0.8rem',
          color: color,
          fontWeight: '700',
          margin: 0,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          {trend}
        </p>
      </div>
    </div>
  )
}
