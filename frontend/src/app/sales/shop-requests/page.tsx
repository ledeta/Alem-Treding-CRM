'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, DollarSign, Receipt, Info, Calendar, User, Building2, Hash, FileText, Package } from 'lucide-react'
import AdminBottomNav from '@/components/AdminBottomNav'

interface ShopRequest {
  id: number
  type: 'Payment' | 'Credit'
  customerName: string
  amount: string
  bank?: string
  reason?: string
  notes?: string
  status: string
  approvalStatus: 'pending' | 'approved' | 'rejected'
  date: string
  requestedBy?: string
  totalItems?: number
  isMultiBankPayment?: boolean
  totalPaymentAmount?: string
  bankNumber?: number
  totalBanks?: number
}

export default function ShopRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<ShopRequest[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('shop_payment_requests')
      if (stored) {
        const all = JSON.parse(stored) as ShopRequest[]
        setRequests(all.filter(r => r.approvalStatus === 'pending'))
      }
    } catch (e) {
      console.error('Error loading shop requests:', e)
    }
  }, [])

  const totalAmount = requests.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
  const paymentCount = requests.filter(r => r.type === 'Payment').length
  const creditCount = requests.filter(r => r.type === 'Credit').length

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } catch { return iso }
  }

  return (
    <div style={{minHeight: '100vh', background: '#f1f5f9', paddingBottom: '90px'}}>
      {/* Page Header */}
      <div style={{background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 10,}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <button
            onClick={() => router.push('/sales/shop')}
            style={{background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
              flexShrink: 0,}}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a'}}>Shop Requests</h1>
            <p style={{margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 500}}>
              {requests.length} pending {requests.length === 1 ? 'request' : 'requests'}
            </p>
          </div>
        </div>
      </div>

      <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>

        {/* Statistics Cards */}
        <div style={{display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '24px',}}>
          {/* Total Amount */}
          <div style={{background: 'white',
            borderRadius: '14px',
            padding: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',}}>
            <div style={{background: '#f0fdf4',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',}}>
              <DollarSign size={18} color="#059669" />
            </div>
            <p style={{margin: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em'}}>Total Amount</p>
            <p style={{margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a'}}>
              {totalAmount.toLocaleString()} ብር
            </p>
          </div>

          {/* Payments */}
          <div style={{background: 'white',
            borderRadius: '14px',
            padding: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',}}>
            <div style={{background: '#f0fdf4',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',}}>
              <Receipt size={18} color="#059669" />
            </div>
            <p style={{margin: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em'}}>Payments</p>
            <p style={{margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a'}}>{paymentCount}</p>
          </div>

          {/* Credits */}
          <div style={{background: 'white',
            borderRadius: '14px',
            padding: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',}}>
            <div style={{background: '#eff6ff',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '10px',}}>
              <CreditCard size={18} color="#2563eb" />
            </div>
            <p style={{margin: '0 0 4px 0', fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em'}}>Credits</p>
            <p style={{margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a'}}>{creditCount}</p>
          </div>
        </div>

        {/* Request List */}
        {requests.length === 0 ? (
          <div style={{background: 'white',
            borderRadius: '16px',
            padding: '60px 32px',
            textAlign: 'center',
            border: '1px solid #e2e8f0',}}>
            <div style={{background: '#f1f5f9',
              borderRadius: '50%',
              width: '72px',
              height: '72px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',}}>
              <FileText size={32} color="#94a3b8" />
            </div>
            <h2 style={{margin: '0 0 8px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a'}}>No Pending Requests</h2>
            <p style={{margin: 0, fontSize: '14px', color: '#64748b'}}>
              Shop payment and credit requests will appear here
            </p>
          </div>
        ) : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {requests.map((request) => (
              <div
                key={request.id}
                style={{background: 'white',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',}}
              >
                {/* Card Header */}
                <div style={{padding: '16px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    {/* Type badge */}
                    <span style={{display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      background: request.type === 'Payment' ? '#dcfce7' : '#dbeafe',
                      color: request.type === 'Payment' ? '#166534' : '#1e40af',}}>
                      {request.type === 'Payment'
                        ? <Receipt size={12} />
                        : <CreditCard size={12} />}
                      {request.type}
                    </span>
                    {/* Customer name */}
                    <span style={{fontSize: '16px', fontWeight: 700, color: '#0f172a'}}>
                      {request.customerName}
                    </span>
                  </div>
                  {/* Amount */}
                  <div style={{textAlign: 'right', flexShrink: 0}}>
                    <p style={{margin: 0, fontSize: '18px', fontWeight: 800, color: request.type === 'Payment' ? '#059669' : '#2563eb'}}>
                      {parseFloat(request.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                    <p style={{margin: 0, fontSize: '11px', color: '#94a3b8', fontWeight: 600}}>ብር</p>
                  </div>
                </div>

                {/* Card Body */}
                <div style={{padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  {/* Bank & Transaction ID row (payments only) */}
                  {request.type === 'Payment' && (
                    <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                        <Building2 size={14} color="#64748b" />
                        <span style={{fontSize: '13px', color: '#64748b', fontWeight: 500}}>Bank:</span>
                        <span style={{fontSize: '13px', color: '#0f172a', fontWeight: 700}}>{request.bank || 'N/A'}</span>
                      </div>
                      {request.reason && (
                        <div style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                          <Hash size={14} color="#64748b" />
                          <span style={{fontSize: '13px', color: '#64748b', fontWeight: 500}}>Txn ID:</span>
                          <span style={{fontSize: '13px', color: '#0f172a', fontWeight: 700}}>{request.reason}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reason (credits only) */}
                  {request.type === 'Credit' && request.reason && (
                    <div style={{display: 'flex', alignItems: 'flex-start', gap: '6px'}}>
                      <FileText size={14} color="#64748b" style={{flexShrink: 0, marginTop: '2px'}} />
                      <span style={{fontSize: '13px', color: '#64748b', fontWeight: 500}}>Reason:</span>
                      <span style={{fontSize: '13px', color: '#0f172a', fontWeight: 600}}>{request.reason}</span>
                    </div>
                  )}

                  {/* Multi-bank indicator */}
                  {request.isMultiBankPayment && (
                    <div style={{display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: '#fffbeb',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      border: '1px solid #fde68a',}}>
                      <Info size={13} color="#92400e" />
                      <span style={{fontSize: '12px', fontWeight: 600, color: '#92400e'}}>
                        Part {request.bankNumber} of {request.totalBanks} &nbsp;&bull;&nbsp; Total: {parseFloat(request.totalPaymentAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                      </span>
                    </div>
                  )}

                  {/* Notes */}
                  {request.notes && (
                    <div style={{background: '#f8fafc',
                      borderLeft: '3px solid #cbd5e1',
                      borderRadius: '0 8px 8px 0',
                      padding: '8px 12px',}}>
                      <p style={{margin: 0, fontSize: '12px', color: '#475569'}}>{request.notes}</p>
                    </div>
                  )}

                  {/* Footer row: requester + date */}
                  <div style={{display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '4px',
                    paddingTop: '8px',
                    borderTop: '1px solid #f1f5f9',}}>
                    {request.requestedBy && (
                      <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                        <User size={12} color="#94a3b8" />
                        <span style={{fontSize: '12px', color: '#94a3b8', fontWeight: 500}}>{request.requestedBy}</span>
                      </div>
                    )}
                    <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                      <Calendar size={12} color="#94a3b8" />
                      <span style={{fontSize: '12px', color: '#94a3b8', fontWeight: 500}}>{formatDate(request.date)}</span>
                    </div>
                    <span style={{marginLeft: 'auto',
                      background: '#fef9c3',
                      color: '#854d0e',
                      borderRadius: '20px',
                      padding: '2px 10px',
                      fontSize: '11px',
                      fontWeight: 700,}}>Pending</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminBottomNav />
    </div>
  )
}
