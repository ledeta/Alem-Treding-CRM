'use client'

import { useState, useEffect, useRef } from 'react'
import AdminBottomNav from '@/components/AdminBottomNav'
import { Users, Mail, Phone, MapPin, DollarSign, CreditCard, ShoppingCart, RotateCcw, X, Edit2, Check, XCircle } from 'lucide-react'

interface Transaction {
  id: number
  customer: string
  customerName: string
  type: 'Payment' | 'Credit'
  amount: string
  date: string
  status: 'Approved' | 'Pending' | 'Rejected'
  approvalStatus: 'pending' | 'approved' | 'rejected'
  bank?: string
  reason?: string
  itemsCount?: number
  items?: Array<{
    itemName: string
    quantity: number | string
    price: number | string
    total: number | string
  }>
}

interface Customer {
  name: string
  email: string
  phone: string
  address: string
  city: string
  balance: number
  status: 'Active' | 'Inactive'
  transactions: Transaction[]
  lastTransaction: string
  memberSince: string
  totalPurchases: number
  totalCredits: number
  totalRefunds: number
}

const CustomerDetailModal = ({ customer, onClose }: { customer: Customer | null; onClose: () => void }) => {
  if (!customer) return null

  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    city: customer.city,
  })

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    } catch {
      return dateStr
    }
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 0 })} ብር`
  }

  const handleSaveEdit = (field: string) => {
    console.log(`Saved ${field}:`, editValues[field as keyof typeof editValues])
    setEditingField(null)
  }

  const handleCancelEdit = () => {
    setEditValues({
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
    })
    setEditingField(null)
  }

  return (
    <div
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
        zIndex: 1000,
        padding: '1rem',
        overflow: 'auto',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          margin: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Purple Gradient */}
        <div
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
            color: 'white',
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: 'none',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>{customer.name}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              padding: '0.5rem',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Contact Information Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Contact Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Mail size={18} style={{ color: '#a855f7', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, marginBottom: '0.25rem', fontWeight: '500' }}>Email</p>
                  {editingField === 'email' ? (
                    <input
                      type="email"
                      value={editValues.email}
                      onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                      style={{
                        fontSize: '0.85rem',
                        color: '#1f2937',
                        fontWeight: '500',
                        padding: '0.5rem 0.6rem',
                        border: '2px solid #a855f7',
                        borderRadius: '6px',
                        width: '100%',
                        fontFamily: 'inherit',
                        outline: 'none',
                        backgroundColor: 'white',
                      }}
                      autoFocus
                    />
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: '#1f2937', margin: 0, fontWeight: '500' }}>{customer.email}</p>
                  )}
                </div>
                {editingField === 'email' ? (
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleSaveEdit('email')}
                      style={{
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#059669'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#10b981'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#dc2626'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ef4444'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingField('email')}
                    style={{
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      background: '#a855f7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#9333ea'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#a855f7'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>

              {/* Phone */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <Phone size={18} style={{ color: '#a855f7', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, marginBottom: '0.25rem', fontWeight: '500' }}>Phone</p>
                  {editingField === 'phone' ? (
                    <input
                      type="tel"
                      value={editValues.phone}
                      onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                      style={{
                        fontSize: '0.85rem',
                        color: '#1f2937',
                        fontWeight: '500',
                        padding: '0.5rem 0.6rem',
                        border: '2px solid #a855f7',
                        borderRadius: '6px',
                        width: '100%',
                        fontFamily: 'inherit',
                        outline: 'none',
                        backgroundColor: 'white',
                      }}
                      autoFocus
                    />
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: '#1f2937', margin: 0, fontWeight: '500' }}>{customer.phone}</p>
                  )}
                </div>
                {editingField === 'phone' ? (
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleSaveEdit('phone')}
                      style={{
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#059669'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#10b981'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#dc2626'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ef4444'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingField('phone')}
                    style={{
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      background: '#a855f7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#9333ea'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#a855f7'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>

              {/* Address */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <MapPin size={18} style={{ color: '#a855f7', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, marginBottom: '0.25rem', fontWeight: '500' }}>Address</p>
                  {editingField === 'address' ? (
                    <input
                      type="text"
                      value={editValues.address}
                      onChange={(e) => setEditValues({ ...editValues, address: e.target.value })}
                      style={{
                        fontSize: '0.85rem',
                        color: '#1f2937',
                        fontWeight: '500',
                        padding: '0.5rem 0.6rem',
                        border: '2px solid #a855f7',
                        borderRadius: '6px',
                        width: '100%',
                        fontFamily: 'inherit',
                        outline: 'none',
                        backgroundColor: 'white',
                      }}
                      autoFocus
                    />
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: '#1f2937', margin: 0, fontWeight: '500' }}>{customer.address}</p>
                  )}
                </div>
                {editingField === 'address' ? (
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleSaveEdit('address')}
                      style={{
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#059669'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#10b981'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#dc2626'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ef4444'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingField('address')}
                    style={{
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      background: '#a855f7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#9333ea'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#a855f7'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>

              {/* City */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <MapPin size={18} style={{ color: '#a855f7', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, marginBottom: '0.25rem', fontWeight: '500' }}>City</p>
                  {editingField === 'city' ? (
                    <input
                      type="text"
                      value={editValues.city}
                      onChange={(e) => setEditValues({ ...editValues, city: e.target.value })}
                      style={{
                        fontSize: '0.85rem',
                        color: '#1f2937',
                        fontWeight: '500',
                        padding: '0.5rem 0.6rem',
                        border: '2px solid #a855f7',
                        borderRadius: '6px',
                        width: '100%',
                        fontFamily: 'inherit',
                        outline: 'none',
                        backgroundColor: 'white',
                      }}
                      autoFocus
                    />
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: '#1f2937', margin: 0, fontWeight: '500' }}>{customer.city}</p>
                  )}
                </div>
                {editingField === 'city' ? (
                  <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                    <button
                      onClick={() => handleSaveEdit('city')}
                      style={{
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#059669'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#10b981'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#dc2626'
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ef4444'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setEditingField('city')}
                    style={{
                      width: '32px',
                      height: '32px',
                      padding: 0,
                      background: '#a855f7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#9333ea'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.3)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#a855f7'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Financial Dashboard - Professional Grid */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
              Financial Dashboard
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              {/* Balance Card - Primary */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(102, 126, 234, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={24} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', margin: 0, fontWeight: '600', letterSpacing: '0.05em' }}>
                      CURRENT BALANCE
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: '800', color: 'white', margin: 0, marginTop: '0.5rem' }}>
                  {formatCurrency(customer.balance)}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', margin: '0.75rem 0 0 0' }}>
                  {customer.balance > 0 ? '✓ Positive' : customer.balance < 0 ? '⚠ Negative' : '○ Neutral'}
                </p>
              </div>

              {/* Total Purchases Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(245, 87, 108, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(245, 87, 108, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(245, 87, 108, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingCart size={24} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', margin: 0, fontWeight: '600', letterSpacing: '0.05em' }}>
                      PURCHASES
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: '800', color: 'white', margin: 0, marginTop: '0.5rem' }}>
                  {customer.totalPurchases}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', margin: '0.75rem 0 0 0' }}>
                  {customer.totalPurchases > 0 ? 'Active' : 'None yet'}
                </p>
              </div>

              {/* Credits Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(79, 172, 254, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(79, 172, 254, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(79, 172, 254, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={24} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', margin: 0, fontWeight: '600', letterSpacing: '0.05em' }}>
                      CREDITS
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: '800', color: 'white', margin: 0, marginTop: '0.5rem' }}>
                  {formatCurrency(customer.totalCredits)}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', margin: '0.75rem 0 0 0' }}>
                  Total applied
                </p>
              </div>

              {/* Refunds Card */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 8px 24px rgba(250, 112, 154, 0.2)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(250, 112, 154, 0.3)'
                  e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(250, 112, 154, 0.2)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ width: '44px', height: '44px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RotateCcw size={24} style={{ color: 'white' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)', margin: 0, fontWeight: '600', letterSpacing: '0.05em' }}>
                      REFUNDS
                    </p>
                  </div>
                </div>
                <p style={{ fontSize: '2rem', fontWeight: '800', color: 'white', margin: 0, marginTop: '0.5rem' }}>
                  {formatCurrency(customer.totalRefunds)}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.7)', margin: '0.75rem 0 0 0' }}>
                  {customer.totalRefunds === 0 ? 'None' : 'Applied'}
                </p>
              </div>
            </div>
          </div>

          {/* All Transactions Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              All Transactions
            </h3>
            {customer.transactions.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>No transactions found</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '300px', overflow: 'auto' }}>
                {customer.transactions.map((trans, idx) => (
                  <div key={idx} style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            background: trans.type === 'Payment' ? '#dbeafe' : '#fef3c7',
                            color: trans.type === 'Payment' ? '#0284c7' : '#ca8a04',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                          }}
                        >
                          {trans.type}
                        </span>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            background:
                              trans.approvalStatus === 'approved'
                                ? '#dcfce7'
                                : trans.approvalStatus === 'pending'
                                  ? '#fef3c7'
                                  : '#fee2e2',
                            color:
                              trans.approvalStatus === 'approved'
                                ? '#16a34a'
                                : trans.approvalStatus === 'pending'
                                  ? '#ca8a04'
                                  : '#dc2626',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                          }}
                        >
                          {trans.approvalStatus ? (trans.approvalStatus.charAt(0).toUpperCase() + trans.approvalStatus.slice(1)) : 'Pending'}
                        </span>
                        {trans.itemsCount && trans.itemsCount > 0 && (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '0.25rem 0.75rem',
                              background: '#e0e7ff',
                              color: '#4f46e5',
                              borderRadius: '6px',
                              fontSize: '0.7rem',
                              fontWeight: '600',
                            }}
                          >
                            📦 {trans.itemsCount} {trans.itemsCount === 1 ? 'item' : 'items'}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                        {formatCurrency(parseFloat(trans.amount))}
                      </p>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.5rem 0' }}>{formatDate(trans.date)}</p>
                    
                    {/* Items List - Individual Display */}
                    {trans.items && trans.items.length > 0 && (
                      <div style={{ 
                        marginTop: '0.75rem', 
                        padding: '0.75rem', 
                        background: 'white', 
                        borderRadius: '6px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <p style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: '700', 
                          color: '#6b7280', 
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          margin: '0 0 0.5rem 0'
                        }}>
                          Items Purchased ({trans.items.length})
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          {trans.items.map((item, itemIdx) => (
                            <div 
                              key={itemIdx} 
                              style={{ 
                                padding: '0.6rem',
                                background: '#f9fafb',
                                borderRadius: '4px',
                                border: '1px solid #e5e7eb'
                              }}
                            >
                              <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'flex-start',
                                marginBottom: '0.4rem'
                              }}>
                                <p style={{ 
                                  margin: 0, 
                                  fontWeight: '700', 
                                  color: '#1f2937',
                                  fontSize: '0.8rem'
                                }}>
                                  {item.itemName}
                                </p>
                                <span style={{ 
                                  background: '#e0e7ff',
                                  color: '#4f46e5',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '4px',
                                  fontSize: '0.65rem',
                                  fontWeight: '700',
                                  whiteSpace: 'nowrap',
                                  marginLeft: '0.5rem'
                                }}>
                                  #{itemIdx + 1}
                                </span>
                              </div>
                              <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr 1fr', 
                                gap: '0.5rem',
                                fontSize: '0.7rem'
                              }}>
                                <div>
                                  <p style={{ 
                                    margin: 0, 
                                    color: '#6b7280', 
                                    fontWeight: '600',
                                    marginBottom: '0.2rem'
                                  }}>
                                    Quantity
                                  </p>
                                  <p style={{ 
                                    margin: 0, 
                                    color: '#1f2937', 
                                    fontWeight: '700',
                                    fontSize: '0.75rem'
                                  }}>
                                    {item.quantity}
                                  </p>
                                </div>
                                <div>
                                  <p style={{ 
                                    margin: 0, 
                                    color: '#6b7280', 
                                    fontWeight: '600',
                                    marginBottom: '0.2rem'
                                  }}>
                                    Unit Price
                                  </p>
                                  <p style={{ 
                                    margin: 0, 
                                    color: '#1f2937', 
                                    fontWeight: '700',
                                    fontSize: '0.75rem'
                                  }}>
                                    {formatCurrency(parseFloat(String(item.price)))}
                                  </p>
                                </div>
                                <div>
                                  <p style={{ 
                                    margin: 0, 
                                    color: '#6b7280', 
                                    fontWeight: '600',
                                    marginBottom: '0.2rem'
                                  }}>
                                    Total
                                  </p>
                                  <p style={{ 
                                    margin: 0, 
                                    color: '#a855f7', 
                                    fontWeight: '800',
                                    fontSize: '0.8rem'
                                  }}>
                                    {formatCurrency(parseFloat(String(item.total)))}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Info Section */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>
              Additional Info
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, marginBottom: '0.25rem', fontWeight: '500' }}>
                  Last Transaction
                </p>
                <p style={{ fontSize: '0.85rem', color: '#1f2937', margin: 0, fontWeight: '500' }}>{formatDate(customer.lastTransaction)}</p>
              </div>
              <div style={{ padding: '0.75rem', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, marginBottom: '0.25rem', fontWeight: '500' }}>
                  Member Since
                </p>
                <p style={{ fontSize: '0.85rem', color: '#1f2937', margin: 0, fontWeight: '500' }}>{formatDate(customer.memberSince)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'no-visits' | 'inactive' | 'items'>('all')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  // Items state - initialize from localStorage if available
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem('dashboard_items')
      if (stored) {
        return JSON.parse(stored)
      }
    } catch (e) {
      console.error('Error loading items from localStorage:', e)
    }
    // Default items
    return [
      { id: 1, name: 'Samsung S26 Ultra', category: 'General', stock: 6, price: 154.00 },
      { id: 2, name: 'rggh', category: 'General', stock: 45, price: 4566.00 },
      { id: 3, name: 'sdfhg', category: 'General', stock: 6, price: 4564.00 },
    ]
  })
  const [searchItem, setSearchItem] = useState('')
  const [showAddItemModal, setShowAddItemModal] = useState(false)
  const [editingItemId, setEditingItemId] = useState<number | null>(null)
  const [newItem, setNewItem] = useState({ name: '', category: 'General', stock: 0, price: 0 })

  useEffect(() => {
    loadCustomers()

    const handleUpdate = () => loadCustomers()
    window.addEventListener('transactionApproved', handleUpdate)
    window.addEventListener('customerApproved', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener('transactionApproved', handleUpdate)
      window.removeEventListener('customerApproved', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  // Sync items to localStorage whenever they change (for dashboard access)
  useEffect(() => {
    localStorage.setItem('dashboard_items', JSON.stringify(items))
  }, [items])

  const loadCustomers = () => {
    try {
      setIsLoading(true)
      const storedTransactions = localStorage.getItem('confirmed_transactions')

      if (!storedTransactions) {
        setCustomers([])
        setIsLoading(false)
        return
      }

      const transactions: Transaction[] = JSON.parse(storedTransactions)
      const customerMap = new Map<string, Customer>()

      transactions.forEach((trans) => {
        // ONLY process APPROVED transactions
        if (trans.approvalStatus !== 'approved') {
          return // Skip pending or rejected transactions
        }

        const customerName = (trans.customerName || trans.customer || 'Unknown').toLowerCase().trim()

        if (!customerMap.has(customerName)) {
          const now = new Date().toISOString()
          customerMap.set(customerName, {
            name: trans.customerName || trans.customer || 'Unknown',
            email: 'info@customer.local',
            phone: '+251-9-XX-XX-XXXX',
            address: 'Address not provided',
            city: 'Addis Ababa',
            balance: 0,
            status: 'Active',
            transactions: [],
            lastTransaction: now,
            memberSince: now,
            totalPurchases: 0,
            totalCredits: 0,
            totalRefunds: 0,
          })
        }

        const customer = customerMap.get(customerName)!
        customer.transactions.push(trans)

        const amount = parseFloat(trans.amount) || 0
        if (trans.type === 'Payment') {
          customer.balance += amount
          customer.totalPurchases += 1
        } else if (trans.type === 'Credit') {
          customer.balance -= amount
          customer.totalCredits += amount
        }

        if (new Date(trans.date) > new Date(customer.lastTransaction)) {
          customer.lastTransaction = trans.date
        }

        if (new Date(trans.date) < new Date(customer.memberSince)) {
          customer.memberSince = trans.date
        }
      })

      const customersArray = Array.from(customerMap.values()).sort((a, b) => b.balance - a.balance)
      setCustomers(customersArray)
      console.log('✅ Loaded customers with approved transactions:', customersArray.length)
    } catch (error) {
      console.error('Error loading customers:', error)
      setCustomers([])
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredCustomers = () => {
    const now = new Date()
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)

    switch (activeTab) {
      case 'no-visits':
        return customers.filter((c) => new Date(c.lastTransaction) < fifteenDaysAgo)
      case 'inactive':
        return customers.filter((c) => c.status === 'Inactive')
      default:
        return customers
    }
  }

  const filteredCustomers = getFilteredCustomers()
  const totalRevenue = customers.reduce((sum, c) => sum + c.balance, 0)

  // Items handlers
  const handleAddItem = () => {
    if (newItem.name && newItem.stock >= 0 && newItem.price > 0) {
      const item = {
        id: Math.max(...items.map(i => i.id), 0) + 1,
        ...newItem
      }
      const updatedItems = [...items, item]
      setItems(updatedItems)
      // Save to localStorage for dashboard access
      localStorage.setItem('dashboard_items', JSON.stringify(updatedItems))
      setNewItem({ name: '', category: 'General', stock: 0, price: 0 })
      setShowAddItemModal(false)
      alert('Item added successfully!')
    } else {
      alert('Please fill in all fields correctly')
    }
  }

  const handleDeleteItem = (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      const updatedItems = items.filter(item => item.id !== id)
      setItems(updatedItems)
      // Save to localStorage for dashboard access
      localStorage.setItem('dashboard_items', JSON.stringify(updatedItems))
      alert('Item deleted successfully!')
    }
  }

  const handleEditItem = (id: number) => {
    const item = items.find(i => i.id === id)
    if (item) {
      setNewItem(item)
      setEditingItemId(id)
      setShowAddItemModal(true)
    }
  }

  const handleSaveEditItem = () => {
    if (newItem.name && newItem.stock >= 0 && newItem.price > 0) {
      const updatedItems = items.map(item => item.id === editingItemId ? { ...newItem, id: editingItemId } : item)
      setItems(updatedItems)
      // Save to localStorage for dashboard access
      localStorage.setItem('dashboard_items', JSON.stringify(updatedItems))
      setNewItem({ name: '', category: 'General', stock: 0, price: 0 })
      setEditingItemId(null)
      setShowAddItemModal(false)
      alert('Item updated successfully!')
    } else {
      alert('Please fill in all fields correctly')
    }
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchItem.toLowerCase())
  )

  return (
    <>
      <div style={{ background: '#f5f7fa', minHeight: '100vh', paddingBottom: '140px' }}>
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
            color: 'white',
            padding: '1.5rem 1.25rem',
            boxShadow: '0 2px 8px rgba(168, 85, 247, 0.2)',
          }}
        >
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Users size={28} />
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>Customers</h1>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>
                Total Customers
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1f2937', margin: 0 }}>{customers.length}</p>
            </div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>
                No Visits (15+ Days)
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1f2937', margin: 0 }}>
                {customers.filter((c) => new Date(c.lastTransaction) < new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)).length}
              </p>
            </div>
            <div style={{ background: 'white', padding: '1rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>
                Total Revenue
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981', margin: 0 }}>
                {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })} ብር
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', background: 'white', padding: '0.75rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', flexWrap: 'wrap' }}>
            {['all', 'no-visits', 'inactive', 'items'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                style={{
                  padding: '0.65rem 1.25rem',
                  background: activeTab === tab ? '#a855f7' : 'white',
                  color: activeTab === tab ? 'white' : '#6b7280',
                  border: activeTab === tab ? 'none' : '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                }}
              >
                {tab === 'all' ? 'All Customers' : tab === 'no-visits' ? 'No Visits' : tab === 'inactive' ? 'Inactive' : 'Items'}
              </button>
            ))}
          </div>

          {/* Customers List View - Only show when not on Items tab */}
          {activeTab !== 'items' ? (
            isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
              <p>Loading customers...</p>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af', background: 'white', borderRadius: '10px' }}>
              <p>No customers found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredCustomers.map((customer, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'white',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1rem',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                    e.currentTarget.style.borderColor = '#a855f7'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = '#e5e7eb'
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '1rem',
                      flexShrink: 0,
                      marginRight: '1rem',
                    }}
                  >
                    {customer.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Customer Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <p style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                        {customer.name}
                      </p>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.65rem',
                          background: customer.status === 'Active' ? '#dcfce7' : '#fee2e2',
                          color: customer.status === 'Active' ? '#16a34a' : '#dc2626',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: '600',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {customer.status}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: 0 }}>
                      {customer.email} • {customer.phone}
                    </p>
                  </div>

                  {/* Transactions Count */}
                  <div style={{ textAlign: 'center', marginRight: '1.5rem', minWidth: '100px' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, marginBottom: '0.25rem', fontWeight: '500' }}>
                      Transactions
                    </p>
                    <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
                      {customer.transactions.length}
                    </p>
                  </div>

                  {/* Balance */}
                  <div style={{ textAlign: 'center', marginRight: '1.5rem', minWidth: '140px' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, marginBottom: '0.25rem', fontWeight: '500' }}>
                      Balance
                    </p>
                    <p
                      style={{
                        fontSize: '1.1rem',
                        fontWeight: '700',
                        color: customer.balance > 0 ? '#16a34a' : customer.balance < 0 ? '#dc2626' : '#6b7280',
                        margin: 0,
                      }}
                    >
                      {customer.balance > 0 ? '+' : ''}{customer.balance.toLocaleString('en-US', { minimumFractionDigits: 0 })} ብር
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.4)'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )
          ) : null}

      {/* Items Section - Only show when on Items tab */}
      {activeTab === 'items' && (
      <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto', marginTop: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>Items & Inventory</h2>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>Manage stock and product inventory</p>
            </div>
            <button
              onClick={() => {
                setEditingItemId(null)
                setNewItem({ name: '', category: 'General', stock: 0, price: 0 })
                setShowAddItemModal(true)
              }}
              style={{
                padding: '0.65rem 1.25rem',
                background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.4)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              + Add Item
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #f0f0f0' }}>
            <input
              type="text"
              placeholder="Search by item name..."
              value={searchItem}
              onChange={(e) => setSearchItem(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#a855f7'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(168, 85, 247, 0.1)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Items Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Item Name</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stock</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                      No items found
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#111827', fontWeight: '500' }}>{item.name}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
                        <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', background: '#f3f4f6', color: '#6b7280', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>{item.category}</span>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: '600', color: '#1f2937' }}>{item.stock}</td>
                      <td style={{ padding: '1rem', fontSize: '0.9rem', fontWeight: '600', color: '#a855f7' }}>{item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር</td>
                      <td style={{ padding: '1rem' }}>
                        <button 
                          onClick={() => handleEditItem(item.id)}
                          style={{ padding: '0.4rem 0.8rem', background: '#a855f7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', marginRight: '0.5rem', transition: 'all 0.2s ease' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#9333ea'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.3)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#a855f7'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          style={{ padding: '0.4rem 0.8rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', transition: 'all 0.2s ease' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#dc2626'
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#ef4444'
                            e.currentTarget.style.boxShadow = 'none'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      )}
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {showAddItemModal && (
        <div
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
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={() => setShowAddItemModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              maxWidth: '500px',
              width: '100%',
              padding: '2rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: 0, marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>
              {editingItemId ? 'Edit Item' : 'Add New Item'}
            </h2>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Item Name *</label>
              <input
                type="text"
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Enter item name"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#a855f7'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Category *</label>
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#a855f7'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <option value="General">General</option>
                <option value="Electronics">Electronics</option>
                <option value="Screen">Screen</option>
                <option value="Clothing">Clothing</option>
                <option value="Food">Food</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Stock *</label>
                <input
                  type="number"
                  value={newItem.stock}
                  onChange={(e) => setNewItem({ ...newItem, stock: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#a855f7'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.5rem' }}>Price (ብር) *</label>
                <input
                  type="number"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#a855f7'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddItemModal(false)
                  setEditingItemId(null)
                  setNewItem({ name: '', category: 'General', stock: 0, price: 0 })
                }}
                style={{
                  padding: '0.65rem 1.5rem',
                  background: '#e5e7eb',
                  color: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#d1d5db'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#e5e7eb'}
              >
                Cancel
              </button>
              <button
                onClick={editingItemId ? handleSaveEditItem : handleAddItem}
                style={{
                  padding: '0.65rem 1.5rem',
                  background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.4)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {editingItemId ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <CustomerDetailModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />

      {/* Bottom Navigation */}
      <AdminBottomNav />
    </>
  )
}
