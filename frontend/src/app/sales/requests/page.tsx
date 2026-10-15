'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import { Trash2, Download, BarChart3, DollarSign, TrendingUp, TrendingDown, Check, X, Clock, FileText } from 'lucide-react'
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

export default function RequestsPage() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filterType, setFilterType] = useState<'All' | 'Payment' | 'Credit'>('All')

  useEffect(() => {
    loadTransactions()
    
    // Listen for transaction approval events
    const handleTransactionApproved = () => {
      console.log('📢 Transaction approved event received, reloading transactions...')
      loadTransactions()
    }
    
    window.addEventListener('transactionApproved', handleTransactionApproved)
    
    return () => {
      window.removeEventListener('transactionApproved', handleTransactionApproved)
    }
  }, [])

  const loadTransactions = () => {
    const stored = localStorage.getItem('confirmed_transactions')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        // Filter out approved transactions - only show pending ones
        const pendingTransactions = data.filter((t: any) => t.approvalStatus !== 'approved')
        console.log('[Load Transactions] Total:', data.length, 'Pending:', pendingTransactions.length, 'Approved (filtered):', data.length - pendingTransactions.length)
        setTransactions(pendingTransactions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()))
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

  // Calculate waiting days for credit transactions
  const calculateWaitingDays = (dateString: string) => {
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
              icon={<BarChart3 size={24} />}
              label="Total Transactions"
              value={filteredTransactions.length}
              color="#667eea"
              trend={`${filteredTransactions.length} total`}
            />
            <StatCard
              icon={<TrendingUp size={24} />}
              label="Total Payments"
              value={filteredTransactions.filter(t => t.type === 'Payment').length}
              color="#10b981"
              trend={`${totalPaymentsAmount.toLocaleString()} ብር`}
            />
            <StatCard
              icon={<TrendingDown size={24} />}
              label="Total Credits"
              value={filteredTransactions.filter(t => t.type === 'Credit').length}
              color="#3b82f6"
              trend={`${totalCreditsAmount.toLocaleString()} ብር`}
            />
            <StatCard
              icon={<DollarSign size={24} />}
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
                  onClick={() => router.push('/sales/customers-balance')}
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
                <div style={{ fontSize: '3rem', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                  <FileText size={64} color="#cbd5e1" />
                </div>
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
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>Waiting Days</th>
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
                            {transaction.type === 'Payment' ? <Check size={18} /> : <X size={18} />}
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
                        {/* Waiting Days - Only for Credit */}
                        <td style={{
                          padding: '1rem 1.5rem',
                          fontSize: '0.95rem',
                          fontWeight: '800',
                          textAlign: 'center',
                        }}>
                          {transaction.type === 'Credit' ? (
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem 1rem',
                              borderRadius: '8px',
                              background: calculateWaitingDays(transaction.date) > 30 
                                ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)'
                                : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                              color: calculateWaitingDays(transaction.date) > 30 ? '#991b1b' : '#92400e',
                            }}>
                              <Clock size={18} />
                              <span style={{ fontWeight: '900' }}>{calculateWaitingDays(transaction.date)}</span>
                              <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>days</span>
                            </div>
                          ) : (
                            <span style={{ color: '#cbd5e1', fontSize: '1rem' }}>-</span>
                          )}
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
      </div>
    </MainLayout>
  )
}

function StatCard({ icon, label, value, color, trend }: { icon: React.ReactNode, label: string, value: number | string, color: string, trend: string }) {
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
