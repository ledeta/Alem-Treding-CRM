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
  const [payModalRef, setPayModalRef] = useState<HTMLDivElement | null>(null)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [creditAmount, setCreditAmount] = useState('')
  const [creditReason, setCreditReason] = useState('')
  const [confirmedTransactions, setConfirmedTransactions] = useState<any[]>([])
  const mountedRef = useRef(false)

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
  }, [])

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
          customerColumn = possibleColumns.find(col => col in firstRow) || Object.keys(firstRow)[0]
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
              value={customers.length}
              color="#3b82f6"
              trend="+12%"
            />
            <PremiumKPICard 
              icon="📊"
              label="Uploaded Customers" 
              value={new Set(uploadedCustomers.map(c => c.name.toLowerCase())).size}
              color="#10b981"
              trend={uploadedCustomers.length > 0 ? "Ready" : "Pending"}
            />
            <PremiumKPICard 
              icon="✓"
              label="Confirmed Transactions" 
              value={confirmedTransactions.length}
              color="#8b5cf6"
              trend="Active"
            />
            <PremiumKPICard 
              icon="⚡"
              label="System Status" 
              value="Ready"
              color="#f59e0b"
              trend="Live"
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
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '1.5rem',
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
                    padding: '1rem 2.2rem',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '950',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.35)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.25)'
                  }}
                >
                  Upload
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
                    if (!seen.has(nameLower)) {
                      seen.add(nameLower)
                      // Get ALL duplicates for this customer
                      const allDuplicates = uploadedCustomers.filter(
                        c => c.name.toLowerCase() === nameLower
                      )
                      const deduped = {
                        ...customer,
                        _allDuplicates: allDuplicates
                      }
                      uniqueCustomers.push(deduped)
                    }
                  })
                  
                  return uniqueCustomers
                    .filter(customer => 
                      customer.name.toLowerCase().includes(searchQuery.toLowerCase())
                    )
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
                        {parseFloat(paymentAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                      Payment Reason
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Enter reference or note"
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
                        Reason (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Additional notes"
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
                      {paymentAmount ? parseFloat(paymentAmount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
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
                    if (paymentAmount && selectedCustomer) {
                      const newTransaction = {
                        id: Date.now(),
                        type: 'Payment',
                        customerName: selectedCustomer.name,
                        amount: paymentAmount,
                        bank: selectedBank,
                        reason: paymentReference,
                        additional: additionalPayment,
                        status: 'Completed',
                        date: new Date().toISOString(),
                      }
                      const existing = JSON.parse(localStorage.getItem('confirmed_transactions') || '[]')
                      const updated = [...existing, newTransaction]
                      localStorage.setItem('confirmed_transactions', JSON.stringify(updated))
                      
                      // Remove only the selected customer by unique _uploadId
                      const updatedCustomers = uploadedCustomers.filter(c => c._uploadId !== selectedCustomer._uploadId)
                      setUploadedCustomers(updatedCustomers)
                      localStorage.setItem('uploaded_customers_persist', JSON.stringify(updatedCustomers))
                      
                      setShowPayModal(false)
                      setSelectedCustomer(null)
                      setPaymentAmount('')
                      setSelectedBank('CBE')
                      setPaymentReference('')
                      setAdditionalPayment('')
                    }
                  }}
                  style={{
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '1rem 1.5rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(37, 99, 235, 0.35)'
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

        {showCreditModal && selectedCustomer && (
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
                      Payment Reason
                    </label>
                    <textarea
                      value={creditReason}
                      onChange={(e) => setCreditReason(e.target.value)}
                      placeholder="Enter reason for credit"
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
                        minHeight: '100px',
                        resize: 'vertical',
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
                    if (creditAmount && selectedCustomer) {
                      const newTransaction = {
                        id: Date.now(),
                        type: 'Credit',
                        customerName: selectedCustomer.name,
                        amount: creditAmount,
                        bank: '',
                        reason: creditReason,
                        status: 'Completed',
                        date: new Date().toISOString(),
                      }
                      const existing = JSON.parse(localStorage.getItem('confirmed_transactions') || '[]')
                      const updated = [...existing, newTransaction]
                      localStorage.setItem('confirmed_transactions', JSON.stringify(updated))
                      
                      // Remove only the selected customer by unique _uploadId
                      const updatedCustomers = uploadedCustomers.filter(c => c._uploadId !== selectedCustomer._uploadId)
                      setUploadedCustomers(updatedCustomers)
                      localStorage.setItem('uploaded_customers_persist', JSON.stringify(updatedCustomers))
                      
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
