'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { X, LogOut } from 'lucide-react'
import AdminLayout from '@/components/AdminLayout'
import { useAuthStore } from '@/store/auth-store'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Customer {
  id: string
  name: string
}

interface UploadedCustomer {
  name: string
  matched: boolean
  inDatabase: boolean
  [key: string]: any
}

export default function SalesDashboard() {
  const router = useRouter()
  const { logout: zustandLogout } = useAuthStore()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadedCustomers, setUploadedCustomers] = useState<UploadedCustomer[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<UploadedCustomer | null>(null)
  const [showPayModal, setShowPayModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [selectedBank, setSelectedBank] = useState('CBE')
  const [paymentReference, setPaymentReference] = useState('')
  const [additionalPayment, setAdditionalPayment] = useState('')
  const [additionalBanks, setAdditionalBanks] = useState<Array<{bank: string, amount: string, reason: string}>>([])
  const [paymentNotes, setPaymentNotes] = useState('')
  const [payModalRef, setPayModalRef] = useState<HTMLDivElement | null>(null)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [creditAmount, setCreditAmount] = useState('')
  const [creditReason, setCreditReason] = useState('')
  const [showRefundModal, setShowRefundModal] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [refundTransactionId, setRefundTransactionId] = useState('')
  const [confirmedTransactions, setConfirmedTransactions] = useState<any[]>([])
  const mountedRef = useRef(false)
  
  // Customer search states
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchCustomerQuery, setSearchCustomerQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedSearchCustomer, setSelectedSearchCustomer] = useState<any>(null)
  const [isSearching, setIsSearching] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    zustandLogout()
    router.push('/login')
  }

  // Load data on component mount
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      
      // Load confirmed transactions
      const stored = localStorage.getItem('confirmed_transactions')
      if (stored) {
        try {
          setConfirmedTransactions(JSON.parse(stored))
        } catch (error) {
          console.error('Error loading confirmed transactions:', error)
        }
      }
      
      // Load uploaded customers from localStorage
      const uploadedStored = localStorage.getItem('uploaded_customers_persist')
      if (uploadedStored) {
        try {
          setUploadedCustomers(JSON.parse(uploadedStored))
        } catch (error) {
          console.error('Error loading uploaded customers:', error)
        }
      }
      
      // Load customers from backend
      loadCustomers()
    }
    
    // Listen for payment rejection events
    const handlePaymentRejected = () => {
      console.log('🔔 Payment rejection event received!')
      // Small delay to ensure localStorage is updated
      setTimeout(() => {
        const uploadedStored = localStorage.getItem('uploaded_customers_persist')
        if (uploadedStored) {
          try {
            const customers = JSON.parse(uploadedStored)
            console.log('✅ Reloading customers, count:', customers.length)
            setUploadedCustomers(customers)
          } catch (error) {
            console.error('Error reloading customers:', error)
          }
        }
      }, 100)
    }
    
    // Listen for localStorage changes (works across tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'uploaded_customers_persist') {
        console.log('🔔 Storage change detected for uploaded customers')
        handlePaymentRejected()
      }
    }
    
    // Poll for changes every 2 seconds (for same-tab updates)
    const pollInterval = setInterval(() => {
      const uploadedStored = localStorage.getItem('uploaded_customers_persist')
      if (uploadedStored) {
        try {
          const customers = JSON.parse(uploadedStored)
          // Only update if count changed or if there are rejected customers
          const hasRejected = customers.some((c: any) => c._isRejectedPayment)
          const currentHasRejected = uploadedCustomers.some((c: any) => c._isRejectedPayment)
          
          if (customers.length !== uploadedCustomers.length || (hasRejected && !currentHasRejected)) {
            console.log('🔄 Auto-refresh: Customer list changed, updating...')
            setUploadedCustomers(customers)
          }
        } catch (error) {
          console.error('Error polling customers:', error)
        }
      }
    }, 2000)
    
    window.addEventListener('paymentRejected', handlePaymentRejected)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('paymentRejected', handlePaymentRejected)
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(pollInterval)
    }
  }, [uploadedCustomers.length])

  useEffect(() => {
    loadCustomers()
  }, [])

  // Persist uploaded customers to localStorage whenever they change
  useEffect(() => {
    if (uploadedCustomers.length > 0) {
      localStorage.setItem('uploaded_customers_persist', JSON.stringify(uploadedCustomers))
    }
  }, [uploadedCustomers])

  const loadCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers?page=1&limit=1000`)
      if (response.ok) {
        const data = await response.json()
        const list = (data.data || []).map((c: any) => ({
          id: c.id?.toString() || '',
          name: c.name || 'Unknown'
        }))
        setCustomers(list)
      }
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchCustomerInDatabase = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    setIsSearching(true)
    try {
      // Load customers using EXACT same function as admin page
      const storedTransactions = localStorage.getItem('confirmed_transactions')
      
      if (!storedTransactions) {
        console.log('⚠️ No confirmed transactions in localStorage')
        setSearchResults([])
        setIsSearching(false)
        return
      }

      const transactions = JSON.parse(storedTransactions)
      console.log('🔍 Total transactions in localStorage:', transactions.length)
      
      const customerMap = new Map()

      // Use EXACT same logic as admin customers page (line 1082-1148)
      transactions.forEach((trans, index) => {
        // Debug first few transactions
        if (index < 3) {
          console.log(`📋 Transaction ${index}:`, {
            customerName: trans.customerName,
            customer: trans.customer,
            amount: trans.amount,
            type: trans.type,
            approvalStatus: trans.approvalStatus
          })
        }

        // ONLY process APPROVED transactions
        if (trans.approvalStatus !== 'approved') {
          return
        }

        const customerName = (trans.customerName || trans.customer || 'Unknown').toLowerCase().trim()

        if (!customerMap.has(customerName)) {
          const now = new Date().toISOString()
          customerMap.set(customerName, {
            name: trans.customerName || trans.customer || 'Unknown',
            email: 'info@customer.local',
            phone: trans.customerPhone || '+251-9-XX-XX-XXXX',
            address: trans.customerAddress || 'Address not provided',
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

        const customer = customerMap.get(customerName)
        customer.transactions.push(trans)

        const amount = parseFloat(trans.amount) || 0
        
        // Debug balance calculation
        const beforeBalance = customer.balance
        
        if (trans.type === 'Payment') {
          customer.balance += amount
          customer.totalPurchases += 1
          console.log(`💰 Payment: ${amount} | Balance: ${beforeBalance} → ${customer.balance}`)
        } else if (trans.type === 'Credit') {
          customer.balance -= amount
          customer.totalCredits += amount
          console.log(`💳 Credit: ${amount} | Balance: ${beforeBalance} → ${customer.balance} | Total Credits: ${customer.totalCredits}`)
        }

        if (new Date(trans.date) > new Date(customer.lastTransaction)) {
          customer.lastTransaction = trans.date
        }

        if (new Date(trans.date) < new Date(customer.memberSince)) {
          customer.memberSince = trans.date
        }
      })

      const allCustomers = Array.from(customerMap.values()).sort((a, b) => b.balance - a.balance)
      
      console.log('👥 All customers with balances:', allCustomers.map(c => ({
        name: c.name,
        balance: c.balance,
        totalCredits: c.totalCredits
      })))
      
      // Filter by search query
      const filtered = allCustomers.filter((c: any) => 
        c.name.toLowerCase().includes(query.toLowerCase())
      )
      
      console.log('✅ Filtered customers:', filtered.map(c => ({
        name: c.name,
        balance: c.balance,
        totalCredits: c.totalCredits
      })))
      
      setSearchResults(filtered)
    } catch (error) {
      console.error('❌ Error searching customers:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadProgress(10)

    try {
      const XLSX = await import('xlsx')
      const reader = new FileReader()

      reader.onload = (e) => {
        setUploadProgress(30)
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        setUploadProgress(50)

        const possibleColumns = ['Customers', 'Customer', 'Name', 'Customer Name', 'name', 'customers']
        let customerColumn = ''

        if (jsonData.length > 0) {
          const firstRow = jsonData[0] as Record<string, any>
          const allColumns = Object.keys(firstRow)
          
          console.log('🔍 Excel Debug Info:')
          console.log('All columns:', allColumns)
          console.log('First row data:', firstRow)
          
          // Try to find a column with standard customer names
          customerColumn = possibleColumns.find(col => col in firstRow) || ''
          
          // If not found, use smart detection:
          // 1. Prefer the LAST column (usually contains customer/buyer names)
          // 2. Skip columns with only numbers
          // 3. Look for columns with text values (containing letters)
          if (!customerColumn && allColumns.length > 0) {
            // Start from the last column and work backwards
            for (let i = allColumns.length - 1; i >= 0; i--) {
              const col = allColumns[i]
              const sampleValue = String(firstRow[col] || '').trim()
              
              // Check if value contains letters (not just numbers)
              if (sampleValue && /[a-zA-Z]/.test(sampleValue)) {
                customerColumn = col
                console.log(`✅ Selected column "${col}" with sample value: "${sampleValue}"`)
                break
              }
            }
            
            // Fallback: use last column if no text column found
            if (!customerColumn) {
              customerColumn = allColumns[allColumns.length - 1]
              console.log(`⚠️ Fallback to last column: "${customerColumn}"`)
            }
          }
          
          console.log(`📋 Final customer column: "${customerColumn}"`)
        }

        const extractedCustomers: UploadedCustomer[] = jsonData
          .map((row: any, index: number) => {
            const customerName = row[customerColumn]?.toString().trim() || ''
            if (!customerName) return null

            const inDatabase = customers.some(c => 
              c.name.toLowerCase() === customerName.toLowerCase()
            )

            return {
              ...row,
              _uploadId: `${Date.now()}_${index}`, // Unique ID for each uploaded customer
              name: customerName,
              matched: inDatabase,
              inDatabase: inDatabase
            }
          })
          .filter((item): item is UploadedCustomer => item !== null)

        setUploadProgress(80)
        setUploadedCustomers(extractedCustomers)
        setUploadProgress(100)

        setTimeout(() => setUploadProgress(0), 2000)
      }

      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error('Error reading Excel file:', error)
      alert('Error reading Excel file. Please make sure it\'s a valid Excel file.')
      setUploadProgress(0)
    }
  }

  return (
    <AdminLayout>
      <div style={{ 
        paddingBottom: '1rem', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #f0f4f8 100%)', 
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
              <div>
                <h1 style={{
                  fontSize: '1.3rem',
                  fontWeight: '900',
                  margin: 0,
                  color: '#0f172a',
                  letterSpacing: '-0.02em',
                }}>
                  Sales Dashboard
                </h1>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}>
                {/* Logout Button - Simple & Professional */}
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 1rem',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.8rem',
                    transition: 'all 0.2s ease',
                    boxShadow: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2563eb'
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#3b82f6'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1.5rem' }}>
          {/* KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}>
            <PremiumKPICard 
              icon="👥"
              label="Total Customers" 
              value={new Set(uploadedCustomers.map(c => c.name.toLowerCase())).size}
              color="#3b82f6"
              trend={new Set(uploadedCustomers.map(c => c.name.toLowerCase())).size > 0 ? "Active" : "Empty"}
            />
            <PremiumKPICard 
              icon="📊"
              label="Uploaded Items" 
              value={uploadedCustomers.length}
              color="#10b981"
              trend={uploadedCustomers.length > 0 ? "Ready" : "Pending"}
            />
            <PremiumKPICard 
              icon="✓"
              label="Approved Payments" 
              value={confirmedTransactions.filter(t => t.approvalStatus === 'approved').length}
              color="#8b5cf6"
              trend="Completed"
            />
            <PremiumKPICard 
              icon="⏳"
              label="Pending Approval" 
              value={confirmedTransactions.filter(t => t.approvalStatus === 'pending' || !t.approvalStatus).length}
              color="#f59e0b"
              trend="Waiting"
            />
          </div>

          {/* PROFESSIONAL MODERN UPLOAD SECTION */}
          {uploadedCustomers.length === 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)',
              borderRadius: '16px',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden',
              marginBottom: '2rem',
              padding: '3rem 2.5rem',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
            }}>
              <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <h3 style={{
                  fontSize: '1.75rem',
                  fontWeight: '950',
                  color: '#0f172a',
                  margin: '0 0 1rem 0',
                  letterSpacing: '-0.03em',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                }}>
                  Upload Customer Data
                </h3>
                <p style={{
                  fontSize: '0.95rem',
                  color: '#64748b',
                  margin: 0,
                  fontWeight: '500',
                }}>
                  Upload Excel file or search existing customers
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '1rem',
                alignItems: 'center',
              }}>
                <label style={{
                  position: 'relative',
                  cursor: 'pointer',
                }}>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelUpload}
                    style={{ display: 'none' }}
                  />
                  <div
                    style={{
                      padding: '2rem',
                      border: '2px dashed #3b82f6',
                      borderRadius: '12px',
                      background: '#f0f4ff',
                      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#eff6ff'
                      e.currentTarget.style.borderColor = '#2563eb'
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(59, 130, 246, 0.12)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f0f4ff'
                      e.currentTarget.style.borderColor = '#3b82f6'
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                    onClick={(e) => {
                      const input = (e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement)
                      input?.click()
                    }}
                  >
                    <p style={{
                      fontSize: '1.1rem',
                      fontWeight: '850',
                      color: '#3b82f6',
                      margin: 0,
                      letterSpacing: '-0.02em',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                    }}>
                      Drop file here or click to browse
                    </p>
                  </div>
                </label>

                <button
                  onClick={(e) => {
                    const allInputs = document.querySelectorAll('input[type="file"]')
                    const fileInput = allInputs[allInputs.length - 1] as HTMLInputElement
                    fileInput?.click()
                  }}
                  style={{
                    padding: '1.2rem 2.8rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: '800',
                    fontSize: '0.95rem',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)'
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(59, 130, 246, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <span>UPLOAD FILE</span>
                  </span>
                </button>
                
                <button
                  onClick={() => setShowSearchModal(true)}
                  title="Search Customer"
                  style={{
                    width: '58px',
                    height: '58px',
                    padding: 0,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(16, 185, 129, 0.45)'
                    e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.35)'
                    e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                  }} />
                </button>
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div style={{ marginTop: '2rem' }}>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginBottom: '0.75rem',
                  }}>
                    <div style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)',
                      transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                      borderRadius: '4px',
                    }} />
                  </div>
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: '#6b7280', 
                    margin: 0, 
                    fontWeight: '700',
                    fontFamily: 'inherit',
                    letterSpacing: '0.01em',
                  }}>
                    {uploadProgress}% uploading...
                  </p>
                </div>
              )}

              {uploadProgress === 100 && (
                <div style={{
                  marginTop: '2rem',
                  padding: '1rem 1.5rem',
                  background: '#ecfdf5',
                  border: '1px solid #d1fae5',
                  borderRadius: '10px',
                  color: '#065f46',
                  fontSize: '0.95rem',
                  fontWeight: '800',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  animation: 'slideIn 0.4s ease-out',
                  fontFamily: 'inherit',
                  letterSpacing: '0.01em',
                }}>
                  <span style={{ fontSize: '1.2rem' }}>✓</span>
                  File uploaded successfully!
                </div>
              )}
            </div>
          )}

          {uploadedCustomers.length > 0 && (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '2rem 2rem 1.5rem 2rem',
              }}>
                <h3 style={{
                  fontSize: '1.3rem',
                  fontWeight: '800',
                  color: '#0f172a',
                  margin: '0 0 1.5rem 0',
                  letterSpacing: '-0.01em',
                }}>
                  Customers List
                </h3>

                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                }}>
                  <div style={{
                    flex: 1,
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        background: '#f8fafc',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.background = '#f8fafc'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  {uploadedCustomers.length === 0 && (
                    <button
                      onClick={() => {
                        // Clear uploaded customers
                        localStorage.removeItem('uploaded_customers_persist')
                        setUploadedCustomers([])
                        setSearchQuery('')
                        setSelectedCustomer(null)
                      }}
                      style={{
                        padding: '0.85rem 1.5rem',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        transition: 'all 0.2s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(99, 102, 241, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      New Upload
                    </button>
                  )}
                </div>
              </div>

              <div style={{
                padding: '0 2rem 2rem 2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}>
                {(() => {
                  // AGGRESSIVE DEDUPLICATION: Get unique customer names
                  const seen = new Set<string>()
                  const uniqueCustomers: (UploadedCustomer & { _allDuplicates?: UploadedCustomer[] })[] = []
                  
                  uploadedCustomers.forEach(customer => {
                    const nameLower = customer.name.toLowerCase()
                    const isRejected = (customer as any)._isRejectedPayment
                    
                    // Create unique key: name + rejected status
                    const uniqueKey = `${nameLower}_${isRejected ? 'rejected' : 'normal'}`
                    
                    if (!seen.has(uniqueKey)) {
                      seen.add(uniqueKey)
                      // Get ALL duplicates for this customer (matching both name AND rejected status)
                      const allDuplicates = uploadedCustomers.filter(
                        c => c.name.toLowerCase() === nameLower && 
                             (c as any)._isRejectedPayment === isRejected
                      )
                      const deduped = {
                        ...customer,
                        _allDuplicates: allDuplicates
                      }
                      uniqueCustomers.push(deduped)
                    }
                  })
                  
                  // Sort: Rejected customers first, then normal customers
                  return uniqueCustomers
                    .filter(customer => 
                      customer.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .sort((a, b) => {
                      const aRejected = (a as any)._isRejectedPayment ? 1 : 0
                      const bRejected = (b as any)._isRejectedPayment ? 1 : 0
                      // Rejected (1) comes before normal (0), so reverse order
                      return bRejected - aRejected
                    })
                    .map((customer, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedCustomer(customer)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.25rem',
                      padding: '1rem 1.5rem',
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e5e7eb',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'visible',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.15)'
                      e.currentTarget.style.borderColor = '#e9d5ff'
                      e.currentTarget.style.backgroundColor = '#faf5ff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)'
                      e.currentTarget.style.borderColor = '#e5e7eb'
                      e.currentTarget.style.backgroundColor = '#ffffff'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '900',
                      fontSize: '0.9rem',
                      flexShrink: 0,
                      boxShadow: '0 4px 15px rgba(168, 85, 247, 0.3)',
                    }}>
                      {customer.name.charAt(0).toUpperCase() + customer.name.charAt(1).toLowerCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: '#1f2937',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        letterSpacing: '-0.01em',
                      }}>
                        {customer.name}
                      </p>
                      {(customer as any)._isRejectedPayment && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          marginTop: '0.4rem',
                          padding: '0.25rem 0.6rem',
                          background: '#fee2e2',
                          color: '#dc2626',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          border: '1px solid #fecaca',
                        }}>
                          Payment Rejected - Resubmit
                        </span>
                      )}
                    </div>

                    {customer.matched && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #a855f7 0%, #d946ef 100%)',
                        color: 'white',
                        fontSize: '0.85rem',
                        fontWeight: '900',
                        boxShadow: '0 2px 8px rgba(168, 85, 247, 0.25)',
                        flexShrink: 0,
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                    ))
                })()}
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f3f4f6 100%)',
                borderTop: '1px solid #e2e8f0',
                borderRadius: '0 0 16px 16px',
                padding: '1.25rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.85rem',
                color: '#64748b',
                fontWeight: '600',
              }}>
                <span>✓ Showing <strong style={{ color: '#3b82f6' }}>{new Set(uploadedCustomers.map(c => c.name.toLowerCase())).size}</strong> unique customers</span>
              </div>
            </div>
          )}
        </div>

        {selectedCustomer && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            padding: '1rem',
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
                padding: '2rem 2rem 1.5rem 2rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '900',
                    color: '#0f172a',
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}>
                    {selectedCustomer.name}
                  </h2>
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#64748b',
                    margin: '0.5rem 0 0 0',
                    fontWeight: '600',
                  }}>
                    Customer Details
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    color: '#64748b',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e2e8f0'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f1f5f9'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {(() => {
                    // Get all duplicates for this customer
                    const allDuplicates = (selectedCustomer as any)?._allDuplicates || [selectedCustomer]
                    
                    return allDuplicates.map((duplicate: any, idx: number) => (
                      <div key={idx} style={{
                        padding: '1.5rem',
                        background: idx === 0 ? 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)' : '#f8fafc',
                        borderRadius: '12px',
                        border: idx === 0 ? '2px solid #93c5fd' : '1px solid #e2e8f0',
                        position: 'relative',
                      }}>
                        {allDuplicates.length > 1 && (
                          <div style={{
                            position: 'absolute',
                            top: '0.75rem',
                            right: '0.75rem',
                            background: '#3b82f6',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: '800',
                          }}>
                            Copy {idx + 1}
                          </div>
                        )}
                        
                        <div style={{ display: 'grid', gap: '1rem', marginTop: idx === 0 && allDuplicates.length > 1 ? '1.5rem' : '0' }}>
                          {Object.entries(duplicate)
                            .filter(([key]) => !key.startsWith('_') && !['name', 'matched', 'inDatabase'].includes(key))
                            .map(([key, value]) => {
                              const lowerKey = key.toLowerCase()
                              const isItemName = lowerKey.includes('item')
                              const isQty = lowerKey.includes('qty') || lowerKey.includes('quantity')
                              const isPrice = lowerKey.includes('price') || lowerKey.includes('selling')
                              const isTotal = lowerKey === 'total' || lowerKey.includes('total')
                              
                              if (isItemName || isQty || isPrice || isTotal) {
                                return (
                                  <div key={key} style={{
                                    padding: '0.85rem 1rem',
                                    background: 'rgba(255, 255, 255, 0.6)',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(255, 255, 255, 0.8)',
                                  }}>
                                    <p style={{
                                      fontSize: '0.7rem',
                                      fontWeight: '800',
                                      color: isItemName ? '#e11d48' : isQty ? '#059669' : isPrice ? '#2563eb' : '#7c3aed',
                                      margin: '0 0 0.35rem 0',
                                      textTransform: 'uppercase',
                                      letterSpacing: '0.05em',
                                    }}>
                                      {String(key).replace(/_/g, ' ')}
                                    </p>
                                    <p style={{
                                      fontSize: '0.95rem',
                                      fontWeight: '800',
                                      color: '#1f2937',
                                      margin: 0,
                                    }}>
                                      {String(value)}
                                    </p>
                                  </div>
                                )
                              }
                              return null
                            })}
                        </div>
                      </div>
                    ))
                  })()}

                  {(() => {
                    // Calculate TOTAL from ALL duplicates
                    const allDuplicates = (selectedCustomer as any)?._allDuplicates || [selectedCustomer]
                    let totalQty = 0
                    let totalAmount = 0
                    
                    allDuplicates.forEach((dup: any) => {
                      for (const [key, val] of Object.entries(dup)) {
                        const lowerKey = key.toLowerCase()
                        if (lowerKey.includes('qty') || lowerKey.includes('quantity')) {
                          totalQty += isNaN(parseFloat(val)) ? 0 : parseFloat(val)
                        }
                        if (lowerKey === 'total' || (lowerKey.includes('total') && !lowerKey.includes('qty'))) {
                          totalAmount += isNaN(parseFloat(val)) ? 0 : parseFloat(val)
                        }
                      }
                    })
                    
                    return totalAmount > 0 ? (
                      <div style={{
                        padding: '1.5rem',
                        background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
                        borderRadius: '12px',
                        border: '2px solid #86efac',
                        textAlign: 'center',
                        marginTop: '1rem',
                      }}>
                        <p style={{
                          fontSize: '0.7rem',
                          fontWeight: '800',
                          color: '#15803d',
                          margin: '0 0 0.5rem 0',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}>
                          🎯 TOTAL ALL ITEMS ({allDuplicates.length} copies)
                        </p>
                        <p style={{
                          fontSize: '1.5rem',
                          fontWeight: '900',
                          color: '#16a34a',
                          margin: 0,
                        }}>
                          {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        <p style={{
                          fontSize: '0.8rem',
                          fontWeight: '700',
                          color: '#22c55e',
                          margin: '0.5rem 0 0 0',
                        }}>
                          Qty: {totalQty} | Copies: {allDuplicates.length}
                        </p>
                      </div>
                    ) : null
                  })()}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                    <button
                      onClick={() => {
                        // AGGRESSIVE: Calculate TOTAL from ALL DUPLICATES
                        const allDuplicates = (selectedCustomer as any)?._allDuplicates || [selectedCustomer]
                        let totalAmount = 0
                        
                        allDuplicates.forEach((dup: any) => {
                          for (const [key, val] of Object.entries(dup)) {
                            const lowerKey = key.toLowerCase()
                            if (lowerKey === 'total' || (lowerKey.includes('total') && !lowerKey.includes('qty'))) {
                              totalAmount += isNaN(parseFloat(val)) ? 0 : parseFloat(val)
                            }
                          }
                        })
                        
                        // Fallback: if no total found, calculate from first duplicate
                        if (totalAmount === 0) {
                          for (const [key, val] of Object.entries(selectedCustomer)) {
                            const lowerKey = key.toLowerCase()
                            if (lowerKey.includes('qty') || lowerKey.includes('quantity')) {
                              const qty = isNaN(parseFloat(val)) ? 0 : parseFloat(val)
                              
                              for (const [k2, v2] of Object.entries(selectedCustomer)) {
                                if (k2.toLowerCase().includes('price') || k2.toLowerCase().includes('selling')) {
                                  const price = isNaN(parseFloat(v2)) ? 0 : parseFloat(v2)
                                  totalAmount = qty * price * allDuplicates.length
                                  break
                                }
                              }
                              break
                            }
                          }
                        }
                        
                        setPaymentAmount(totalAmount.toString())
                        setShowPayModal(true)
                      }}
                      style={{
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
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
                      💳 Payment
                    </button>
                    <button
                      onClick={() => {
                        // AGGRESSIVE: Calculate TOTAL from ALL DUPLICATES
                        const allDuplicates = (selectedCustomer as any)?._allDuplicates || [selectedCustomer]
                        let totalAmount = 0
                        
                        allDuplicates.forEach((dup: any) => {
                          for (const [key, val] of Object.entries(dup)) {
                            const lowerKey = key.toLowerCase()
                            if (lowerKey === 'total' || (lowerKey.includes('total') && !lowerKey.includes('qty'))) {
                              totalAmount += isNaN(parseFloat(val)) ? 0 : parseFloat(val)
                            }
                          }
                        })
                        
                        // Fallback: if no total found, calculate from first duplicate
                        if (totalAmount === 0) {
                          for (const [key, val] of Object.entries(selectedCustomer)) {
                            const lowerKey = key.toLowerCase()
                            if (lowerKey.includes('qty') || lowerKey.includes('quantity')) {
                              const qty = isNaN(parseFloat(val)) ? 0 : parseFloat(val)
                              
                              for (const [k2, v2] of Object.entries(selectedCustomer)) {
                                if (k2.toLowerCase().includes('price') || k2.toLowerCase().includes('selling')) {
                                  const price = isNaN(parseFloat(v2)) ? 0 : parseFloat(v2)
                                  totalAmount = qty * price * allDuplicates.length
                                  break
                                }
                              }
                              break
                            }
                          }
                        }
                        
                        setCreditAmount(totalAmount.toString())
                        setShowCreditModal(true)
                      }}
                      style={{
                        padding: '1rem',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(59, 130, 246, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      💰 Credit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showPayModal && selectedCustomer && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
            backdropFilter: 'blur(4px)',
            padding: '1rem',
          }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
                padding: '2rem 2rem 1.5rem 2rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '900',
                    color: '#0f172a',
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}>
                    Payment Confirmation
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                    <p style={{
                      fontSize: '0.85rem',
                      color: '#64748b',
                      margin: 0,
                      fontWeight: '600',
                    }}>
                      {selectedCustomer.name}
                    </p>
                    {paymentAmount && (
                      <span style={{
                        fontSize: '0.9rem',
                        fontWeight: '800',
                        color: '#2563eb',
                        background: '#dbeafe',
                        padding: '0.35rem 0.75rem',
                        borderRadius: '6px',
                      }}>
                        {(() => {
                          const mainAmount = parseFloat(paymentAmount) || 0
                          const additionalBankTotal = additionalBanks.reduce((sum, bank) => sum + (parseFloat(bank.amount) || 0), 0)
                          const total = mainAmount + additionalBankTotal
                          return total.toLocaleString('en-US', { minimumFractionDigits: 2 })
                        })()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowPayModal(false)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    color: '#64748b',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e2e8f0'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f1f5f9'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
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
                      Amount (ብር)
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
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.background = '#f8fafc'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>

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
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit',
                        fontWeight: '600',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.background = '#f8fafc'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      {['CBE', 'NBE', 'Dashen', 'Awash', 'Abyssinia', 'BOA', 'Hibret', 'Addis', 'Berhan', 'Oromia', 'Wegagen', 'Walia', 'Telebirr', 'Cash', 'M-pesa'].map(bank => (
                        <option key={bank} value={bank}>{bank}</option>
                      ))}
                    </select>
                  </div>

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
                      Transaction ID *
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Enter transaction ID (required)"
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
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.background = '#f8fafc'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  {/* Additional Banks */}
                  {additionalBanks.map((bankPayment, index) => (
                    <div key={index} style={{
                      padding: '1.5rem',
                      background: '#f8fafc',
                      borderRadius: '12px',
                      border: '2px dashed #cbd5e1',
                      marginTop: '1rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{
                          fontSize: '0.85rem',
                          fontWeight: '800',
                          color: '#475569',
                          margin: 0,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}>
                          Bank Payment #{index + 2}
                        </h3>
                        <button
                          onClick={() => {
                            setAdditionalBanks(additionalBanks.filter((_, i) => i !== index))
                          }}
                          style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#fecaca'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#fee2e2'
                          }}
                        >
                          Remove
                        </button>
                      </div>

                      <div style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                          <label style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            color: '#64748b',
                            display: 'block',
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}>
                            Bank
                          </label>
                          <select
                            value={bankPayment.bank}
                            onChange={(e) => {
                              const updated = [...additionalBanks]
                              updated[index].bank = e.target.value
                              setAdditionalBanks(updated)
                            }}
                            style={{
                              width: '100%',
                              padding: '0.75rem 0.85rem',
                              border: '1.5px solid #e2e8f0',
                              borderRadius: '10px',
                              fontSize: '0.9rem',
                              background: 'white',
                              outline: 'none',
                              transition: 'all 0.2s ease',
                              fontFamily: 'inherit',
                              fontWeight: '600',
                              boxSizing: 'border-box',
                            }}
                          >
                            {['CBE', 'NBE', 'Dashen', 'Awash', 'Abyssinia', 'BOA', 'Hibret', 'Addis', 'Berhan', 'Oromia', 'Wegagen', 'Walia', 'Telebirr', 'Cash', 'M-pesa'].map(bank => (
                              <option key={bank} value={bank}>{bank}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            color: '#64748b',
                            display: 'block',
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}>
                            Amount (ብር)
                          </label>
                          <input
                            type="number"
                            value={bankPayment.amount}
                            onChange={(e) => {
                              const updated = [...additionalBanks]
                              updated[index].amount = e.target.value
                              setAdditionalBanks(updated)
                            }}
                            placeholder="Enter amount"
                            style={{
                              width: '100%',
                              padding: '0.75rem 0.85rem',
                              border: '1.5px solid #e2e8f0',
                              borderRadius: '10px',
                              fontSize: '0.9rem',
                              background: 'white',
                              outline: 'none',
                              transition: 'all 0.2s ease',
                              fontFamily: 'inherit',
                              fontWeight: '600',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>

                        <div>
                          <label style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            color: '#64748b',
                            display: 'block',
                            marginBottom: '0.5rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}>
                            Payment Reason
                          </label>
                          <input
                            type="text"
                            value={bankPayment.reason}
                            onChange={(e) => {
                              const updated = [...additionalBanks]
                              updated[index].reason = e.target.value
                              setAdditionalBanks(updated)
                            }}
                            placeholder="Enter transaction ID (required)"
                            style={{
                              width: '100%',
                              padding: '0.75rem 0.85rem',
                              border: '1.5px solid #e2e8f0',
                              borderRadius: '10px',
                              fontSize: '0.9rem',
                              background: 'white',
                              outline: 'none',
                              transition: 'all 0.2s ease',
                              fontFamily: 'inherit',
                              fontWeight: '600',
                              boxSizing: 'border-box',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Bank Button */}
                  <button
                    onClick={() => {
                      setAdditionalBanks([...additionalBanks, { bank: 'CBE', amount: '', reason: '' }])
                    }}
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '0.9rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
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
                    <span style={{ fontSize: '1.1rem' }}>+</span>
                    Add Bank
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#64748b',
                        display: 'block',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        Additional Amount
                      </label>
                      <input
                        type="number"
                        value={additionalPayment}
                        onChange={(e) => setAdditionalPayment(e.target.value)}
                        placeholder="0.00"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          background: '#f8fafc',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          fontFamily: 'inherit',
                          fontWeight: '600',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#3b82f6'
                          e.currentTarget.style.background = 'white'
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#e2e8f0'
                          e.currentTarget.style.background = '#f8fafc'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      />
                    </div>

                    <div>
                      <label style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#64748b',
                        display: 'block',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>
                        Transaction ID (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Additional transaction ID (optional)"
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          border: '1.5px solid #e2e8f0',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          background: '#f8fafc',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          fontFamily: 'inherit',
                          fontWeight: '600',
                          boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#3b82f6'
                          e.currentTarget.style.background = 'white'
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#e2e8f0'
                          e.currentTarget.style.background = '#f8fafc'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      />
                    </div>
                  </div>

                  {/* Payment Notes/Reason - Big Optional Textarea */}
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
                      Payment Notes/Reason
                    </label>
                    <textarea
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      placeholder="Enter any additional notes, payment reason, or remarks"
                      rows={4}
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
                        resize: 'vertical',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.background = '#f8fafc'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  <div style={{
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                    borderRadius: '12px',
                    border: '1px solid #93c5fd',
                    textAlign: 'center',
                  }}>
                    <p style={{
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      color: '#1e40af',
                      margin: '0 0 0.75rem 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                    }}>
                      Total Amount
                    </p>
                    <p style={{
                      fontSize: '1.75rem',
                      fontWeight: '900',
                      color: '#2563eb',
                      margin: 0,
                    }}>
                      {(() => {
                        const mainAmount = parseFloat(paymentAmount) || 0
                        const additionalBankTotal = additionalBanks.reduce((sum, bank) => sum + (parseFloat(bank.amount) || 0), 0)
                        const total = mainAmount + additionalBankTotal
                        return total.toLocaleString('en-US', { minimumFractionDigits: 2 })
                      })()}
                    </p>
                    {additionalBanks.length > 0 && (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#475569' }}>
                        <p style={{ margin: '0.25rem 0', fontWeight: '600' }}>
                          {selectedBank}: {parseFloat(paymentAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        {additionalBanks.map((bank, idx) => (
                          <p key={idx} style={{ margin: '0.25rem 0', fontWeight: '600' }}>
                            {bank.bank}: {parseFloat(bank.amount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{
                padding: '2rem',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
              }}>
                <button
                  onClick={() => setShowPayModal(false)}
                  style={{
                    padding: '1rem 1.5rem',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: '1.5px solid #e2e8f0',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
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
                  onClick={() => {
                    if (paymentAmount && selectedCustomer && paymentReference.trim()) {
                      // Check if all additional bank transaction IDs are filled
                      const allTransactionIDsFilled = additionalBanks.every(bank => bank.reason && bank.reason.trim() !== '')
                      
                      if (!allTransactionIDsFilled) {
                        alert('⚠️ Please enter Transaction ID for all bank payments!')
                        return
                      }
                      
                      // AGGRESSIVE: Get ALL duplicates for this customer
                      const allDuplicates = (selectedCustomer as any)?._allDuplicates || [selectedCustomer]
                      
                      // Calculate total amount from all banks
                      const mainAmount = parseFloat(paymentAmount) || 0
                      const additionalBankTotal = additionalBanks.reduce((sum, bank) => sum + (parseFloat(bank.amount) || 0), 0)
                      const totalAmount = mainAmount + additionalBankTotal
                      
                      // Create SEPARATE transactions for EACH bank payment
                      const transactions = []
                      
                      // Main bank payment
                      transactions.push({
                        id: Date.now(),
                        type: 'Payment',
                        customerName: selectedCustomer.name,
                        amount: paymentAmount,
                        bank: selectedBank,
                        reason: paymentReference,
                        additional: additionalPayment,
                        status: 'Pending',
                        approvalStatus: 'pending',
                        date: new Date().toISOString(),
                        itemsCount: allDuplicates.length,
                        items: allDuplicates.map((dup: any) => ({
                          itemName: Object.entries(dup).find(([k]) => k.toLowerCase().includes('item'))?.[1] || 'N/A',
                          quantity: Object.entries(dup).find(([k]) => k.toLowerCase().includes('qty') || k.toLowerCase().includes('quantity'))?.[1] || 0,
                          price: Object.entries(dup).find(([k]) => k.toLowerCase().includes('price') || k.toLowerCase().includes('selling'))?.[1] || 0,
                          total: Object.entries(dup).find(([k]) => k.toLowerCase() === 'total')?.[1] || 0,
                        })),
                        isMultiBankPayment: additionalBanks.length > 0,
                        totalPaymentAmount: totalAmount.toString(),
                        bankNumber: 1,
                        totalBanks: 1 + additionalBanks.length,
                        // Store complete customer data for restoration if rejected
                        customerData: {
                          ...selectedCustomer,
                          _allDuplicates: allDuplicates,
                        },
                      })
                      
                      // Additional bank payments
                      additionalBanks.forEach((bankPayment, index) => {
                        transactions.push({
                          id: Date.now() + index + 1,
                          type: 'Payment',
                          customerName: selectedCustomer.name,
                          amount: bankPayment.amount,
                          bank: bankPayment.bank,
                          reason: bankPayment.reason,
                          additional: '',
                          status: 'Pending',
                          approvalStatus: 'pending',
                          date: new Date().toISOString(),
                          itemsCount: allDuplicates.length,
                          items: allDuplicates.map((dup: any) => ({
                            itemName: Object.entries(dup).find(([k]) => k.toLowerCase().includes('item'))?.[1] || 'N/A',
                            quantity: Object.entries(dup).find(([k]) => k.toLowerCase().includes('qty') || k.toLowerCase().includes('quantity'))?.[1] || 0,
                            price: Object.entries(dup).find(([k]) => k.toLowerCase().includes('price') || k.toLowerCase().includes('selling'))?.[1] || 0,
                            total: Object.entries(dup).find(([k]) => k.toLowerCase() === 'total')?.[1] || 0,
                          })),
                          isMultiBankPayment: true,
                          totalPaymentAmount: totalAmount.toString(),
                          bankNumber: index + 2,
                          totalBanks: 1 + additionalBanks.length,
                          // Store complete customer data for restoration if rejected
                          customerData: {
                            ...selectedCustomer,
                            _allDuplicates: allDuplicates,
                          },
                        })
                      })
                      
                      // Save ALL transactions to confirmed transactions
                      const existing = JSON.parse(localStorage.getItem('confirmed_transactions') || '[]')
                      const updated = [...existing, ...transactions]
                      localStorage.setItem('confirmed_transactions', JSON.stringify(updated))
                      
                      // AGGRESSIVE: Remove ALL duplicates of this customer
                      const customerNameLower = selectedCustomer.name.toLowerCase()
                      const updatedCustomers = uploadedCustomers.filter(c => c.name.toLowerCase() !== customerNameLower)
                      setUploadedCustomers(updatedCustomers)
                      localStorage.setItem('uploaded_customers_persist', JSON.stringify(updatedCustomers))
                      
                      // Build success message
                      let bankDetails = `🏦 ${selectedBank}: ${parseFloat(paymentAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      if (additionalBanks.length > 0) {
                        additionalBanks.forEach(b => {
                          bankDetails += `\n🏦 ${b.bank}: ${parseFloat(b.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                        })
                      }
                      
                      // Show success message
                      alert(`✅ Payment Submitted!\n\n👤 Customer: ${selectedCustomer.name}\n💰 Total: ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n\n${bankDetails}\n\n📦 Items: ${allDuplicates.length} copies\n\n⏳ ${transactions.length} payment(s) pending admin approval!`)
                      
                      setShowPayModal(false)
                      setSelectedCustomer(null)
                      setPaymentAmount('')
                      setSelectedBank('CBE')
                      setPaymentReference('')
                      setAdditionalPayment('')
                      setAdditionalBanks([])
                      setPaymentNotes('')
                    }
                  }}
                  disabled={!paymentAmount || !paymentReference.trim() || additionalBanks.some(bank => !bank.reason || !bank.reason.trim())}
                  style={{
                    padding: '1rem',
                    background: (!paymentAmount || !paymentReference.trim() || additionalBanks.some(bank => !bank.reason || !bank.reason.trim())) 
                      ? '#94a3b8' 
                      : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: (!paymentAmount || !paymentReference.trim() || additionalBanks.some(bank => !bank.reason || !bank.reason.trim())) 
                      ? 'not-allowed' 
                      : 'pointer',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '1rem 1.5rem',
                    opacity: (!paymentAmount || !paymentReference.trim() || additionalBanks.some(bank => !bank.reason || !bank.reason.trim())) 
                      ? 0.6 
                      : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!paymentAmount || !paymentReference.trim() || additionalBanks.some(bank => !bank.reason || !bank.reason.trim())) return
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(37, 99, 235, 0.35)'
                  }}
                  onMouseLeave={(e) => {
                    if (!paymentAmount || !paymentReference.trim() || additionalBanks.some(bank => !bank.reason || !bank.reason.trim())) return
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

        {showCreditModal && selectedCustomer && (
          <div 
            onClick={() => setShowCreditModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10001,
              backdropFilter: 'blur(4px)',
              padding: '1rem',
            }}>
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
              background: 'white',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '500px',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
                padding: '2rem 2rem 1.5rem 2rem',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '900',
                    color: '#0f172a',
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}>
                    Credit Request
                  </h2>
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#64748b',
                    margin: '0.5rem 0 0 0',
                    fontWeight: '600',
                  }}>
                    {selectedCustomer.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowCreditModal(false)}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    color: '#64748b',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e2e8f0'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f1f5f9'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
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
                      Credit Amount (ብር)
                    </label>
                    <input
                      type="number"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(e.target.value)}
                      placeholder="Enter credit amount"
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
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.background = '#f8fafc'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>

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
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={creditReason}
                      onChange={(e) => setCreditReason(e.target.value)}
                      placeholder="Enter transaction ID"
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
                        e.currentTarget.style.borderColor = '#3b82f6'
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0'
                        e.currentTarget.style.background = '#f8fafc'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  <div style={{
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                    borderRadius: '12px',
                    border: '1px solid #93c5fd',
                  }}>
                    <p style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: '#1e40af',
                      margin: '0 0 0.75rem 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Credit Summary
                    </p>
                    <p style={{
                      fontSize: '1.75rem',
                      fontWeight: '900',
                      color: '#1e40af',
                      margin: 0,
                    }}>
                      {creditAmount ? `${parseFloat(creditAmount).toLocaleString()} ብር` : '0 ብር'}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                padding: '2rem',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}>
                <button
                  onClick={() => setShowCreditModal(false)}
                  style={{
                    padding: '1rem',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
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
                  onClick={() => {
                    alert('🔵 DEBUG: Confirm Credit button clicked! Check console for details.');
                    if (creditAmount && selectedCustomer) {
                      // PAY CREDIT: Customer uses existing credit to pay off balance
                      // Single Credit transaction: balance -= amount, totalCredits += amount
                      
                      const paymentAmount = parseFloat(creditAmount)
                      const currentBalance = parseFloat(selectedCustomer.balance || '0')
                      const currentCredit = parseFloat(selectedCustomer.totalCredits || '0')
                      
                      // Create single Credit transaction
                      const creditPaymentTransaction = {
                        id: Date.now(),
                        type: 'Credit', // Credit type: subtracts from balance, adds to totalCredits
                        transactionType: 'Pay Credit',
                        customerName: selectedCustomer.name,
                        customer: selectedCustomer.name,
                        amount: creditAmount,
                        bank: '',
                        reason: creditReason,
                        transactionId: creditReason,
                        status: 'Pending',
                        date: new Date().toISOString(),
                        approvalStatus: 'pending',
                        requestedBy: localStorage.getItem('user_email') || 'sales',
                        requestedAt: new Date().toISOString(),
                      }
                      
                      console.log('🔥 PAY CREDIT - Single Credit transaction:')
                      console.log('   Transaction:', creditPaymentTransaction)
                      console.log('   Effect: balance -= amount, totalCredits += amount')
                      console.log('   Balance: ' + currentBalance + ' - ' + paymentAmount + ' = ' + (currentBalance - paymentAmount))
                      console.log('   Credits: ' + currentCredit + ' + ' + paymentAmount + ' = ' + (currentCredit + paymentAmount))
                      
                      // Save transaction
                      const existing = JSON.parse(localStorage.getItem('confirmed_transactions') || '[]')
                      const updated = [...existing, creditPaymentTransaction]
                      localStorage.setItem('confirmed_transactions', JSON.stringify(updated))
                      
                      console.log('💾 Transaction saved. PENDING admin approval')
                      
                      // Show success
                      const newBalance = currentBalance - paymentAmount
                      const newCredit = currentCredit + paymentAmount
                      
                      alert(`✅ Pay Credit Request Submitted!\n\n👤 Customer: ${selectedCustomer.name}\n💳 Credit Used: ${paymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር\n🔢 Transaction ID: ${creditReason || 'N/A'}\n\n⏳ Status: PENDING APPROVAL\n\n📊 After Approval:\n• Balance: ${currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} → ${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር\n• Credits: ${currentCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })} → ${newCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር`)
                      
                      setShowCreditModal(false)
                      setSelectedCustomer(null)
                      setCreditAmount('')
                      setCreditReason('')
                    }
                  }}
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(59, 130, 246, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  ✓ Confirm Credit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Refund Modal */}
        {showRefundModal && selectedCustomer && (
          <div 
            onClick={() => setShowRefundModal(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10002,
              backdropFilter: 'blur(4px)',
              padding: '1rem',
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                padding: '2rem 2rem 1.5rem 2rem',
                borderBottom: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '900',
                    color: '#991b1b',
                    margin: 0,
                    letterSpacing: '-0.01em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    Refund Request
                  </h2>
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#b91c1c',
                    margin: '0.5rem 0 0 0',
                    fontWeight: '600',
                  }}>
                    {selectedCustomer.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowRefundModal(false)}
                  style={{
                    background: '#fee2e2',
                    border: 'none',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                    color: '#991b1b',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#fecaca'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#fee2e2'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  {/* Warning Banner */}
                  <div style={{
                    padding: '1rem 1.25rem',
                    background: '#fef3c7',
                    borderLeft: '4px solid #f59e0b',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: '700', color: '#92400e' }}>
                        Refund Confirmation Required
                      </p>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: '#78350f', lineHeight: '1.5' }}>
                        This action will deduct the amount from customer's balance and mark it as a refund.
                      </p>
                    </div>
                  </div>

                  {/* Amount Input */}
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
                      Refund Amount (ብር)
                    </label>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      placeholder="Enter refund amount"
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        border: '1.5px solid #fecaca',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: '#fef2f2',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit',
                        fontWeight: '600',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#ef4444'
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#fecaca'
                        e.currentTarget.style.background = '#fef2f2'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  {/* Transaction ID Input */}
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
                      Transaction ID
                    </label>
                    <input
                      type="text"
                      value={refundTransactionId}
                      onChange={(e) => setRefundTransactionId(e.target.value)}
                      placeholder="Enter transaction ID"
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        border: '1.5px solid #fecaca',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: '#fef2f2',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit',
                        fontWeight: '600',
                        boxSizing: 'border-box',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#ef4444'
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#fecaca'
                        e.currentTarget.style.background = '#fef2f2'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  {/* Reason Input */}
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
                      Refund Reason
                    </label>
                    <textarea
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      placeholder="Describe why this refund is being issued..."
                      style={{
                        width: '100%',
                        padding: '0.85rem 1rem',
                        border: '1.5px solid #fecaca',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        background: '#fef2f2',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit',
                        fontWeight: '600',
                        boxSizing: 'border-box',
                        minHeight: '100px',
                        resize: 'vertical',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#ef4444'
                        e.currentTarget.style.background = 'white'
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#fecaca'
                        e.currentTarget.style.background = '#fef2f2'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    />
                  </div>

                  {/* Summary */}
                  <div style={{
                    padding: '1.5rem',
                    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                    borderRadius: '12px',
                    border: '1px solid #fca5a5',
                  }}>
                    <p style={{
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      color: '#991b1b',
                      margin: '0 0 0.75rem 0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Refund Amount
                    </p>
                    <p style={{
                      fontSize: '1.75rem',
                      fontWeight: '900',
                      color: '#991b1b',
                      margin: 0,
                    }}>
                      {refundAmount ? `${parseFloat(refundAmount).toLocaleString()} ብር` : '0 ብር'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: '2rem',
                borderTop: '1px solid #fecaca',
                background: '#fef2f2',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
              }}>
                <button
                  onClick={() => setShowRefundModal(false)}
                  style={{
                    padding: '1rem',
                    background: '#f1f5f9',
                    color: '#64748b',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
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
                  onClick={() => {
                    if (refundAmount && selectedCustomer) {
                      // AGGRESSIVE: Create Payment transaction that ADDS to customer balance
                      // Refund also REDUCES customer debt or puts them in credit
                      const newTransaction = {
                        id: Date.now(),
                        type: 'Payment', // Payment type ADDS to balance (same as Pay Credit)
                        transactionType: 'Refund', // Display type for UI
                        customerName: selectedCustomer.name,
                        customer: selectedCustomer.name, // Add for compatibility
                        amount: refundAmount,
                        transactionId: refundTransactionId, // Add transaction ID
                        reason: refundReason,
                        status: 'Pending', // Pending until admin approves
                        date: new Date().toISOString(),
                        approvalStatus: 'pending', // WAIT for admin approval
                        requestedBy: localStorage.getItem('user_email') || 'sales',
                        requestedAt: new Date().toISOString(),
                        isRefund: true, // Mark as refund for clarity
                      }
                      
                      console.log('🔥 REFUND - Creating PENDING Payment Transaction:', newTransaction)
                      
                      // Save to confirmed transactions (but pending approval)
                      const existing = JSON.parse(localStorage.getItem('confirmed_transactions') || '[]')
                      const updated = [...existing, newTransaction]
                      localStorage.setItem('confirmed_transactions', JSON.stringify(updated))
                      
                      console.log('💾 Refund saved. Status: PENDING - Awaiting admin approval')
                      console.log('📋 Total transactions:', updated.length)
                      
                      // Show success message - PENDING approval
                      alert(`✅ Refund Request Submitted!\n\n👤 Customer: ${selectedCustomer.name}\n💸 Refund: ${parseFloat(refundAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር\n🔢 Transaction ID: ${refundTransactionId}\n📝 Reason: ${refundReason}\n\n⏳ Status: PENDING\n\n📋 This refund request has been sent to admin for approval.\nBalance will be updated automatically after admin approval.`)
                      
                      setShowRefundModal(false)
                      setSelectedCustomer(null)
                      setSelectedSearchCustomer(null)
                      setRefundAmount('')
                      setRefundReason('')
                      setRefundTransactionId('')
                    }
                  }}
                  disabled={!refundAmount || !refundTransactionId || !refundReason}
                  style={{
                    padding: '1rem',
                    background: !refundAmount || !refundTransactionId || !refundReason ? '#cbd5e1' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: !refundAmount || !refundTransactionId || !refundReason ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    opacity: !refundAmount || !refundTransactionId || !refundReason ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (refundAmount && refundTransactionId && refundReason) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(239, 68, 68, 0.3)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  ✓ Process Refund
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        
        {/* ULTRA AGGRESSIVE STORAGE CLEAR */}
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            try {
              // Clear localStorage completely
              const localStorageKeys = Object.keys(localStorage);
              localStorageKeys.forEach(key => {
                if (key.includes('customer') || key.includes('upload') || key.includes('temp')) {
                  localStorage.removeItem(key);
                }
              });
              
              // Clear sessionStorage completely
              const sessionStorageKeys = Object.keys(sessionStorage);
              sessionStorageKeys.forEach(key => {
                if (key.includes('customer') || key.includes('upload') || key.includes('temp')) {
                  sessionStorage.removeItem(key);
                }
              });
              
              // Clear IndexedDB
              if (window.indexedDB) {
                indexedDB.databases?.().then(databases => {
                  databases.forEach(db => {
                    indexedDB.deleteDatabase(db.name);
                  });
                });
              }
              
              // Disable any cache API
              if ('caches' in window) {
                caches.keys().then(cacheNames => {
                  cacheNames.forEach(cacheName => {
                    caches.delete(cacheName);
                  });
                });
              }
              
              console.log('✓ ULTRA AGGRESSIVE STORAGE CLEARED');
            } catch(e) {
              console.error('Storage clear error:', e);
            }
          })();
        `}} />
      </div>

      {/* Search Customer Modal */}
      {showSearchModal && (
        <div
          onClick={() => setShowSearchModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
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
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700' }}>🔍 Search Customer</h3>
                <button
                  onClick={() => setShowSearchModal(false)}
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
                    fontWeight: '700'
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            <div style={{ padding: '1.5rem' }}>
              <input
                type="text"
                placeholder="Type customer name..."
                value={searchCustomerQuery}
                onChange={(e) => {
                  setSearchCustomerQuery(e.target.value)
                  searchCustomerInDatabase(e.target.value)
                }}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.9rem 1.2rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#10b981'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(16, 185, 129, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.5rem 1.5rem', maxHeight: '400px' }}>
              {isSearching ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#9ca3af' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    margin: '0 auto 1rem',
                    border: '4px solid #e5e7eb',
                    borderTop: '4px solid #10b981',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }} />
                  <p style={{ margin: 0, fontWeight: '600' }}>Searching customers...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div>
                  <div style={{
                    padding: '0.75rem 1rem',
                    background: '#ecfdf5',
                    borderRadius: '8px',
                    marginBottom: '1rem',
                    border: '1px solid #d1fae5',
                  }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#059669', fontWeight: '700' }}>
                      ✓ Found {searchResults.length} customer{searchResults.length !== 1 ? 's' : ''} from admin database
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {searchResults.map((customer, index) => {
                    // Extract customer data
                    const customerId = customer.id || customer._id || index
                    const customerName = customer.name || customer.customerName || customer.Name || `Customer ${customerId}`
                    const customerPhone = customer.phone || customer.phoneNumber || customer.Phone || ''
                    const customerBalance = parseFloat(customer.balance || '0')
                    const customerCredit = parseFloat(customer.totalCredits || '0')
                    
                    return (
                    <div
                      key={customerId}
                      onClick={() => {
                        console.log('Selected customer:', customer)
                        setSelectedSearchCustomer(customer)
                        setShowSearchModal(false)
                      }}
                      style={{
                        padding: '1rem 1.25rem',
                        background: '#f9fafb',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: '1px solid #e5e7eb'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#10b98110'
                        e.currentTarget.style.borderColor = '#10b981'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f9fafb'
                        e.currentTarget.style.borderColor = '#e5e7eb'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '900',
                          fontSize: '1.1rem',
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                        }}>
                          {customerName.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: '700', color: '#111827', fontSize: '1rem', letterSpacing: '-0.01em' }}>
                            {customerName}
                          </p>
                          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#10b981', fontWeight: '700' }}>
                              💰 {customerBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                            </p>
                            {customerCredit > 0 && (
                              <p style={{ margin: 0, fontSize: '0.85rem', color: '#f59e0b', fontWeight: '700' }}>
                                💳 {customerCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                              </p>
                            )}
                          </div>
                        </div>
                        <div style={{
                          padding: '0.5rem 1rem',
                          background: '#10b98115',
                          color: '#059669',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: '800',
                        }}>
                          View →
                        </div>
                      </div>
                    </div>
                    )
                  })}
                  </div>
                </div>
              ) : searchCustomerQuery.trim() ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                  <p>No customers found</p>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>
                  <p>Start typing to search customers...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected Search Customer Detail Modal */}
      {selectedSearchCustomer && !showCreditModal && !showRefundModal && (() => {
        console.log('🔍 Selected Search Customer Object:', selectedSearchCustomer)
        console.log('📊 Raw balance:', selectedSearchCustomer.balance)
        console.log('📊 Raw totalCredits:', selectedSearchCustomer.totalCredits)
        
        const customerName = selectedSearchCustomer.name || 'Unknown Customer'
        const customerPhone = selectedSearchCustomer.phone || ''
        const customerAddress = selectedSearchCustomer.address || ''
        const customerBalance = parseFloat(selectedSearchCustomer.balance || '0')
        const customerCredit = parseFloat(selectedSearchCustomer.totalCredits || '0')
        
        console.log('💰 Parsed balance:', customerBalance)
        console.log('💳 Parsed credit:', customerCredit)
        
        return (
        <div
          onClick={() => setSelectedSearchCustomer(null)}
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
            zIndex: 10000,
            padding: '1rem',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: '#111827',
                }}>
                  {customerName}
                </h2>
                <button
                  onClick={() => setSelectedSearchCustomer(null)}
                  style={{
                    background: '#f3f4f6',
                    border: 'none',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280',
                    fontSize: '1.25rem',
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem' }}>
              {/* Balance & Credit */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}>
                <div style={{
                  background: '#10b981',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  color: 'white',
                }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                    Balance
                  </p>
                  <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700' }}>
                    {customerBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
                    ETB
                  </p>
                </div>

                <div style={{
                  background: '#f59e0b',
                  borderRadius: '8px',
                  padding: '1.25rem',
                  color: 'white',
                }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                    Credit
                  </p>
                  <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '700' }}>
                    {customerCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
                    ETB
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}>
                <button
                  onClick={() => {
                    setSelectedSearchCustomer(null) // Close detail modal immediately
                    setSelectedCustomer(selectedSearchCustomer) // Pass customer to credit modal
                    setShowCreditModal(true) // Open credit modal
                  }}
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.35)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.25)'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                    <line x1="1" y1="10" x2="23" y2="10"></line>
                  </svg>
                  Pay Credit
                </button>

                <button
                  onClick={() => {
                    setSelectedSearchCustomer(null) // Close detail modal immediately
                    setSelectedCustomer(selectedSearchCustomer) // Pass customer to refund modal
                    setShowRefundModal(true) // Open refund modal
                  }}
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.35)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.25)'
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

              {/* Contact Info */}
              {(customerPhone || customerAddress) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {customerPhone && (
                    <div style={{
                      padding: '1rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        Phone
                      </p>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: '#111827', fontWeight: '600' }}>
                        {customerPhone}
                      </p>
                    </div>
                  )}

                  {customerAddress && (
                    <div style={{
                      padding: '1rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                    }}>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                        Address
                      </p>
                      <p style={{ margin: 0, fontSize: '0.95rem', color: '#111827', fontWeight: '600' }}>
                        {customerAddress}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        )
      })()}
    </AdminLayout>
  )
}

function PremiumKPICard({ icon, label, value, color, trend }: any) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      border: '1px solid rgba(0, 0, 0, 0.03)',
      transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
      cursor: 'pointer',
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
            fontSize: '0.7rem',
            fontWeight: '500',
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
          }}>
            {label}
          </span>
          <div style={{
            width: '35px',
            height: '35px',
            borderRadius: '10px',
            background: `${color}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            fontWeight: 'bold',
          }}>
            {icon}
          </div>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <p style={{
            fontSize: '1.75rem',
            fontWeight: '950',
            margin: 0,
            color: '#0f172a',
            letterSpacing: '-0.03em',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
          }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
      </div>
    </div>
  )
}
