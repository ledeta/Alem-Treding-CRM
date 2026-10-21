'use client'

import { useState, useEffect, useRef } from 'react'
import { ShoppingBag, Search, Plus, Minus, X, Receipt, Upload, FileSpreadsheet, Package, Check, AlertCircle, Calendar, User, MapPin, Info, Send, DollarSign, List, Users } from 'lucide-react'
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
  uniqueKey?: string
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
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)
  const [rejectedRequestsCount, setRejectedRequestsCount] = useState(0)
  const [rejectedRequests, setRejectedRequests] = useState<any[]>([])
  const [selectedRejectedRequest, setSelectedRejectedRequest] = useState<any | null>(null)
  const [showRejectedRequestModal, setShowRejectedRequestModal] = useState(false)
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
    
    // Load request counts
    loadRequestCounts()
    
    // Poll for request changes every 3 seconds
    const pollInterval = setInterval(loadRequestCounts, 3000)
    
    // Listen for events
    window.addEventListener('shopPaymentRejected', loadRequestCounts)
    window.addEventListener('shopRequestCreated', loadRequestCounts)
    
    return () => {
      clearInterval(pollInterval)
      window.removeEventListener('shopPaymentRejected', loadRequestCounts)
      window.removeEventListener('shopRequestCreated', loadRequestCounts)
    }
  }, [])
  
  const loadRequestCounts = () => {
    try {
      const stored = localStorage.getItem('shop_payment_requests')
      if (stored) {
        const all = JSON.parse(stored)
        const pending = all.filter((r: any) => r.approvalStatus === 'pending').length
        const rejected = all
          .filter((r: any) => r.approvalStatus === 'rejected')
          .map((r: any) => ({
            ...r,
            customer: r.customerData || r.customer // Use customerData if available
          }))
        setPendingRequestsCount(pending)
        setRejectedRequestsCount(rejected.length)
        setRejectedRequests(rejected)
        console.log(`📊 Shop requests: ${pending} pending, ${rejected.length} rejected`)
      } else {
        setPendingRequestsCount(0)
        setRejectedRequestsCount(0)
        setRejectedRequests([])
      }
    } catch (e) {
      console.error('Error loading request counts:', e)
    }
  }

  const loadTransactions = () => {
    // Removed - transactions functionality no longer needed
  }

  const openShopRequestsModal = () => {
    router.push('/sales/shop-requests')
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
          const processedItems: UploadedItem[] = []
          const invalidItems: string[] = [] // Track items without "SH" prefix

          for (let index = 0; index < jsonData.length; index++) {
            const row = jsonData[index]
            
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
            
            let itemName = String(nameValue || 'Unnamed Item').trim()
            
            // 🔴 CRITICAL VALIDATION: Check for "SH" prefix
            const hasSHPrefix = itemName.toUpperCase().startsWith('SH ')
            
            if (!hasSHPrefix) {
              // Item does NOT have "SH" prefix - this is invalid for shop
              invalidItems.push(itemName)
            }
            
            // Remove "SH" prefix for display (if it exists)
            if (hasSHPrefix) {
              itemName = itemName.substring(3).trim() // Remove "SH " (3 characters)
            }
            
            processedItems.push({
              id: Date.now() + index,
              name: itemName,
              category: String(categoryValue || 'General').trim(),
              quantity: quantity,
              price: price,
              total: total,
              soldBy: String(soldByValue || defaultSoldBy).trim(),
              branch: String(branchValue || 'Main Branch').trim(),
              date: String(dateValue || today).trim(),
              customer: customerValue ? String(customerValue).trim() : undefined
            })
          }

          // 🔴 CRITICAL VALIDATION: If ANY item is missing "SH" prefix, reject the file
          if (invalidItems.length > 0) {
            console.error('❌ Shop Validation Failed: Items without SH prefix:', invalidItems)
            setUploadError('⚠️ This Items are not a Shop Items')
            setIsUploading(false)
            setTimeout(() => setUploadError(''), 5000)
            
            // Reset file input
            if (fileInputRef.current) {
              fileInputRef.current.value = ''
            }
            return
          }

          // ✅ All items have "SH" prefix - accept the file
          console.log('✅ Shop Validation Passed: All items have SH prefix')
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
        source: 'shop', // Mark as shop source
        requestedBy: currentUser.username || 'Sales User',
        totalItems: selectedCustomer?.totalItems || 0,
        isMultiBankPayment: additionalBanks.length > 0,
        totalPaymentAmount: grandTotal.toString(),
        bankNumber: 1,
        totalBanks: 1 + additionalBanks.length,
        items: selectedCustomer?.items || [], // Store items for viewing
        itemsData: selectedCustomer?.items || [], // Store full items data
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
          source: 'shop', // Mark as shop source
          requestedBy: currentUser.username || 'Sales User',
          isMultiBankPayment: true,
          totalPaymentAmount: grandTotal.toString(),
          bankNumber: index + 2,
          totalBanks: 1 + additionalBanks.length,
          items: selectedCustomer?.items || [], // Store items for viewing
          itemsData: selectedCustomer?.items || [], // Store full items data
        })
      })

      const existing = JSON.parse(localStorage.getItem('confirmed_transactions') || '[]')
      localStorage.setItem('confirmed_transactions', JSON.stringify([...existing, ...transactions]))

      // ALSO save to shop-specific storage
      const shopRequests = JSON.parse(localStorage.getItem('shop_payment_requests') || '[]')
      
      // Remove any rejected request for this customer before adding new request
      const filteredShopRequests = shopRequests.filter((req: any) => 
        !(req.customerName === selectedCustomer?.customerName && req.approvalStatus === 'rejected')
      )
      
      localStorage.setItem('shop_payment_requests', JSON.stringify([...filteredShopRequests, ...transactions]))
      
      // Debug: Log items count
      console.log('✅ Saved shop request with items:', {
        customer: selectedCustomer?.customerName,
        itemsCount: selectedCustomer?.items?.length || 0,
        items: selectedCustomer?.items
      })
      
      // Dispatch event for admin payments page
      window.dispatchEvent(new CustomEvent('shopRequestCreated'))

      let bankDetails = `🏦 ${selectedBank}: ${parseFloat(paymentAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
      if (additionalBanks.length > 0) {
        additionalBanks.forEach(b => {
          bankDetails += `\n🏦 ${b.bank}: ${parseFloat(b.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
        })
      }

      alert(`✅ Payment Submitted!\n\n👤 Customer: ${selectedCustomer?.customerName || 'Unknown'}\n💰 Total: ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}\n\n${bankDetails}\n\n⏳ ${transactions.length} payment(s) pending admin approval!`)

      // Remove this customer's items from the list
      const updatedItems = uploadedItems.filter(item => 
        (item.customer || 'Unknown Customer') !== selectedCustomer?.customerName
      )
      setUploadedItems(updatedItems)
      localStorage.setItem('uploaded_sales_items', JSON.stringify(updatedItems))

      // Close modals
      setShowPaymentRequestModal(false)
      setShowCustomerModal(false)
      setSelectedCustomer(null)
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
  // BUT: Don't group empty names or "NA" - show them individually
  const groupedByCustomer = uploadedItems.reduce((acc, item, index) => {
    const customerName = item.customer || ''
    const trimmedName = customerName.trim().toUpperCase()
    
    // Check if customer name is empty, "NA", or similar
    const isEmptyOrNA = !customerName || 
                        trimmedName === '' || 
                        trimmedName === 'NA' || 
                        trimmedName === 'N/A' ||
                        trimmedName === 'UNKNOWN' ||
                        trimmedName === 'UNKNOWN CUSTOMER'
    
    // If empty or NA, create unique key using index to prevent grouping
    const groupKey = isEmptyOrNA ? `__empty_${index}__` : customerName
    
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(item)
    return acc
  }, {} as Record<string, UploadedItem[]>)

  // Convert to CustomerGroup array
  const customerGroups: CustomerGroup[] = Object.entries(groupedByCustomer).map(([groupKey, items], index) => {
    // For empty/NA customers, use the first item's customer name or 'Unknown Customer'
    const displayName = groupKey.startsWith('__empty_') 
      ? (items[0].customer?.trim() || 'Unknown Customer')
      : groupKey
    
    return {
      customerName: displayName,
      uniqueKey: groupKey, // Use the original groupKey as unique identifier
      items,
      totalAmount: items.reduce((sum, item) => sum + item.total, 0),
      totalItems: items.length
    }
  })

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
      background: '#f0f2f5',
      paddingBottom: '90px'
    }}>
      {/* Header */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '16px 20px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: '#eff6ff',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShoppingBag size={20} color="#2563eb" />
            </div>
            <h1 style={{ margin: 0, fontSize: '20px', color: '#0f172a', fontWeight: 700 }}>Shop</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {uploadedItems.length > 0 && (
              <button
                onClick={clearUploadedItems}
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fee2e2'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fef2f2'
                }}
              >
                <X size={18} />
              </button>
            )}
            {/* Show Upload button ONLY when list is empty */}
            {uploadedItems.length === 0 && (
              <button
                onClick={handleUploadClick}
                disabled={isUploading}
                style={{
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isUploading) e.currentTarget.style.background = '#1d4ed8'
                }}
                onMouseLeave={(e) => {
                  if (!isUploading) e.currentTarget.style.background = '#2563eb'
                }}
              >
                <FileSpreadsheet size={16} />
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            )}
            {uploadedItems.length > 0 && (
              <button
                onClick={openShopRequestsModal}
                style={{
                  background: 'white',
                  color: '#2563eb',
                  border: '1.5px solid #2563eb',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eff6ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white'
                }}
              >
                <List size={16} />
                Requests
                {(pendingRequestsCount > 0 || rejectedRequestsCount > 0) && (
                  <span style={{
                    background: rejectedRequestsCount > 0 ? '#ef4444' : '#fbbf24',
                    color: 'white',
                    borderRadius: '999px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    marginLeft: '4px'
                  }}>
                    {pendingRequestsCount + rejectedRequestsCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              border: '1.5px solid #e2e8f0',
              borderRadius: '10px',
              fontSize: '14px',
              outline: 'none',
              background: 'white',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#2563eb'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#e2e8f0'
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div style={{ padding: '20px' }}>
          {/* Upload Error Message */}
          {uploadError && (
            <div style={{
              background: '#fef2f2',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '14px',
              fontWeight: 600,
              borderLeft: '3px solid #dc2626'
            }}>
              <AlertCircle size={18} />
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

          {/* Rejected Requests Section - ALWAYS VISIBLE (Critical Priority) */}
          {rejectedRequests.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                marginBottom: '12px',
                padding: '8px 12px',
                background: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca'
              }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#dc2626' }}>
                  ⚠️ {rejectedRequests.length} Rejected Request{rejectedRequests.length !== 1 ? 's' : ''} - Needs Resubmission
                </span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {rejectedRequests.map((request: any) => (
                  <div
                    key={request.id}
                    onClick={() => {
                      setSelectedRejectedRequest(request)
                      setShowRejectedRequestModal(true)
                    }}
                    style={{
                      background: 'white',
                      borderRadius: '14px',
                      border: '2px solid #ef4444',
                      padding: '18px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.25)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.15)'
                    }}
                  >
                    {/* Rejected Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#ef4444',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      ❌ Rejected
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                        borderRadius: '10px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <User size={20} color="#dc2626" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: 700,
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {request.customerName || 'Unknown Customer'}
                        </h3>
                        <p style={{
                          margin: '4px 0 0 0',
                          fontSize: '13px',
                          color: '#dc2626',
                          fontWeight: 600
                        }}>
                          Click to view details and resubmit
                        </p>
                      </div>
                      <div style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        flexShrink: 0,
                        border: '1px solid #fecaca'
                      }}>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>
                          {parseFloat(request.amount || 0).toLocaleString()} ብር
                        </p>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{
                        background: '#fef2f2',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {request.type || 'Payment'}
                      </div>
                      {request.bank && (
                        <div style={{
                          background: '#f8fafc',
                          color: '#64748b',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}>
                          🏦 {request.bank}
                        </div>
                      )}
                      <div style={{
                        background: '#f8fafc',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '11px',
                        fontWeight: 500,
                        marginLeft: 'auto'
                      }}>
                        {new Date(request.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploadedItems.length > 0 ? (
            <>
              {/* Statistics Bar */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '24px'
              }}>
                {/* Total Revenue Card */}
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.05)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      background: '#ecfdf5',
                      borderRadius: '8px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <DollarSign size={16} color="#059669" />
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Total Revenue</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    {totalAmount.toLocaleString()} ብር
                  </p>
                </div>

                {/* Items Card */}
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.05)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      background: '#eff6ff',
                      borderRadius: '8px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Package size={16} color="#2563eb" />
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Items</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    {uploadedItems.length}
                  </p>
                </div>

                {/* Customers Card */}
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.05)',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <div style={{
                      background: '#f5f3ff',
                      borderRadius: '8px',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Users size={16} color="#7c3aed" />
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Customers</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    {customerGroups.length}
                  </p>
                </div>
              </div>

              {/* Section Header */}
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a', display: 'inline' }}>
                  Customers{' '}
                </h3>
                <span style={{
                  background: '#f1f5f9',
                  color: '#64748b',
                  borderRadius: '12px',
                  padding: '4px 10px',
                  fontSize: '13px',
                  fontWeight: 600
                }}>
                  ({customerGroups.length})
                </span>
              </div>

              {/* Customer Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {customerGroups.map((group) => (
                  <div
                    key={group.uniqueKey || group.customerName}
                    onClick={() => {
                      setSelectedCustomer(group)
                      setShowCustomerModal(true)
                    }}
                    style={{
                      background: 'white',
                      borderRadius: '14px',
                      border: '1px solid #e2e8f0',
                      padding: '18px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.08)'
                      e.currentTarget.style.borderColor = '#2563eb'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.05)'
                      e.currentTarget.style.borderColor = '#e2e8f0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        borderRadius: '10px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <User size={20} color="#2563eb" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          margin: 0,
                          fontSize: '16px',
                          fontWeight: 700,
                          color: '#0f172a',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {group.customerName}
                        </h3>
                      </div>
                      <div style={{
                        background: '#f0fdf4',
                        color: '#059669',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        flexShrink: 0
                      }}>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>
                          {group.totalAmount.toLocaleString()} ብር
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{
                        background: '#f8fafc',
                        color: '#64748b',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {group.items.reduce((s, i) => s + i.quantity, 0)} units
                      </div>
                      {group.items[group.items.length - 1]?.date && (
                        <div style={{
                          background: '#f8fafc',
                          color: '#64748b',
                          border: '1px solid #e2e8f0',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}>
                          {group.items[group.items.length - 1].date}
                        </div>
                      )}
                      <div style={{
                        color: '#2563eb',
                        fontSize: '12px',
                        fontWeight: 600,
                        marginLeft: 'auto'
                      }}>
                        View Details →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '500px',
              textAlign: 'center'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '20px',
                padding: '48px 32px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.05)',
                maxWidth: '400px'
              }}>
                <div style={{
                  background: '#eff6ff',
                  borderRadius: '50%',
                  width: '80px',
                  height: '80px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <FileSpreadsheet size={48} color="#2563eb" />
                </div>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>
                  Upload Sales Data
                </h2>
                <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748b' }}>
                  Import your Excel file to see customer sales
                </p>
                <button
                  onClick={handleUploadClick}
                  disabled={isUploading}
                  style={{
                    background: isUploading
                      ? '#94a3b8'
                      : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 32px',
                    fontSize: '16px',
                    fontWeight: 700,
                    cursor: isUploading ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: isUploading ? 'none' : '0 4px 12px rgba(37, 99, 235, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isUploading) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.4)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isUploading) {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)'
                    }
                  }}
                >
                  <Upload size={20} />
                  {isUploading ? 'Uploading...' : 'Upload Excel File'}
                </button>
                <p style={{ margin: '16px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>
                  .xlsx, .xls supported
                </p>
              </div>
            </div>
          )}
        </div>

      {/* Customer Modal */}
      {showCustomerModal && selectedCustomer && (
        <div
          onClick={() => setShowCustomerModal(false)}
          style={{position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.5)',
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
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              border: '1px solid rgba(0, 0, 0, 0.05)'}}
          >
            {/* Modal Header */}
            <div style={{background: '#f8fafc',
              padding: '24px',
              borderBottom: '1px solid #e2e8f0',
              position: 'relative'}}>
              <button
                onClick={() => setShowCustomerModal(false)}
                style={{position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: '10px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  transition: 'all 0.2s'}}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e2e8f0'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f1f5f9'
                }}
              >
                <X size={20} />
              </button>
              <div style={{display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px'}}>
                <div style={{background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  borderRadius: '10px',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'}}>
                  <User size={24} color="#2563eb" />
                </div>
                <div>
                  <h2 style={{margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a'}}>
                    {selectedCustomer.customerName}
                  </h2>
                  <p style={{margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: 600}}>
                    {selectedCustomer.totalItems} item{selectedCustomer.totalItems !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div style={{background: '#f0fdf4',
                borderRadius: '12px',
                padding: '14px',
                border: '1px solid #bbf7d0'}}>
                <p style={{margin: '0 0 6px 0', fontSize: '12px', color: '#059669', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'}}>Total Amount</p>
                <p style={{margin: 0, fontSize: '28px', fontWeight: 900, color: '#059669'}}>
                  {selectedCustomer.totalAmount.toLocaleString()} ብር
                </p>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{padding: '20px'}}>
              <h3 style={{margin: '0 0 14px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                Items List
              </h3>
              
              {/* Professional Items Table */}
              <div style={{ overflowX: 'auto', marginBottom: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>#</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Item Name</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Qty</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit Price</th>
                      <th style={{ padding: '12px', textAlign: 'right', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCustomer.items.map((item, index) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 12px', fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
                          {index + 1}
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <div>
                            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                              {item.name}
                            </p>
                            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                              {item.category}
                            </p>
                          </div>
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            background: '#eff6ff',
                            color: '#2563eb',
                            borderRadius: '6px',
                            padding: '4px 10px',
                            fontSize: '13px',
                            fontWeight: 700
                          }}>
                            {item.quantity}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'right', fontSize: '14px', fontWeight: 600, color: '#059669' }}>
                          {item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                        </td>
                        <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                          <span style={{
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            color: 'white',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '14px',
                            fontWeight: 800
                          }}>
                            {item.total.toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f0fdf4', borderTop: '2px solid #bbf7d0' }}>
                      <td colSpan={4} style={{ padding: '16px 12px', textAlign: 'right', fontSize: '15px', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Grand Total:
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'right', fontSize: '18px', fontWeight: 900, color: '#059669' }}>
                        {selectedCustomer.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                      </td>
                    </tr>
                  </tfoot>
                </table>
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
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'}}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(5, 150, 105, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
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
                    borderRadius: '10px',
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s'}}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
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

                  try {
                    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
                    
                    // Create credit transaction
                    const creditTransaction = {
                      id: Date.now(),
                      type: 'Credit',
                      customerName: selectedCustomer.customerName,
                      amount: creditAmount,
                      bank: 'N/A',
                      reason: creditReason,
                      notes: '',
                      additional: '',
                      status: 'Pending',
                      approvalStatus: 'pending',
                      date: new Date().toISOString(),
                      source: 'shop', // Mark as shop source
                      requestedBy: currentUser.username || 'Sales User',
                      totalItems: selectedCustomer?.totalItems || 0,
                      items: selectedCustomer?.items || [], // Store items for viewing
                      itemsData: selectedCustomer?.items || [], // Store full items data
                    }

                    // Save to confirmed_transactions
                    const existing = JSON.parse(localStorage.getItem('confirmed_transactions') || '[]')
                    localStorage.setItem('confirmed_transactions', JSON.stringify([...existing, creditTransaction]))

                    // ALSO save to shop-specific storage
                    const shopRequests = JSON.parse(localStorage.getItem('shop_payment_requests') || '[]')
                    
                    // Remove any rejected request for this customer before adding new request
                    const filteredShopRequests = shopRequests.filter((req: any) => 
                      !(req.customerName === selectedCustomer?.customerName && req.approvalStatus === 'rejected')
                    )
                    
                    localStorage.setItem('shop_payment_requests', JSON.stringify([...filteredShopRequests, creditTransaction]))
                    
                    // Debug: Log items count
                    console.log('✅ Saved credit request with items:', {
                      customer: selectedCustomer.customerName,
                      itemsCount: selectedCustomer?.items?.length || 0,
                      items: selectedCustomer?.items
                    })
                    
                    // Dispatch event for admin payments page
                    window.dispatchEvent(new CustomEvent('shopRequestCreated'))

                    alert(`✅ Credit Request Submitted!\n\n👤 Customer: ${selectedCustomer.customerName}\n💰 Amount: ${parseFloat(creditAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር\n📝 Reason: ${creditReason}\n\n⏳ Request pending admin approval!`)
                    
                    // Remove this customer's items from the list
                    const updatedItems = uploadedItems.filter(item => 
                      (item.customer || 'Unknown Customer') !== selectedCustomer.customerName
                    )
                    setUploadedItems(updatedItems)
                    localStorage.setItem('uploaded_sales_items', JSON.stringify(updatedItems))

                    // Close modals
                    setShowCreditModal(false)
                    setShowCustomerModal(false)
                    setSelectedCustomer(null)
                    setCreditAmount('')
                    setCreditReason('')
                  } catch (error) {
                    console.error('Error submitting credit request:', error)
                    alert('Failed to submit credit request')
                  }
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

      {/* Rejected Request Detail Modal */}
      {showRejectedRequestModal && selectedRejectedRequest && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => {
            setShowRejectedRequestModal(false)
            setSelectedRejectedRequest(null)
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '20px',
              width: '100%',
              maxWidth: '420px',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '24px 24px 20px',
              borderBottom: '2px solid #f1f5f9',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 1,
              borderRadius: '20px 20px 0 0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  borderRadius: '12px',
                  width: '42px',
                  height: '42px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <User size={22} color="#dc2626" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {selectedRejectedRequest.customerName || 'Unknown Customer'}
                  </h2>
                  <p style={{
                    margin: '2px 0 0 0',
                    fontSize: '12px',
                    color: '#64748b',
                    fontWeight: 600
                  }}>
                    {selectedRejectedRequest.itemsData?.length || 0} Item{selectedRejectedRequest.itemsData?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowRejectedRequestModal(false)
                    setSelectedRejectedRequest(null)
                  }}
                  style={{
                    background: '#f1f5f9',
                    border: 'none',
                    borderRadius: '10px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e2e8f0'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f1f5f9'
                  }}
                >
                  <X size={18} color="#64748b" />
                </button>
              </div>

              {/* Rejected Warning Badge */}
              <div style={{
                background: '#fef2f2',
                border: '1.5px solid #fecaca',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '12px'
              }}>
                <AlertCircle size={16} color="#dc2626" />
                <span style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#dc2626',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  ❌ Request Rejected - Resubmit Required
                </span>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
              {/* Display Excel Data - All Copies */}
              {(() => {
                // For shop section: use items or itemsData array
                const allCopies = selectedRejectedRequest.items || selectedRejectedRequest.itemsData || []
                
                if (allCopies.length === 0) {
                  return <div style={{
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.9rem'
                  }}>No data available</div>
                }
                
                return (
                  <>
                    {allCopies.map((copy: any, copyIndex: number) => {
                      // Extract item details - handle both formats
                      const itemName = copy['ITEM NAME'] || copy.itemName || copy['item name'] || copy.name || 'Unknown Item'
                      const quantity = parseFloat(copy.QUANTITY || copy.quantity || copy.qty || 0)
                      const sellingPrice = parseFloat(copy['SELLING PRICE'] || copy.sellingPrice || copy.price || 0)
                      const total = parseFloat(copy.TOTAL || copy.total || 0)
                      const totalPurchase = parseFloat(copy['TOTAL PURCHASE'] || copy.totalPurchase || 0)
                      
                      return (
                        <div key={copyIndex} style={{
                          padding: '1.5rem',
                          background: copyIndex === 0 ? 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)' : '#f8fafc',
                          borderRadius: '12px',
                          border: copyIndex === 0 ? '2px solid #93c5fd' : '1px solid #e2e8f0',
                          position: 'relative',
                          marginBottom: allCopies.length > 1 ? '1rem' : '1.5rem',
                        }}>
                          {allCopies.length > 1 && (
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
                              Copy {copyIndex + 1}
                            </div>
                          )}
                          
                          <div style={{ display: 'grid', gap: '1rem', marginTop: allCopies.length > 1 && copyIndex === 0 ? '1.5rem' : '0' }}>
                            {/* Item Name */}
                            <div style={{
                              padding: '0.85rem 1rem',
                              background: 'rgba(255, 255, 255, 0.6)',
                              borderRadius: '10px',
                              border: '1px solid rgba(255, 255, 255, 0.8)',
                            }}>
                              <p style={{
                                fontSize: '0.7rem',
                                fontWeight: '800',
                                color: '#e11d48',
                                margin: '0 0 0.35rem 0',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                              }}>
                                ITEM NAME
                              </p>
                              <p style={{
                                fontSize: '0.95rem',
                                fontWeight: '800',
                                color: '#1f2937',
                                margin: 0,
                              }}>
                                {itemName}
                              </p>
                            </div>

                            {/* Quantity */}
                            {quantity > 0 && (
                              <div style={{
                                padding: '0.85rem 1rem',
                                background: 'rgba(255, 255, 255, 0.6)',
                                borderRadius: '10px',
                                border: '1px solid rgba(255, 255, 255, 0.8)',
                              }}>
                                <p style={{
                                  fontSize: '0.7rem',
                                  fontWeight: '800',
                                  color: '#059669',
                                  margin: '0 0 0.35rem 0',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                }}>
                                  QUANTITY
                                </p>
                                <p style={{
                                  fontSize: '0.95rem',
                                  fontWeight: '800',
                                  color: '#1f2937',
                                  margin: 0,
                                }}>
                                  {quantity}
                                </p>
                              </div>
                            )}

                            {/* Selling Price */}
                            {sellingPrice > 0 && (
                              <div style={{
                                padding: '0.85rem 1rem',
                                background: 'rgba(255, 255, 255, 0.6)',
                                borderRadius: '10px',
                                border: '1px solid rgba(255, 255, 255, 0.8)',
                              }}>
                                <p style={{
                                  fontSize: '0.7rem',
                                  fontWeight: '800',
                                  color: '#2563eb',
                                  margin: '0 0 0.35rem 0',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                }}>
                                  SELLING PRICE
                                </p>
                                <p style={{
                                  fontSize: '0.95rem',
                                  fontWeight: '800',
                                  color: '#1f2937',
                                  margin: 0,
                                }}>
                                  {sellingPrice.toLocaleString()} ብር
                                </p>
                              </div>
                            )}

                            {/* Total */}
                            {total > 0 && (
                              <div style={{
                                padding: '0.85rem 1rem',
                                background: 'rgba(255, 255, 255, 0.6)',
                                borderRadius: '10px',
                                border: '1px solid rgba(255, 255, 255, 0.8)',
                              }}>
                                <p style={{
                                  fontSize: '0.7rem',
                                  fontWeight: '800',
                                  color: '#7c3aed',
                                  margin: '0 0 0.35rem 0',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                }}>
                                  TOTAL
                                </p>
                                <p style={{
                                  fontSize: '0.95rem',
                                  fontWeight: '800',
                                  color: '#1f2937',
                                  margin: 0,
                                }}>
                                  {total.toLocaleString()} ብር
                                </p>
                              </div>
                            )}

                            {/* Total Purchase */}
                            {totalPurchase > 0 && (
                              <div style={{
                                padding: '0.85rem 1rem',
                                background: 'rgba(255, 255, 255, 0.6)',
                                borderRadius: '10px',
                                border: '1px solid rgba(255, 255, 255, 0.8)',
                              }}>
                                <p style={{
                                  fontSize: '0.7rem',
                                  fontWeight: '800',
                                  color: '#dc2626',
                                  margin: '0 0 0.35rem 0',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.05em',
                                }}>
                                  TOTAL PURCHASE
                                </p>
                                <p style={{
                                  fontSize: '0.95rem',
                                  fontWeight: '800',
                                  color: '#1f2937',
                                  margin: 0,
                                }}>
                                  {totalPurchase.toLocaleString()} ብር
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}

                    {/* Total All Items Card */}
                    {(() => {
                      let totalQty = 0
                      let totalAmount = 0
                      
                      allCopies.forEach((dup: any) => {
                        for (const [key, val] of Object.entries(dup)) {
                          const lowerKey = key.toLowerCase()
                          if (lowerKey.includes('qty') || lowerKey.includes('quantity')) {
                            totalQty += isNaN(parseFloat(val as string)) ? 0 : parseFloat(val as string)
                          }
                          if (lowerKey === 'total' || (lowerKey.includes('total') && !lowerKey.includes('qty'))) {
                            totalAmount += isNaN(parseFloat(val as string)) ? 0 : parseFloat(val as string)
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
                          marginBottom: '1.5rem',
                        }}>
                          <p style={{
                            fontSize: '0.7rem',
                            fontWeight: '800',
                            color: '#15803d',
                            margin: '0 0 0.5rem 0',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                          }}>
                            TOTAL ALL ITEMS ({allCopies.length} {allCopies.length === 1 ? 'copy' : 'copies'})
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
                            Qty: {totalQty} | Copies: {allCopies.length}
                          </p>
                        </div>
                      ) : null
                    })()}
                  </>
                )
              })()}

              {/* Action Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px'
              }}>
                <button
                  onClick={() => {
                    // Calculate TOTAL from ALL items for payment
                    const allItems = selectedRejectedRequest.items || selectedRejectedRequest.itemsData || []
                    const totalAmount = allItems.reduce((sum: number, item: any) => {
                      const itemTotal = parseFloat(item.TOTAL || item.total || 0)
                      return sum + itemTotal
                    }, 0)
                    
                    // Open payment modal with pre-filled data
                    setSelectedCustomer({
                      ...selectedRejectedRequest,
                      customerName: selectedRejectedRequest.customerName,
                      uniqueKey: selectedRejectedRequest.id,
                      totalAmount: totalAmount,
                      items: allItems,
                    })
                    setPaymentAmount(totalAmount.toString())
                    setShowRejectedRequestModal(false)
                    setShowPaymentRequestModal(true)
                  }}
                  style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(16, 185, 129, 0.35)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <DollarSign size={18} />
                  Payment
                </button>

                <button
                  onClick={() => {
                    // Calculate TOTAL from ALL items for credit
                    const allItems = selectedRejectedRequest.items || selectedRejectedRequest.itemsData || []
                    const total = allItems.reduce((sum: number, item: any) => {
                      const itemTotal = parseFloat(item.TOTAL || item.total || 0)
                      return sum + itemTotal
                    }, 0)

                    setSelectedCustomer({
                      customerName: selectedRejectedRequest.customerName,
                      uniqueKey: selectedRejectedRequest.id,
                      items: allItems,
                      totalAmount: total,
                      totalItems: allItems.length
                    })
                    setCreditAmount(total.toString())
                    setShowRejectedRequestModal(false)
                    setShowCreditModal(true)
                  }}
                  style={{
                    padding: '16px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(245, 158, 11, 0.35)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  <Receipt size={18} />
                  Credit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </div>
  )
}
