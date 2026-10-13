'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Send, Clock, CheckCircle, XCircle, DollarSign, Calendar, User, Package, FileText, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AdminBottomNav from '@/components/AdminBottomNav'

interface PaymentRequest {
  id: number
  amount: number
  note: string
  requestedBy: string
  date: string
  status: 'pending' | 'approved' | 'rejected'
  totalItems?: number
  totalSales?: number
  itemName?: string
  itemCategory?: string
  itemQuantity?: number
}

export default function PaymentRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<PaymentRequest[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = () => {
    try {
      const storedRequests = localStorage.getItem('payment_requests')
      if (storedRequests) {
        const parsedRequests = JSON.parse(storedRequests)
        setRequests(parsedRequests)
      }
    } catch (e) {
      console.error('Error loading payment requests:', e)
    }
  }

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true
    return req.status === filter
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={20} color="#059669" />
      case 'rejected':
        return <XCircle size={20} color="#dc2626" />
      default:
        return <Clock size={20} color="#f59e0b" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return { bg: '#d1fae5', color: '#065f46' }
      case 'rejected':
        return { bg: '#fee2e2', color: '#991b1b' }
      default:
        return { bg: '#fef3c7', color: '#92400e' }
    }
  }

  const totalPending = requests.filter(r => r.status === 'pending').length
  const totalApproved = requests.filter(r => r.status === 'approved').length
  const totalAmount = requests.reduce((sum, r) => sum + r.amount, 0)

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paddingBottom: '90px'
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <button
            onClick={() => router.back()}
            style={{
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '10px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e5e7eb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f3f4f6'
            }}
          >
            <ArrowLeft size={20} color="#374151" />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: '24px', color: '#1f2937', fontWeight: 700 }}>
              Payment Requests
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>
              {requests.length} total requests
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#92400e' }}>
              {totalPending}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#78350f', fontWeight: 600 }}>
              Pending
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#065f46' }}>
              {totalApproved}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#064e3b', fontWeight: 600 }}>
              Approved
            </p>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%)',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center'
          }}>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#5b21b6' }}>
              {totalAmount.toLocaleString()}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#4c1d95', fontWeight: 600 }}>
              Total ብር
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px' }}>
          {(['all', 'pending', 'approved', 'rejected'] as const).map(filterOption => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              style={{
                background: filter === filterOption ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                color: filter === filterOption ? 'white' : '#6b7280',
                border: filter === filterOption ? 'none' : '2px solid #e5e7eb',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                textTransform: 'capitalize'
              }}
            >
              {filterOption}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div style={{ padding: '20px' }}>
        {filteredRequests.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredRequests.slice().reverse().map((request) => {
              const statusColors = getStatusColor(request.status)
              return (
                <div
                  key={request.id}
                  onClick={() => {
                    setSelectedRequest(request)
                    setShowDetailModal(true)
                  }}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: '1px solid #f3f4f6'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.2)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        {getStatusIcon(request.status)}
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#1f2937' }}>
                          {request.itemName || `Payment Request #${request.id.toString().slice(-6)}`}
                        </h3>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                        {new Date(request.date).toLocaleDateString()} • {new Date(request.date).toLocaleTimeString()}
                      </p>
                      {request.note && (
                        <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#374151', fontStyle: 'italic' }}>
                          "{request.note}"
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        marginBottom: '8px'
                      }}>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'white' }}>
                          {request.amount.toLocaleString()} ብር
                        </p>
                      </div>
                      <span style={{
                        background: statusColors.bg,
                        color: statusColors.color,
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '10px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        display: 'inline-block'
                      }}>
                        {request.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{
                      background: '#f3f4f6',
                      borderRadius: '6px',
                      padding: '6px 10px',
                      fontSize: '11px',
                      color: '#6b7280',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <User size={12} />
                      {request.requestedBy}
                    </div>
                    {request.totalItems !== undefined && (
                      <div style={{
                        background: '#f3f4f6',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '11px',
                        color: '#6b7280',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <Package size={12} />
                        {request.totalItems} {request.totalItems === 1 ? 'item' : 'items'}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'white'
          }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '24px',
              padding: '40px',
              backdropFilter: 'blur(10px)',
              border: '2px dashed rgba(255, 255, 255, 0.3)',
              display: 'inline-block'
            }}>
              <Send size={64} color="white" style={{ opacity: 0.6, marginBottom: '20px' }} />
              <p style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 8px 0' }}>
                No {filter !== 'all' ? filter : ''} requests
              </p>
              <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>
                {filter === 'all' 
                  ? 'Payment requests will appear here' 
                  : `No ${filter} requests found`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div
          onClick={() => setShowDetailModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: getStatusColor(selectedRequest.status).bg,
              padding: '24px',
              borderRadius: '20px 20px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                {getStatusIcon(selectedRequest.status)}
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: getStatusColor(selectedRequest.status).color }}>
                    Payment Request Details
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: getStatusColor(selectedRequest.status).color, opacity: 0.8 }}>
                    Status: {selectedRequest.status.toUpperCase()}
                  </p>
                </div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  Requested Amount
                </p>
                <p style={{ margin: 0, fontSize: '32px', fontWeight: 900, color: '#1f2937' }}>
                  {selectedRequest.amount.toLocaleString()} ብር
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 700, color: '#1f2937' }}>
                Request Information
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Date */}
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    background: '#667eea',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Calendar size={16} color="white" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>Date & Time</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>
                      {new Date(selectedRequest.date).toLocaleDateString()} • {new Date(selectedRequest.date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                {/* Requested By */}
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '10px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    background: '#10b981',
                    borderRadius: '8px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <User size={16} color="white" />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>Requested By</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>
                      {selectedRequest.requestedBy}
                    </p>
                  </div>
                </div>

                {/* Total Items */}
                {selectedRequest.totalItems !== undefined && (
                  <div style={{
                    background: '#f9fafb',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      background: '#f59e0b',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Package size={16} color="white" />
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>Total Items</p>
                      <p style={{ margin: '2px 0 0 0', fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>
                        {selectedRequest.totalItems} {selectedRequest.totalItems === 1 ? 'item' : 'items'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Note */}
                {selectedRequest.note && (
                  <div style={{
                    background: '#f9fafb',
                    borderRadius: '10px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'start',
                    gap: '12px'
                  }}>
                    <div style={{
                      background: '#8b5cf6',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FileText size={16} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>Note</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#1f2937', fontStyle: 'italic' }}>
                        "{selectedRequest.note}"
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  width: '100%',
                  marginTop: '24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </div>
  )
}
