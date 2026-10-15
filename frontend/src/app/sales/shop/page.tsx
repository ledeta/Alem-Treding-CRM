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
  const [selectedBank, setSelectedBank] = useState('CBE')
  const [paymentReference, setPaymentReference] = useState('')
  const [additionalPayment, setAdditionalPayment] = useState('')
  const [additionalBanks, setAdditionalBanks] = useState<Array<{bank: string, amount: string, reason: string}>>([])
  const [paymentNotes, setPaymentNotes] = useState('')
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [showCreditModal, setShowCreditModal] = useState(false)
  const [creditAmount, setCreditAmount] = useState('')
  const [creditReason, setCreditReason] = useState('')
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
        customerName: selectedCustomer?.customerName || 'Unknown',
        amount: paymentAmount,
        bank: selectedBank,
        reason: paymentReference,
        notes: paymentNotes,
        additional: additionalPayment,
        status: 'Pending',
        approvalStatus: 'pending',
        date: new Date().toISOString(),
        requestedBy: currentUser.username || 'Sales User',
        totalItems: selectedCustomer?.totalItems || 0,
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
          customerName: selectedCustomer?.customerName || 'Unknown',
          amount: bankPayment.amount,
          bank: bankPayment.bank,
          reason: bankPayment.reason,
          notes: paymentNotes,
          additional: '',
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

      let bankDetails = `🏦 ${selectedBank}: ${parseFloat(paymentAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      if (additionalBanks.length > 0) {
        additionalBanks.forEach(b => {
          bankDetails += `\n🏦 ${b.bank}: ${parseFloat(b.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        })
      }

      alert(`✅ Payment Submitted!\n\n👤 Customer: ${selectedCustomer?.customerName || 'Unknown'}\n💰 Total: ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n\n${bankDetails}\n\n⏳ ${transactions.length} payment(s) pending admin approval!`)

      setShowPaymentRequestModal(false)
      setPaymentAmount('')
      setSelectedBank('CBE')
      setPaymentReference('')
      setAdditionalPayment('')
      setAdditionalBanks([])
      setPaymentNotes('')
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
                    setCreditAmount(selectedCustomer.totalAmount.toString())
                    setShowCustomerModal(false)
                    setShowCreditModal(true)
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
        <div style={{position: 'fixed',
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
          padding: '1rem',}}>
          <div style={{background: 'white',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',}}>
            <div style={{background: 'linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)',
              padding: '2rem 2rem 1.5rem 2rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              zIndex: 10,}}>
              <div>
                <h2 style={{fontSize: '1.5rem',
                  fontWeight: '900',
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.01em',}}>
                  Payment Confirmation
                </h2>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem'}}>
                  <p style={{fontSize: '0.85rem',
                    color: '#64748b',
                    margin: 0,
                    fontWeight: '600',}}>
                    {selectedCustomer?.customerName}
                  </p>
                  {paymentAmount && (
                    <span style={{fontSize: '0.9rem',
                      fontWeight: '800',
                      color: '#2563eb',
                      background: '#dbeafe',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '6px',}}>
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
                onClick={() => {
                  setShowPaymentRequestModal(false)
                  setPaymentAmount('')
                  setSelectedBank('CBE')
                  setPaymentReference('')
                  setAdditionalPayment('')
                  setAdditionalBanks([])
                  setPaymentNotes('')
                }}
                style={{background: '#f1f5f9',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  color: '#64748b',}}
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

            <div style={{flex: 1, overflowY: 'auto', padding: '2rem'}}>
              <div style={{display: 'grid', gap: '1.5rem'}}>
                <div>
                  <label style={{fontSize: '0.85rem',
                    fontWeight: '700',
                    color: '#64748b',
                    display: 'block',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',}}>
                    Amount (ብር)
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount"
                    style={{width: '100%',
                      padding: '0.85rem 1rem',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      background: '#f8fafc',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                      fontWeight: '600',
                      boxSizing: 'border-box',}}
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
                  <label style={{fontSize: '0.85rem',
                    fontWeight: '700',
                    color: '#64748b',
                    display: 'block',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',}}>
                    Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    style={{width: '100%',
                      padding: '0.85rem 1rem',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      background: '#f8fafc',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                      fontWeight: '600',
                      boxSizing: 'border-box',}}
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
                  <label style={{fontSize: '0.85rem',
                    fontWeight: '700',
                    color: '#64748b',
                    display: 'block',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',}}>
                    Transaction ID *
                  </label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Enter transaction ID (required)"
                    style={{width: '100%',
                      padding: '0.85rem 1rem',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      background: '#f8fafc',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                      fontWeight: '600',
                      boxSizing: 'border-box',}}
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
                  <div key={index} style={{padding: '1.5rem',
                    background: '#f8fafc',
                    borderRadius: '12px',
                    border: '2px dashed #cbd5e1',
                    marginTop: '1rem'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                      <h3 style={{fontSize: '0.85rem',
                        fontWeight: '800',
                        color: '#475569',
                        margin: 0,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',}}>
                        Bank Payment #{index + 2}
                      </h3>
                      <button
                        onClick={() => {
                          setAdditionalBanks(additionalBanks.filter((_, i) => i !== index))
                        }}
                        style={{background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          padding: '0.4rem 0.8rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',}}
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

                    <div style={{display: 'grid', gap: '1rem'}}>
                      <div>
                        <label style={{fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#64748b',
                          display: 'block',
                          marginBottom: '0.5rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',}}>
                          Bank
                        </label>
                        <select
                          value={bankPayment.bank}
                          onChange={(e) => {
                            const updated = [...additionalBanks]
                            updated[index].bank = e.target.value
                            setAdditionalBanks(updated)
                          }}
                          style={{width: '100%',
                            padding: '0.75rem 0.85rem',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem',
                            background: 'white',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            boxSizing: 'border-box',}}
                        >
                          {['CBE', 'NBE', 'Dashen', 'Awash', 'Abyssinia', 'BOA', 'Hibret', 'Addis', 'Berhan', 'Oromia', 'Wegagen', 'Walia', 'Telebirr', 'Cash', 'M-pesa'].map(bank => (
                            <option key={bank} value={bank}>{bank}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#64748b',
                          display: 'block',
                          marginBottom: '0.5rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',}}>
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
                          style={{width: '100%',
                            padding: '0.75rem 0.85rem',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem',
                            background: 'white',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            boxSizing: 'border-box',}}
                        />
                      </div>

                      <div>
                        <label style={{fontSize: '0.75rem',
                          fontWeight: '700',
                          color: '#64748b',
                          display: 'block',
                          marginBottom: '0.5rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',}}>
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
                          style={{width: '100%',
                            padding: '0.75rem 0.85rem',
                            border: '1.5px solid #e2e8f0',
                            borderRadius: '10px',
                            fontSize: '0.9rem',
                            background: 'white',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            fontFamily: 'inherit',
                            fontWeight: '600',
                            boxSizing: 'border-box',}}
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
                  style={{width: '100%',
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
                    marginTop: '0.5rem',}}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <span style={{fontSize: '1.1rem'}}>+</span>
                  Add Bank
                </button>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div>
                    <label style={{fontSize: '0.75rem',
                      fontWeight: '700',
                      color: '#64748b',
                      display: 'block',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',}}>
                      Additional Amount
                    </label>
                    <input
                      type="number"
                      value={additionalPayment}
                      onChange={(e) => setAdditionalPayment(e.target.value)}
                      placeholder="0.00"
                      style={{width: '100%',
                        padding: '0.65rem 0.85rem',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        background: '#f8fafc',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit',
                        fontWeight: '600',
                        boxSizing: 'border-box',}}
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
                    <label style={{fontSize: '0.75rem',
                      fontWeight: '700',
                      color: '#64748b',
                      display: 'block',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',}}>
                      Transaction ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Additional transaction ID (optional)"
                      style={{width: '100%',
                        padding: '0.65rem 0.85rem',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        background: '#f8fafc',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        fontFamily: 'inherit',
                        fontWeight: '600',
                        boxSizing: 'border-box',}}
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

                {/* Payment Notes/Reason */}
                <div>
                  <label style={{fontSize: '0.85rem',
                    fontWeight: '700',
                    color: '#64748b',
                    display: 'block',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',}}>
                    Payment Notes/Reason
                  </label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Enter any additional notes, payment reason, or remarks"
                    rows={4}
                    style={{width: '100%',
                      padding: '0.85rem 1rem',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      background: '#f8fafc',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      boxSizing: 'border-box',}}
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

                {/* Total Amount Summary Card */}
                <div style={{padding: '1.5rem',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  borderRadius: '12px',
                  border: '1px solid #93c5fd',
                  textAlign: 'center',}}>
                  <p style={{fontSize: '0.75rem',
                    fontWeight: '800',
                    color: '#1e40af',
                    margin: '0 0 0.75rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',}}>
                    Total Amount
                  </p>
                  <p style={{fontSize: '1.75rem',
                    fontWeight: '900',
                    color: '#2563eb',
                    margin: 0,}}>
                    {(() => {
                      const mainAmount = parseFloat(paymentAmount) || 0
                      const additionalBankTotal = additionalBanks.reduce((sum, bank) => sum + (parseFloat(bank.amount) || 0), 0)
                      const total = mainAmount + additionalBankTotal
                      return total.toLocaleString('en-US', { minimumFractionDigits: 2 })
                    })()}
                  </p>
                  {additionalBanks.length > 0 && (
                    <div style={{marginTop: '0.75rem', fontSize: '0.75rem', color: '#475569'}}>
                      <p style={{margin: '0.25rem 0', fontWeight: '600'}}>
                        {selectedBank}: {parseFloat(paymentAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      {additionalBanks.map((bank, idx) => (
                        <p key={idx} style={{margin: '0.25rem 0', fontWeight: '600'}}>
                          {bank.bank}: {parseFloat(bank.amount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{padding: '2rem',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',}}>
              <button
                onClick={() => {
                  setShowPaymentRequestModal(false)
                  setPaymentAmount('')
                  setSelectedBank('CBE')
                  setPaymentReference('')
                  setAdditionalPayment('')
                  setAdditionalBanks([])
                  setPaymentNotes('')
                }}
                style={{padding: '1rem 1.5rem',
                  background: '#f1f5f9',
                  color: '#64748b',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',}}
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
                disabled={!paymentAmount || !paymentReference.trim() || additionalBanks.some(bank => !bank.reason || !bank.reason.trim())}
                style={{padding: '1rem 1.5rem',
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
                  opacity: (!paymentAmount || !paymentReference.trim() || additionalBanks.some(bank => !bank.reason || !bank.reason.trim()))
                    ? 0.6
                    : 1,}}
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

      {/* Credit Modal - Simple version for credit (no payment received) */}
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
            {/* Modal Header */}
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
                  {selectedCustomer.customerName}
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

            {/* Modal Body */}
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
                    Credit Amount (ብር) *
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
                    Reason / Note *
                  </label>
                  <textarea
                    value={creditReason}
                    onChange={(e) => setCreditReason(e.target.value)}
                    placeholder="Why is this credit being given?"
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

            {/* Modal Footer */}
            <div style={{
              padding: '2rem',
              borderTop: '1px solid #e2e8f0',
              background: '#f8fafc',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1.5rem',
            }}>
              <button
                onClick={() => {
                  setShowCreditModal(false)
                  setCreditAmount('')
                  setCreditReason('')
                }}
                style={{
                  padding: '1rem',
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
                  if (!creditAmount || !creditReason.trim()) {
                    alert('⚠️ Please enter credit amount and reason')
                    return
                  }
                  alert(`✅ Credit Request Submitted!\n\n👤 Customer: ${selectedCustomer.customerName}\n💰 Amount: ${parseFloat(creditAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር\n📝 Reason: ${creditReason}\n\n⏳ Request pending admin approval!`)
                  setShowCreditModal(false)
                  setCreditAmount('')
                  setCreditReason('')
                }}
                disabled={!creditAmount || !creditReason.trim()}
                style={{
                  padding: '1rem',
                  background: (!creditAmount || !creditReason.trim())
                    ? '#94a3b8'
                    : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '0.9rem',
                  cursor: (!creditAmount || !creditReason.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  opacity: (!creditAmount || !creditReason.trim()) ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!creditAmount || !creditReason.trim()) return
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(37, 99, 235, 0.35)'
                }}
                onMouseLeave={(e) => {
                  if (!creditAmount || !creditReason.trim()) return
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Submit Credit Request
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </div>
  )
}
