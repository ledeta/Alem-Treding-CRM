'use client'

import { useState, useEffect, useRef } from 'react'
import { ShoppingBag, Search, Plus, Minus, X, Receipt, Upload, FileSpreadsheet, Package, Check, AlertCircle, Calendar, User, MapPin, Info, Send, DollarSign, List } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AdminBottomNav from '@/components/AdminBottomNav'
import * as XLSX from 'xlsx'

interface Item {
  id: number
  name: string
  category: string
  stock: number
  price: number
}

interface CartItem extends Item {
  quantity: number
}

interface Transaction {
  id: number
  customer: string
  customerName: string
  type: 'Payment' | 'Credit'
  amount: string
  date: string
  status: 'Approved' | 'Pending' | 'Rejected'
  approvalStatus: 'pending' | 'approved' | 'rejected'
  transactionType?: string
  transactionId?: string
}

interface UploadedItem {
  id: number
  name: string
  category: string
  quantity: number
  price: number
  total: number
  soldBy: string
  branch: string
  date: string
  customer?: string
}

interface CustomerGroup {
  customerName: string
  items: UploadedItem[]
  totalAmount: number
  totalItems: number
}

export default function ShopPage() {
  const router = useRouter()
  const [items, setItems] = useState<Item[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [uploadedItems, setUploadedItems] = useState<UploadedItem[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerGroup | null>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<UploadedItem | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showPaymentRequestModal, setShowPaymentRequestModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentNote, setPaymentNote] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Load items from localStorage
    try {
      const storedItems = localStorage.getItem('dashboard_items')
      if (storedItems) {
        setItems(JSON.parse(storedItems))
      }
    } catch (e) {
      console.error('Error loading items:', e)
    }

    // Load uploaded items from localStorage
    try {
      const storedUploadedItems = localStorage.getItem('uploaded_sales_items')
      if (storedUploadedItems) {
        setUploadedItems(JSON.parse(storedUploadedItems))
      }
    } catch (e) {
      console.error('Error loading uploaded items:', e)
    }
  }, [])

  const loadTransactions = () => {
    // Removed - transactions functionality no longer needed
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type - only Excel files
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.xlsx',
      '.xls'
    ]
    
    const fileExtension = file.name.toLowerCase().split('.').pop()
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      setUploadError('Please upload only Excel files (.xlsx or .xls)')
      setTimeout(() => setUploadError(''), 3000)
      return
    }

    setIsUploading(true)
    setUploadError('')

    try {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[]

          // Get current user info
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
          const defaultSoldBy = currentUser.username || 'Sales User'
          const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' })

          // Log first row to see actual column names
          if (jsonData.length > 0) {
            console.log('Excel columns detected:', Object.keys(jsonData[0]))
            console.log('First row data:', jsonData[0])
          }

          // Process the Excel data with more flexible column matching
          const processedItems: UploadedItem[] = jsonData.map((row, index) => {
            // Helper function to find column value case-insensitively
            const findValue = (possibleNames: string[]) => {
              for (const name of possibleNames) {
                // Check exact match
                if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
                  return row[name]
                }
                // Check case-insensitive match
                const key = Object.keys(row).find(k => k.toLowerCase() === name.toLowerCase())
                if (key && row[key] !== undefined && row[key] !== null && row[key] !== '') {
                  return row[key]
                }
              }
              return null
            }

            // Extract values with extensive column name variations
            const nameValue = findValue([
              'Name', 'name', 'NAME', 'Item Name', 'ItemName', 'item name', 'ITEM NAME',
              'Item', 'item', 'ITEM', 'Product', 'product', 'PRODUCT', 'Product Name',
              'Description', 'description'
            ])
            
            const categoryValue = findValue([
              'Category', 'category', 'CATEGORY', 'Type', 'type', 'TYPE',
              'Item Type', 'Product Type', 'Classification'
            ])
            
            const quantityValue = findValue([
              'Quantity', 'quantity', 'QUANTITY', 'Qty', 'qty', 'QTY',
              'Amount', 'amount', 'Count', 'Units'
            ])
            
            const priceValue = findValue([
              'Price', 'price', 'PRICE', 'Selling Price', 'SellingPrice', 'selling price',
              'Unit Price', 'UnitPrice', 'unit price', 'Rate', 'rate'
            ])
            
            const totalValue = findValue([
              'Total', 'total', 'TOTAL', 'Total Price', 'TotalPrice', 'total price',
              'Total Amount', 'Amount', 'Sum'
            ])
            
            const soldByValue = findValue([
              'Sold By', 'SoldBy', 'sold by', 'SOLD BY', 'Sales Person', 'SalesPerson',
              'sales person', 'Salesperson', 'Sales', 'sales', 'Seller', 'seller'
            ])
            
            const branchValue = findValue([
              'Branch', 'branch', 'BRANCH', 'Location', 'location', 'LOCATION',
              'Store', 'store', 'Office', 'Site'
            ])
            
            const dateValue = findValue([
              'Date', 'date', 'DATE', 'Sale Date', 'SaleDate', 'sale date',
              'Transaction Date', 'Sales Date'
            ])

            const customerValue = findValue([
              'Customer', 'customer', 'CUSTOMER', 'Customer Name', 'CustomerName',
              'customer name', 'CUSTOMER NAME', 'Client', 'client', 'CLIENT',
              'Buyer', 'buyer', 'BUYER'
            ])

            const quantity = parseInt(String(quantityValue || '1')) || 1
            const price = parseFloat(String(priceValue || '0')) || 0
            const total = parseFloat(String(totalValue || '0')) || (price * quantity)
            
            return {
              id: Date.now() + index,
              name: String(nameValue || 'Unnamed Item').trim(),
              category: String(categoryValue || 'General').trim(),
              quantity: quantity,
              price: price,
              total: total,
              soldBy: String(soldByValue || defaultSoldBy).trim(),
              branch: String(branchValue || 'Main Branch').trim(),
              date: String(dateValue || today).trim(),
              customer: customerValue ? String(customerValue).trim() : undefined
            }
          })

          setUploadedItems(processedItems)
          localStorage.setItem('uploaded_sales_items', JSON.stringify(processedItems))
          setIsUploading(false)
        } catch (error) {
          console.error('Error processing Excel file:', error)
          setUploadError('Error processing Excel file. Please check the format.')
          setIsUploading(false)
          setTimeout(() => setUploadError(''), 3000)
        }
      }

      reader.onerror = () => {
        setUploadError('Error reading file. Please try again.')
        setIsUploading(false)
        setTimeout(() => setUploadError(''), 3000)
      }

      reader.readAsBinaryString(file)
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError('Failed to upload file. Please try again.')
      setIsUploading(false)
      setTimeout(() => setUploadError(''), 3000)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const clearUploadedItems = () => {
    setUploadedItems([])
    localStorage.removeItem('uploaded_sales_items')
  }

  const handlePaymentRequest = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const paymentRequest = {
        id: Date.now(),
        amount: parseFloat(paymentAmount),
        note: paymentNote,
        requestedBy: currentUser.username || 'Sales User',
        date: new Date().toISOString(),
        status: 'pending',
        totalItems: uploadedItems.length,
        totalSales: totalAmount
      }

      // Save to localStorage (can be sent to backend later)
      const existingRequests = JSON.parse(localStorage.getItem('payment_requests') || '[]')
      existingRequests.push(paymentRequest)
      localStorage.setItem('payment_requests', JSON.stringify(existingRequests))

      setPaymentSuccess(true)
      setTimeout(() => {
        setPaymentSuccess(false)
        setShowPaymentRequestModal(false)
        setPaymentAmount('')
        setPaymentNote('')
      }, 2000)
    } catch (error) {
      console.error('Error submitting payment request:', error)
      alert('Failed to submit payment request')
    }
  }

  // Group items by customer
  const groupedByCustomer = uploadedItems.reduce((acc, item) => {
    const customerName = item.customer || 'Unknown Customer'
    if (!acc[customerName]) {
      acc[customerName] = []
    }
    acc[customerName].push(item)
    return acc
  }, {} as Record<string, UploadedItem[]>)

  // Convert to CustomerGroup array
  const customerGroups: CustomerGroup[] = Object.entries(groupedByCustomer).map(([customerName, items]) => ({
    customerName,
    items,
    totalAmount: items.reduce((sum, item) => sum + item.total, 0),
    totalItems: items.length
  }))

  // Group uploaded items by category
  const groupedItems = uploadedItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, UploadedItem[]>)

  const totalAmount = uploadedItems.reduce((sum, item) => sum + item.total, 0)

  const categories = ['All', ...new Set(items.map(item => item.category))]

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    return matchesSearch && matchesCategory && item.stock > 0
  })

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={28} color="#667eea" />
            <h1 style={{ margin: 0, fontSize: '24px', color: '#1f2937', fontWeight: 700 }}>Shop</h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {uploadedItems.length > 0 && (
              <button
                onClick={clearUploadedItems}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                }}
              >
                <X size={20} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Search and Categories */}
        <div style={{ position: 'relative', marginBottom: '15px' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px', alignItems: 'center' }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                background: selectedCategory === category ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white',
                color: selectedCategory === category ? 'white' : '#6b7280',
                border: selectedCategory === category ? 'none' : '2px solid #e5e7eb',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {category}
            </button>
          ))}
          
          {/* Request Payment Button */}
          {uploadedItems.length > 0 && (
            <>
              <button
                onClick={() => router.push('/sales/payment-requests')}
                style={{
                  background: 'white',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginLeft: 'auto',
                  marginRight: '8px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3f4f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white'
                }}
              >
                <List size={14} />
                View Requests
              </button>
              <button
                onClick={() => {
                  setSelectedItem(null)
                  setPaymentAmount(totalAmount.toString())
                  setShowPaymentRequestModal(true)
                }}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}
              >
                <Send size={14} />
                Request Payment
              </button>
            </>
          )}
        </div>


      </div>

      {/* Items Content */}
      <div style={{ padding: '20px' }}>
          {/* Upload Error Message */}
          {uploadError && (
            <div style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              fontWeight: 600
            }}>
              <AlertCircle size={20} />
              {uploadError}
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />

          {uploadedItems.length > 0 ? (
            <>
              {/* Summary Card */}
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '20px',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    padding: '12px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <FileSpreadsheet size={28} color="white" />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: 'white' }}>
                      Sales Summary
                    </h2>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)' }}>
                      {uploadedItems.length} items uploaded
                    </p>
                  </div>
                </div>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '16px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}>
                  <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }}>
                    Total Amount
                  </p>
                  <p style={{ margin: 0, fontSize: '32px', fontWeight: 800, color: 'white' }}>
                    {totalAmount.toLocaleString()} ብር
                  </p>
                </div>

                {/* Request Payment Button */}
                <button
                  onClick={() => setShowPaymentRequestModal(true)}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '2px solid rgba(255, 255, 255, 0.4)',
                    borderRadius: '12px',
                    padding: '14px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.2s',
                    backdropFilter: 'blur(10px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <Send size={20} />
                  Request Payment
                </button>
              </div>

              {/* Customer Cards */}
              <div>
                <h3 style={{margin: '0 0 16px 0', fontSize: '18px', fontWeight: 700, color: 'white'}}>
                  Customers ({customerGroups.length})
                </h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  {customerGroups.map((group) => (
                    <div
                      key={group.customerName}
                      onClick={() => {
                        setSelectedCustomer(group)
                        setShowCustomerModal(true)
                      }}
                      style={{background: 'white',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        border: '1px solid #f3f4f6',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'}}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'
                      }}
                    >
                      <div style={{display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px'}}>
                        <div style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '12px',
                          padding: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0}}>
                          <User size={24} color="white" />
                        </div>
                        <div style={{flex: 1, minWidth: 0}}>
                          <h3 style={{margin: 0, fontSize: '18px', fontWeight: 700, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                            {group.customerName}
                          </h3>
                          <p style={{margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280'}}>
                            {group.totalItems} item{group.totalItems !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          borderRadius: '10px',
                          padding: '8px 12px',
                          textAlign: 'right',
                          flexShrink: 0}}>
                          <p style={{margin: 0, fontSize: '15px', fontWeight: 800, color: 'white'}}>
                            {group.totalAmount.toLocaleString()} ብር
                          </p>
                        </div>
                      </div>
                      <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                        <div style={{background: '#f3f4f6',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          color: '#6b7280',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'}}>
                          <Package size={12} />
                          {group.items.reduce((s, i) => s + i.quantity, 0)} units
                        </div>
                        {group.items[group.items.length - 1]?.date && (
                          <div style={{background: '#f3f4f6',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            color: '#6b7280',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'}}>
                            <Calendar size={12} />
                            {group.items[group.items.length - 1].date}
                          </div>
                        )}
                        <div style={{background: '#ede9fe',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          color: '#7c3aed',
                          fontWeight: 600}}>
                          Tap to view details
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '24px',
                padding: '40px',
                backdropFilter: 'blur(10px)',
                border: '2px dashed rgba(255, 255, 255, 0.3)',
                marginBottom: '24px'
              }}>
                <FileSpreadsheet size={80} color="white" style={{ opacity: 0.6, marginBottom: '20px' }} />
                <p style={{ fontSize: '20px', fontWeight: 700, color: 'white', margin: '0 0 8px 0' }}>
                  No items uploaded
                </p>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                  Upload an Excel file to view sales
                </p>
              </div>

              {/* Upload Button - Centered */}
              <button
                onClick={handleUploadClick}
                disabled={isUploading}
                style={{
                  background: isUploading 
                    ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  padding: '18px 36px',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '16px',
                  fontWeight: 700,
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
                  transform: isUploading ? 'scale(0.95)' : 'scale(1)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Upload size={24} />
                {isUploading ? 'Uploading...' : 'Upload Sales Excel'}
              </button>

              <p style={{ 
                fontSize: '13px', 
                color: 'rgba(255, 255, 255, 0.7)', 
                marginTop: '16px',
                maxWidth: '280px'
              }}>
                Supported formats: .xlsx, .xls
              </p>
            </div>
          )}
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerModal && selectedCustomer && (
        <div
          onClick={() => setShowCustomerModal(false)}
          style={{position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'}}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{background: 'white',
              borderRadius: '20px',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'}}
          >
            {/* Modal Header */}
            <div style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px',
              borderRadius: '20px 20px 0 0',
              position: 'relative'}}>
              <button
                onClick={() => setShowCustomerModal(false)}
                style={{position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'}}
              >
                <X size={20} color="white" />
              </button>
              <div style={{display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px'}}>
                <div style={{background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  backdropFilter: 'blur(10px)'}}>
                  <User size={28} color="white" />
                </div>
                <div>
                  <h2 style={{margin: 0, fontSize: '22px', fontWeight: 800, color: 'white'}}>
                    {selectedCustomer.customerName}
                  </h2>
                  <p style={{margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.9)'}}>
                    {selectedCustomer.totalItems} item{selectedCustomer.totalItems !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div style={{background: 'rgba(255,255,255,0.15)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid rgba(255,255,255,0.2)'}}>
                <p style={{margin: '0 0 6px 0', fontSize: '13px', color: 'rgba(255,255,255,0.9)'}}>Total Amount</p>
                <p style={{margin: 0, fontSize: '32px', fontWeight: 900, color: 'white'}}>
                  {selectedCustomer.totalAmount.toLocaleString()} ብር
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{padding: '20px'}}>
              <h3 style={{margin: '0 0 14px 0', fontSize: '16px', fontWeight: 700, color: '#1f2937'}}>
                Items
              </h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px'}}>
                {selectedCustomer.items.map((item) => (
                  <div
                    key={item.id}
                    style={{background: '#f9fafb',
                      borderRadius: '12px',
                      padding: '14px',
                      border: '1px solid #e5e7eb'}}
                  >
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '10px'}}>
                      <div style={{flex: 1, minWidth: 0}}>
                        <p style={{margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#1f2937'}}>
                          {item.name}
                        </p>
                        <p style={{margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280'}}>
                          {item.category}
                        </p>
                        <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap'}}>
                          <span style={{background: '#e0e7ff', color: '#4338ca', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: 600}}>
                            Qty: {item.quantity}
                          </span>
                          <span style={{background: '#f0fdf4', color: '#166534', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: 600}}>
                            {item.price.toLocaleString()} ብር/unit
                          </span>
                          <span style={{background: '#fef3c7', color: '#92400e', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', fontWeight: 600}}>
                            {item.date}
                          </span>
                        </div>
                      </div>
                      <div style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        textAlign: 'center',
                        flexShrink: 0}}>
                        <p style={{margin: 0, fontSize: '13px', fontWeight: 800, color: 'white'}}>
                          {item.total.toLocaleString()} ብር
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment & Credit buttons */}
              <div style={{display: 'flex', gap: '10px'}}>
                <button
                  onClick={() => {
                    setSelectedItem(selectedCustomer.items[0] || null)
                    setPaymentAmount(selectedCustomer.totalAmount.toString())
                    setShowCustomerModal(false)
                    setShowPaymentRequestModal(true)
                  }}
                  style={{flex: 1,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.2s'}}
                >
                  <DollarSign size={18} />
                  Payment
                </button>
                <button
                  onClick={() => {
                    setSelectedItem(selectedCustomer.items[0] || null)
                    setPaymentAmount(selectedCustomer.totalAmount.toString())
                    setShowCustomerModal(false)
                    setShowPaymentRequestModal(true)
                  }}
                  style={{flex: 1,
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.2s'}}
                >
                  <Receipt size={18} />
                  Credit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
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
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              animation: 'slideUp 0.3s ease'
            }}
          >
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px',
              borderRadius: '20px 20px 0 0',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <X size={20} color="white" />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <ShoppingBag size={32} color="white" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'white' }}>
                    {selectedItem.name}
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
                    {selectedItem.category}
                  </p>
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '16px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '8px' }}>
                  Total Amount
                </p>
                <p style={{ margin: 0, fontSize: '36px', fontWeight: 900, color: 'white' }}>
                  {selectedItem.total.toLocaleString()} ብር
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
                Sale Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Quantity */}
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Package size={18} color="white" />
                    </div>
                    <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>
                      Quantity
                    </span>
                  </div>
                  <p style={{ margin: '0 0 0 44px', fontSize: '20px', fontWeight: 800, color: '#1f2937' }}>
                    {selectedItem.quantity} units
                  </p>
                </div>

                {/* Selling Price */}
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Receipt size={18} color="white" />
                    </div>
                    <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>
                      Selling Price (per unit)
                    </span>
                  </div>
                  <p style={{ margin: '0 0 0 44px', fontSize: '20px', fontWeight: 800, color: '#1f2937' }}>
                    {selectedItem.price.toLocaleString()} ብር
                  </p>
                </div>

                {/* Sold By */}
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <User size={18} color="white" />
                    </div>
                    <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>
                      Sold By
                    </span>
                  </div>
                  <p style={{ margin: '0 0 0 44px', fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
                    {selectedItem.soldBy}
                  </p>
                </div>

                {/* Branch */}
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <MapPin size={18} color="white" />
                    </div>
                    <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>
                      Branch
                    </span>
                  </div>
                  <p style={{ margin: '0 0 0 44px', fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
                    {selectedItem.branch}
                  </p>
                </div>

                {/* Date */}
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '12px',
                  padding: '16px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{
                      background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Calendar size={18} color="white" />
                    </div>
                    <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>
                      Sale Date
                    </span>
                  </div>
                  <p style={{ margin: '0 0 0 44px', fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
                    {selectedItem.date}
                  </p>
                </div>
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

      {/* Payment Request Modal */}
      {showPaymentRequestModal && (
        <div
          onClick={() => setShowPaymentRequestModal(false)}
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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              padding: '24px',
              borderRadius: '20px 20px 0 0',
              position: 'relative'
            }}>
              <button
                onClick={() => setShowPaymentRequestModal(false)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                }}
              >
                <X size={20} color="white" />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  padding: '12px',
                  backdropFilter: 'blur(10px)'
                }}>
                  <Send size={32} color="white" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'white' }}>
                    Payment Request
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255, 255, 255, 0.9)' }}>
                    {selectedItem ? selectedItem.name : 'Request payment for sales'}
                  </p>
                </div>
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                padding: '16px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                {selectedItem && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '4px' }}>
                          Item Details
                        </p>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'white' }}>
                          {selectedItem.name}
                        </p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)' }}>
                          {selectedItem.category} • Qty: {selectedItem.quantity}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '4px' }}>
                          Sold By
                        </p>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'white' }}>
                          {selectedItem.soldBy}
                        </p>
                      </div>
                    </div>
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '12px',
                      marginTop: '12px'
                    }}>
                      <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '6px' }}>
                        Sale Amount
                      </p>
                      <p style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'white' }}>
                        {selectedItem.total.toLocaleString()} ብር
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              {paymentSuccess ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px'
                }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#d1fae5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px'
                  }}>
                    <Check size={40} color="#059669" />
                  </div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>
                    Request Submitted!
                  </h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                    Your payment request has been sent for approval
                  </p>
                </div>
              ) : (
                <>
                  <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 700, color: '#1f2937' }}>
                    Request Details
                  </h3>

                  {/* Payment Amount */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#374151'
                    }}>
                      Payment Amount (ብር) *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <DollarSign size={20} style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#9ca3af'
                      }} />
                      <input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="Enter amount"
                        style={{
                          width: '100%',
                          padding: '12px 12px 12px 44px',
                          border: '2px solid #e5e7eb',
                          borderRadius: '10px',
                          fontSize: '16px',
                          fontWeight: 600,
                          outline: 'none',
                          transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#10b981'
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#e5e7eb'
                        }}
                      />
                    </div>
                    <p style={{
                      margin: '6px 0 0 0',
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      Suggested: {totalAmount.toLocaleString()} ብር (total sales)
                    </p>
                  </div>

                  {/* Payment Note */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#374151'
                    }}>
                      Note (Optional)
                    </label>
                    <textarea
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                      placeholder="Add any additional information..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '10px',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'none',
                        fontFamily: 'inherit',
                        transition: 'border-color 0.2s'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#10b981'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb'
                      }}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handlePaymentRequest}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px',
                      fontSize: '16px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    <Send size={20} />
                    Submit Payment Request
                  </button>

                  <p style={{
                    margin: '16px 0 0 0',
                    fontSize: '12px',
                    color: '#6b7280',
                    textAlign: 'center'
                  }}>
                    This request will be sent to admin for approval
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </div>
  )
}
