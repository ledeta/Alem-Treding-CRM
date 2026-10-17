'use client'
// Refund section implementation - updated
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import AdminBottomNav from '@/components/AdminBottomNav'
import { CreditCard, Check, X, Eye, RotateCcw, Receipt } from 'lucide-react'

interface ConfirmedTransaction {
  id: number
  customer: string
  type: 'Payment' | 'Credit' | 'Refund'
  amount: string
  additional?: string
  additionalAmount?: string
  date: string
  status: 'Approved' | 'Pending' | 'Rejected'
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  bank?: string
  reason?: string
  paymentNotes?: string
  isMultiBankPayment?: boolean
  totalPaymentAmount?: string
  bankNumber?: number
  totalBanks?: number
  items?: any[] // Items in the transaction
  isRefund?: boolean // Mark as refund request
}

export default function PaymentsPage() {
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState<'approvals' | 'transactions' | 'shop' | 'expenses' | 'refunds'>('approvals')
  const [confirmedTransactions, setConfirmedTransactions] = useState<ConfirmedTransaction[]>([])
  const [shopRequests, setShopRequests] = useState<ConfirmedTransaction[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [refunds, setRefunds] = useState<any[]>([])
  
  // Reason modal states
  const [showReasonModal, setShowReasonModal] = useState(false)
  const [selectedReason, setSelectedReason] = useState('')

  // Load expenses from localStorage on mount
  useEffect(() => {
    try {
      const storedExpenses = localStorage.getItem('expenses')
      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses)
        if (Array.isArray(parsedExpenses)) {
          setExpenses(parsedExpenses)
          console.log('✅ Loaded expenses from localStorage:', parsedExpenses.length)
        }
      }
    } catch (e) {
      console.error('❌ Error loading expenses from localStorage:', e)
    }

    // Load approved refunds from localStorage
    try {
      const storedRefunds = localStorage.getItem('approved_refunds')
      if (storedRefunds) {
        const parsedRefunds = JSON.parse(storedRefunds)
        if (Array.isArray(parsedRefunds)) {
          setRefunds(parsedRefunds)
          console.log('✅ Loaded refunds from localStorage:', parsedRefunds.length)
        }
      }
    } catch (e) {
      console.error('❌ Error loading refunds from localStorage:', e)
    }
  }, [])

  // Check URL parameters for section navigation
  useEffect(() => {
    const section = searchParams.get('section')
    if (section === 'expenses') {
      setActiveSection('expenses')
    } else if (section === 'refunds') {
      setActiveSection('refunds')
    } else if (section === 'shop') {
      setActiveSection('shop')
    } else if (section === 'transactions') {
      setActiveSection('transactions')
    }
  }, [searchParams])

  const [isConfirmedMinimized, setIsConfirmedMinimized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Modal states
  const [showTransactionModal, setShowTransactionModal] = useState(false)
  const [showTransactionIdModal, setShowTransactionIdModal] = useState(false)
  const [showItemsModal, setShowItemsModal] = useState(false)
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<ConfirmedTransaction | null>(null)
  
  // Expense form state
  const [newExpense, setNewExpense] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: '',
    notes: ''
  })

  useEffect(() => {
    const fetchPaymentRequests = async () => {
      try {
        setIsLoading(true)
        
        let transactions: ConfirmedTransaction[] = []

        // Load ONLY from payment_requests (Warehouse Requests - pending approvals)
        const storedPaymentRequests = localStorage.getItem('payment_requests')
        if (storedPaymentRequests) {
          try {
            const paymentRequests = JSON.parse(storedPaymentRequests)
            if (Array.isArray(paymentRequests)) {
              transactions = paymentRequests.map((request: any) => ({
                id: request.id || Math.random(),
                customer: request.customerName || request.customer || 'Unknown',
                type: request.type || 'Payment', // Can be 'Refund' or 'Payment'
                amount: String(request.amount || 0),
                additional: request.additional || '',
                additionalAmount: request.additionalAmount || '',
                date: new Date(request.date || request.createdAt || request.requestedAt || new Date()).toLocaleString('en-US', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                }),
                status: request.status === 'Approved' ? 'Approved' : request.status === 'Rejected' ? 'Rejected' : 'Pending',
                approvalStatus: request.approvalStatus || (request.status === 'Approved' ? 'approved' : request.status === 'Rejected' ? 'rejected' : 'pending'),
                bank: request.bank || '',
                reason: request.reason || '',
                paymentNotes: request.paymentNotes || '',
                items: request.items || [], // Include items for refunds
                isRefund: request.isRefund || false, // Mark as refund
              }))
              console.log('✅ Loaded from payment_requests (Warehouse Requests):', transactions.length)
              setConfirmedTransactions(transactions)
              setIsLoading(false)
              return
            }
          } catch (e) {
            console.error('❌ Error parsing payment_requests:', e)
          }
        }

        // Try API
        try {
          const response = await fetch('http://localhost:3001/api/payments?page=1&limit=100', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (response.ok) {
            const data = await response.json()
            const payments = Array.isArray(data) ? data : data.data || []
            
            if (payments.length > 0) {
              transactions = payments.map((payment: any) => ({
                id: payment.id,
                customer: payment.customer?.name || payment.customerName || 'Unknown',
                type: 'Payment',
                amount: String(payment.amount || 0),
                additional: payment.additional || '',
                additionalAmount: payment.additionalAmount || '',
                date: new Date(payment.requestDate || payment.createdAt).toLocaleDateString('en-US', {
                  year: '2-digit',
                  month: 'short',
                  day: 'numeric'
                }),
                status: payment.status === 'Approved' ? 'Approved' : payment.status === 'Rejected' ? 'Rejected' : 'Pending',
                approvalStatus: payment.status === 'Approved' ? 'approved' : payment.status === 'Rejected' ? 'rejected' : 'pending',
                bank: payment.bank || '',
                reason: payment.reason || '',
                paymentNotes: payment.paymentNotes || '',
              }))
              console.log('✅ Loaded from API:', transactions.length)
              setConfirmedTransactions(transactions)
              setIsLoading(false)
              return
            }
          }
        } catch (apiError) {
          console.error('❌ API error:', apiError)
        }

        console.log('⚠️ No data found')
      } catch (error) {
        console.error('❌ Error fetching payment requests:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPaymentRequests()

    // Fetch shop requests
    const fetchShopRequests = () => {
      try {
        const storedShopRequests = localStorage.getItem('shop_payment_requests')
        if (storedShopRequests) {
          const shopTrans = JSON.parse(storedShopRequests)
          if (Array.isArray(shopTrans)) {
            const formattedShopRequests = shopTrans.map((trans: any) => ({
              id: trans.id,
              customer: trans.customerName || trans.customer || 'Unknown',
              type: trans.type === 'Credit' ? 'Credit' : 'Payment',
              amount: String(trans.amount || 0),
              date: trans.date || new Date().toLocaleDateString('en-US', {
                year: '2-digit',
                month: 'short',
                day: 'numeric'
              }),
              status: trans.status || 'Pending',
              approvalStatus: trans.approvalStatus || 'pending',
              bank: trans.bank || '',
              reason: trans.reason || '',
              paymentNotes: trans.paymentNotes || '',
              source: 'shop',
              items: trans.items || [] // Include items
            }))
            setShopRequests(formattedShopRequests)
            console.log('✅ Loaded shop requests:', formattedShopRequests.length)
            console.log('📦 Items in requests:', formattedShopRequests.map((r: any) => ({
              customer: r.customer,
              itemsCount: r.items?.length || 0
            })))
          }
        }
      } catch (error) {
        console.error('❌ Error loading shop requests:', error)
      }
    }

    fetchShopRequests()

    // Listen for localStorage changes (for real-time updates from sales page)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'confirmed_transactions') {
        console.log('🔔 Detected new transaction, reloading...')
        fetchPaymentRequests()
      }
      if (e.key === 'payment_requests') {
        console.log('🔔 Detected new payment/refund request, reloading...')
        fetchPaymentRequests()
      }
      if (e.key === 'shop_payment_requests') {
        console.log('🔔 Detected new shop request, reloading...')
        fetchShopRequests()
      }
      if (e.key === 'approved_refunds') {
        console.log('🔔 Detected refund approval, reloading refunds...')
        const storedRefunds = localStorage.getItem('approved_refunds')
        if (storedRefunds) {
          const parsedRefunds = JSON.parse(storedRefunds)
          setRefunds(parsedRefunds)
        }
      }
    }

    // Listen for custom events (same-tab updates)
    const handleCustomUpdate = () => {
      console.log('🔔 Detected custom transaction update, reloading...')
      fetchPaymentRequests()
    }

    const handleShopUpdate = () => {
      console.log('🔔 Detected shop request update, reloading...')
      fetchShopRequests()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('transactionCreated', handleCustomUpdate)
    window.addEventListener('shopRequestCreated', handleShopUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('transactionCreated', handleCustomUpdate)
      window.removeEventListener('shopRequestCreated', handleShopUpdate)
    }
  }, [])

  const handleApprove = (transaction: ConfirmedTransaction) => {
    // Check if this is a refund from payment_requests
    const paymentRequests = JSON.parse(localStorage.getItem('payment_requests') || '[]')
    const isRefundRequest = paymentRequests.some((req: any) => req.id === transaction.id && req.isRefund)
    
    // Update state
    setConfirmedTransactions(prev => prev.map(t => t.id === transaction.id ? { ...t, approvalStatus: 'approved', status: 'Approved' } : t))
    
    // Update shop requests state if it's a shop request
    setShopRequests(prev => prev.map(t => t.id === transaction.id ? { ...t, approvalStatus: 'approved', status: 'Approved' } : t))
    
    // If it's a refund, save to approved_refunds
    if (isRefundRequest) {
      try {
        const refundRequest = paymentRequests.find((req: any) => req.id === transaction.id)
        if (refundRequest) {
          const approvedRefund = {
            ...refundRequest,
            approvedAt: new Date().toISOString(),
            approvedBy: 'admin',
            status: 'Approved',
            approvalStatus: 'approved',
          }
          
          // Save to approved_refunds
          const existingRefunds = JSON.parse(localStorage.getItem('approved_refunds') || '[]')
          const updatedRefunds = [...existingRefunds, approvedRefund]
          localStorage.setItem('approved_refunds', JSON.stringify(updatedRefunds))
          setRefunds(updatedRefunds)
          
          // Remove from payment_requests
          const updatedRequests = paymentRequests.filter((req: any) => req.id !== transaction.id)
          localStorage.setItem('payment_requests', JSON.stringify(updatedRequests))
          
          console.log('✅ Refund approved and moved to approved_refunds')
          
          // Create a credit transaction for the customer
          const creditTransaction = {
            id: Date.now(),
            type: 'Credit',
            customerName: refundRequest.customerName,
            customer: refundRequest.customerName,
            amount: refundRequest.amount,
            date: new Date().toISOString(),
            status: 'Approved',
            approvalStatus: 'approved',
            reason: `Refund: ${refundRequest.reason}`,
            transactionId: refundRequest.transactionId,
            items: refundRequest.items,
            isRefundCredit: true,
          }
          
          // Add to confirmed_transactions
          const storedTransactions = localStorage.getItem('confirmed_transactions')
          if (storedTransactions) {
            const allTransactions = JSON.parse(storedTransactions)
            const updatedTransactions = [...allTransactions, creditTransaction]
            localStorage.setItem('confirmed_transactions', JSON.stringify(updatedTransactions))
            
            window.dispatchEvent(new CustomEvent('transactionApproved', { 
              detail: { transaction: creditTransaction, allTransactions: updatedTransactions }
            }))
          }
          
          // Show success message with items if present
          const itemsText = refundRequest.items && refundRequest.items.length > 0
            ? `\n📦 Items:\n${refundRequest.items.map((item: any) => `  • ${item.name} (${item.quantity} × ${item.price.toLocaleString()} ብር)`).join('\n')}`
            : ''
          
          alert(`✅ Refund Approved!\n\n👤 Customer: ${refundRequest.customerName}\n💸 Amount: ${parseFloat(refundRequest.amount).toLocaleString()} ብር${itemsText}\n🔢 Transaction ID: ${refundRequest.transactionId}\n\n✓ Credit has been added to customer's account`)
          
          return
        }
      } catch (error) {
        console.error('❌ Error processing refund:', error)
      }
    }
    
    // Deduct items from inventory
    if (transaction.items && transaction.items.length > 0) {
      try {
        const storedItems = localStorage.getItem('dashboard_items')
        if (storedItems) {
          const inventoryItems = JSON.parse(storedItems)
          
          console.log('📦 Deducting items from inventory...')
          console.log('Transaction items:', transaction.items)
          
          // Deduct quantities for each item in the transaction
          const updatedInventory = inventoryItems.map((inventoryItem: any) => {
            // Find matching item in transaction by name (case-insensitive)
            const transactionItem = transaction.items?.find((item: any) => 
              (item.name || item.itemName || '').toLowerCase() === inventoryItem.name.toLowerCase()
            )
            
            if (transactionItem) {
              const quantityToDeduct = transactionItem.quantity || 0
              const newStock = Math.max(0, (inventoryItem.stock || 0) - quantityToDeduct)
              
              console.log(`✅ Deducting ${quantityToDeduct} from ${inventoryItem.name}:`, {
                oldStock: inventoryItem.stock,
                newStock: newStock
              })
              
              return {
                ...inventoryItem,
                stock: newStock
              }
            }
            
            return inventoryItem
          })
          
          // Save updated inventory
          localStorage.setItem('dashboard_items', JSON.stringify(updatedInventory))
          console.log('✅ Inventory updated successfully')
          
          // Dispatch event to notify other pages
          window.dispatchEvent(new CustomEvent('inventoryUpdated'))
        }
      } catch (error) {
        console.error('❌ Error updating inventory:', error)
      }
    }
    
    // Update confirmed transactions
    const storedTransactions = localStorage.getItem('confirmed_transactions')
    if (storedTransactions) {
      try {
        const allTransactions = JSON.parse(storedTransactions)
        const updatedTransactions = allTransactions.map((t: any) => 
          t.id === transaction.id ? { ...t, approvalStatus: 'approved', status: 'Approved' } : t
        )
        localStorage.setItem('confirmed_transactions', JSON.stringify(updatedTransactions))
        console.log('✅ Synced approved transaction to localStorage')
        
        window.dispatchEvent(new CustomEvent('transactionApproved', { 
          detail: { transaction, allTransactions: updatedTransactions }
        }))
        console.log('📢 Fired transactionApproved event')
      } catch (e) {
        console.error('❌ Error syncing to localStorage:', e)
      }
    }
    
    // Update shop_payment_requests if applicable
    const storedShopRequests = localStorage.getItem('shop_payment_requests')
    if (storedShopRequests) {
      try {
        const allShopRequests = JSON.parse(storedShopRequests)
        const updatedShopRequests = allShopRequests.map((t: any) => 
          t.id === transaction.id ? { ...t, approvalStatus: 'approved', status: 'Approved' } : t
        )
        localStorage.setItem('shop_payment_requests', JSON.stringify(updatedShopRequests))
        console.log('✅ Synced approved shop request to localStorage')
      } catch (e) {
        console.error('❌ Error syncing shop request:', e)
      }
    }
    
    // Show success message
    const itemsCount = transaction.items?.length || 0
    if (itemsCount > 0) {
      alert(`✅ Request Approved!\n\n👤 Customer: ${transaction.customer}\n💰 Amount: ${transaction.amount} ብር\n📦 Items deducted: ${itemsCount}\n\n✓ Inventory updated automatically`)
    } else {
      alert(`✅ Request Approved!\n\n👤 Customer: ${transaction.customer}\n💰 Amount: ${transaction.amount} ብር`)
    }
  }

  const handleReject = (transaction: ConfirmedTransaction) => {
    // Mark as rejected in state
    setConfirmedTransactions(prev => prev.map(t => t.id === transaction.id ? { ...t, approvalStatus: 'rejected', status: 'Rejected' } : t))
    
    // Update localStorage
    const storedTransactions = localStorage.getItem('confirmed_transactions')
    if (storedTransactions) {
      try {
        const allTransactions = JSON.parse(storedTransactions)
        const updatedTransactions = allTransactions.map((t: any) => 
          t.id === transaction.id ? { ...t, approvalStatus: 'rejected', status: 'Rejected' } : t
        )
        localStorage.setItem('confirmed_transactions', JSON.stringify(updatedTransactions))
        
        // Move rejected transaction back to uploaded_customers for re-editing
        const uploadedCustomers = JSON.parse(localStorage.getItem('uploaded_customers_persist') || '[]')
        
        // Get the original customer data if it exists in the transaction
        const rejectedCustomer = {
          name: transaction.customer,
          _rejectedTransaction: {
            id: transaction.id,
            amount: transaction.amount,
            bank: transaction.bank,
            reason: transaction.reason,
            paymentNotes: transaction.paymentNotes,
            additionalAmount: transaction.additionalAmount,
            additional: transaction.additional,
            isMultiBankPayment: transaction.isMultiBankPayment,
            totalPaymentAmount: transaction.totalPaymentAmount,
            bankNumber: transaction.bankNumber,
            totalBanks: transaction.totalBanks,
          },
          _isRejectedPayment: true,
          matched: false,
          inDatabase: false,
          // Add any item data if it was stored with the transaction
          ...(transaction as any).customerData,
        }
        
        // Add back to uploaded customers
        uploadedCustomers.push(rejectedCustomer)
        localStorage.setItem('uploaded_customers_persist', JSON.stringify(uploadedCustomers))
        
        console.log('✅ Saved rejected customer to localStorage:', rejectedCustomer.name)
        console.log('📊 Total customers in localStorage:', uploadedCustomers.length)
        
        // Fire event to notify sales page
        window.dispatchEvent(new CustomEvent('paymentRejected', { 
          detail: { transaction, customer: rejectedCustomer }
        }))
        console.log('📢 Fired paymentRejected event')
        
        alert(`❌ Payment Rejected\n\nCustomer: ${transaction.customer}\nAmount: ${transaction.amount}\n\nThe customer will appear in sales dashboard for resubmission.`)
        
      } catch (e) {
        console.error('❌ Error handling rejection:', e)
      }
    }
  }

  const openTransactionModal = (transaction: ConfirmedTransaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionModal(true)
  }

  const openReasonModal = (transaction: ConfirmedTransaction) => {
    setSelectedTransaction(transaction)
    setShowReasonModal(true)
  }

  const openTransactionIdModal = (transaction: ConfirmedTransaction) => {
    setSelectedTransaction(transaction)
    setShowTransactionIdModal(true)
  }

  const openItemsModal = (transaction: ConfirmedTransaction) => {
    setSelectedTransaction(transaction)
    setShowItemsModal(true)
  }

  const handleAddExpense = () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.description) {
      alert('Please fill in all required fields')
      return
    }

    const expense = {
      id: Date.now(),
      ...newExpense,
      createdAt: new Date().toISOString()
    }

    const updatedExpenses = [...expenses, expense]
    setExpenses(updatedExpenses)
    
    // Save to localStorage
    localStorage.setItem('expenses', JSON.stringify(updatedExpenses))
    
    // Reset form
    setNewExpense({
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: '',
      notes: ''
    })
    
    setShowAddExpenseModal(false)
    alert('✅ Expense added successfully!')
  }

  const handleDeleteExpense = (expenseId: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      const updatedExpenses = expenses.filter(e => e.id !== expenseId)
      setExpenses(updatedExpenses)
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses))
      alert('Expense deleted successfully!')
    }
  }

  const approvedCount = confirmedTransactions.filter(t => t.status === 'Approved').length
  const pendingCount = confirmedTransactions.filter(t => t.status === 'Pending').length

  return (
    <>
      <div style={{ background: '#f5f7fa', minHeight: '100vh', paddingBottom: '140px' }}>
        <div style={{ background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', color: 'white', padding: '1.5rem 1.25rem', boxShadow: '0 2px 8px rgba(168, 85, 247, 0.2)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CreditCard size={28} />
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>Payments</h1>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Section Toggle */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'white', padding: '1rem', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', width: 'fit-content', flexWrap: 'wrap' }}>
            <button onClick={() => setActiveSection('approvals')} style={{ padding: '0.75rem 1.5rem', background: activeSection === 'approvals' ? '#a855f7' : 'white', color: activeSection === 'approvals' ? 'white' : '#6b7280', border: activeSection === 'approvals' ? 'none' : '1px solid #e5e7eb', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
              <Check size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Werhouse Request
            </button>
            <button onClick={() => setActiveSection('shop')} style={{ padding: '0.75rem 1.5rem', background: activeSection === 'shop' ? '#a855f7' : 'white', color: activeSection === 'shop' ? 'white' : '#6b7280', border: activeSection === 'shop' ? 'none' : '1px solid #e5e7eb', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
              <CreditCard size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Shop Requests
            </button>
            <button onClick={() => setActiveSection('expenses')} style={{ padding: '0.75rem 1.5rem', background: activeSection === 'expenses' ? '#a855f7' : 'white', color: activeSection === 'expenses' ? 'white' : '#6b7280', border: activeSection === 'expenses' ? 'none' : '1px solid #e5e7eb', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
              <CreditCard size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Expenses
            </button>
            <button onClick={() => setActiveSection('refunds')} style={{ padding: '0.75rem 1.5rem', background: activeSection === 'refunds' ? '#a855f7' : 'white', color: activeSection === 'refunds' ? 'white' : '#6b7280', border: activeSection === 'refunds' ? 'none' : '1px solid #e5e7eb', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
              <RotateCcw size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Refunds
            </button>
            <button onClick={() => setActiveSection('transactions')} style={{ padding: '0.75rem 1.5rem', background: activeSection === 'transactions' ? '#a855f7' : 'white', color: activeSection === 'transactions' ? 'white' : '#6b7280', border: activeSection === 'transactions' ? 'none' : '1px solid #e5e7eb', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
              <CreditCard size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
              Transactions
            </button>
          </div>

          {/* WERHOUSE REQUEST SECTION */}
          {activeSection === 'approvals' && (
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>Werhouse Request</h2>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                    {[...confirmedTransactions, ...shopRequests].length} total • {[...confirmedTransactions.filter(t => t.approvalStatus === 'pending'), ...shopRequests.filter(t => t.approvalStatus === 'pending')].length} pending • {[...confirmedTransactions.filter(t => t.approvalStatus === 'approved'), ...shopRequests.filter(t => t.approvalStatus === 'approved')].length} approved
                  </p>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                {isLoading ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                    <p>Loading sales requests...</p>
                  </div>
                ) : [...confirmedTransactions, ...shopRequests].length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                    <p>No sales requests available</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Source</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Customer</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Type</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Amount</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Payed By</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Additional</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Transaction</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Reason</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Date</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...confirmedTransactions.filter(t => t.approvalStatus === 'pending').map(t => ({...t, source: 'warehouse'})), ...shopRequests.filter(t => t.approvalStatus === 'pending').map(t => ({...t, source: 'shop'}))].map(transaction => (
                        <tr key={`${transaction.source}-${transaction.id}`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.375rem 0.75rem',
                              background: transaction.source === 'warehouse' ? '#ede9fe' : '#fef3c7',
                              color: transaction.source === 'warehouse' ? '#7c3aed' : '#d97706',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              {transaction.source === 'warehouse' ? '🏢 Warehouse' : '🏪 Shop'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#111827', fontWeight: '500' }}>
                            {transaction.customer}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.375rem 0.75rem',
                              background: transaction.transactionType === 'Refund' ? '#fee2e2' : transaction.transactionType === 'Pay Credit' ? '#dbeafe' : transaction.type === 'Payment' ? '#dbeafe' : '#fef3c7',
                              color: transaction.transactionType === 'Refund' ? '#dc2626' : transaction.transactionType === 'Pay Credit' ? '#0284c7' : transaction.type === 'Payment' ? '#0284c7' : '#ca8a04',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}>
                              {transaction.transactionType || transaction.type}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#111827', fontWeight: '600' }}>
                            {parseFloat(transaction.amount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                            {transaction.bank ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.4rem 0.8rem',
                                background: '#eff6ff',
                                color: '#1e40af',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                border: '1px solid #bfdbfe'
                              }}>
                                🏦 {transaction.bank}
                              </span>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                            {transaction.additionalAmount ? (
                              <span style={{
                                display: 'inline-block',
                                padding: '0.3rem 0.6rem',
                                background: '#fef3c7',
                                color: '#92400e',
                                borderRadius: '5px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}>
                                +{parseFloat(transaction.additionalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                              </span>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {transaction.reason ? (
                              <button
                                onClick={() => openTransactionModal(transaction)}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  background: '#f0fdf4',
                                  color: '#16a34a',
                                  border: '1px solid #bbf7d0',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#dcfce7'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#f0fdf4'
                                }}
                              >
                                <Eye size={14} />
                                View
                              </button>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {transaction.paymentNotes ? (
                              <button
                                onClick={() => openReasonModal(transaction)}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  background: '#fef3c7',
                                  color: '#92400e',
                                  border: '1px solid #fde68a',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#fde68a'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#fef3c7'
                                }}
                              >
                                <Eye size={14} />
                                View
                              </button>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                            {transaction.date}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              {transaction.approvalStatus === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(transaction)}
                                    style={{
                                      padding: '0.5rem 1rem',
                                      background: '#f0fdf4',
                                      color: '#16a34a',
                                      border: '1px solid #bbf7d0',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      fontSize: '0.85rem',
                                      fontWeight: '600',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#dcfce7'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = '#f0fdf4'
                                    }}
                                  >
                                    <Check size={16} />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(transaction)}
                                    style={{
                                      padding: '0.5rem 1rem',
                                      background: '#fef2f2',
                                      color: '#dc2626',
                                      border: '1px solid #fecaca',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      fontSize: '0.85rem',
                                      fontWeight: '600',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#fee2e2'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = '#fef2f2'
                                    }}
                                  >
                                    <X size={16} />
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* SHOP REQUESTS SECTION */}
          {activeSection === 'shop' && (
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>Shop Requests</h2>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                    {shopRequests.length} total • {shopRequests.filter(t => t.approvalStatus === 'pending').length} pending • {shopRequests.filter(t => t.approvalStatus === 'approved').length} approved
                  </p>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                {shopRequests.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                    <p>No shop requests available</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Customer</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Type</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Amount</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Bank</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Transaction ID</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Items</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Date</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Status</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shopRequests.map(request => (
                        <tr key={request.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#111827', fontWeight: '500' }}>
                            {request.customer}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.375rem 0.75rem',
                              background: request.type === 'Payment' ? '#dbeafe' : '#fef3c7',
                              color: request.type === 'Payment' ? '#0284c7' : '#ca8a04',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}>
                              {request.type}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#111827', fontWeight: '600' }}>
                            {parseFloat(request.amount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                            {request.bank ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.4rem 0.8rem',
                                background: '#eff6ff',
                                color: '#1e40af',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                border: '1px solid #bfdbfe'
                              }}>
                                🏦 {request.bank}
                              </span>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {request.reason ? (
                              <button
                                onClick={() => openTransactionIdModal(request)}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  background: '#f0fdf4',
                                  color: '#16a34a',
                                  border: '1px solid #bbf7d0',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#dcfce7'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#f0fdf4'
                                }}
                              >
                                <Eye size={14} />
                                Show
                              </button>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {request.items && request.items.length > 0 ? (
                              <button
                                onClick={() => openItemsModal(request)}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  background: '#eff6ff',
                                  color: '#1e40af',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#dbeafe'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#eff6ff'
                                }}
                              >
                                <Eye size={14} />
                                View ({request.items.length})
                              </button>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                            {request.date}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            {request.status === 'Approved' && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.4rem 0.8rem',
                                background: '#dcfce7',
                                color: '#16a34a',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                border: '1px solid #bbf7d0'
                              }}>
                                <Check size={14} />
                                Approved
                              </span>
                            )}
                            {request.status === 'Pending' && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.4rem 0.8rem',
                                background: '#fef3c7',
                                color: '#92400e',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                border: '1px solid #fde68a'
                              }}>
                                ⏳ Pending
                              </span>
                            )}
                            {request.status === 'Rejected' && (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.4rem 0.8rem',
                                background: '#fee2e2',
                                color: '#dc2626',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                border: '1px solid #fecaca'
                              }}>
                                <X size={14} />
                                Rejected
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              {request.approvalStatus === 'pending' && (
                                <>
                                  <button
                                    onClick={() => handleApprove(request)}
                                    style={{
                                      padding: '0.5rem 1rem',
                                      background: '#f0fdf4',
                                      color: '#16a34a',
                                      border: '1px solid #bbf7d0',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      fontSize: '0.85rem',
                                      fontWeight: '600',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#dcfce7'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = '#f0fdf4'
                                    }}
                                  >
                                    <Check size={16} />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleReject(request)}
                                    style={{
                                      padding: '0.5rem 1rem',
                                      background: '#fef2f2',
                                      color: '#dc2626',
                                      border: '1px solid #fecaca',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.4rem',
                                      fontSize: '0.85rem',
                                      fontWeight: '600',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.background = '#fee2e2'
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.background = '#fef2f2'
                                    }}
                                  >
                                    <X size={16} />
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* REFUNDS SECTION */}
          {activeSection === 'refunds' && (
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #f0f0f0' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>Approved Refunds</h2>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                  {refunds.length} total refunds • {refunds.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0).toLocaleString()} ብር total
                </p>
              </div>

              <div style={{ overflowX: 'auto' }}>
                {refunds.length === 0 ? (
                  <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#9ca3af' }}>
                    <div style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '50%', 
                      background: '#fef2f2', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      margin: '0 auto 1rem',
                      fontSize: '2rem'
                    }}>
                      <RotateCcw size={36} color="#ef4444" />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#374151', margin: '0 0 0.5rem 0' }}>
                      No Approved Refunds
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: 0 }}>
                      Refund requests will appear here after admin approval
                    </p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Date</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Customer</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Items</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Total Amount</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Reason</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {refunds.map((refund) => (
                        <tr key={refund.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#374151' }}>
                            {new Date(refund.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#111827', fontWeight: '500' }}>
                            {refund.customerName || refund.customer}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {refund.items && refund.items.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {refund.items.map((item: any, idx: number) => (
                                  <div key={idx} style={{ fontSize: '0.8125rem', color: '#6b7280' }}>
                                    <span style={{ fontWeight: '500', color: '#374151' }}>{item.name}</span>
                                    {' • '}
                                    <span>Qty: {item.quantity}</span>
                                    {' • '}
                                    <span>{item.price.toLocaleString()} ብር</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.875rem', color: '#9ca3af' }}>No items</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.9375rem', fontWeight: '600', color: '#111827', textAlign: 'right' }}>
                            {parseFloat(refund.amount).toLocaleString()} ብር
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <button
                              onClick={() => {
                                setSelectedReason(refund.reason || 'No reason provided')
                                setShowReasonModal(true)
                              }}
                              style={{
                                padding: '0.375rem 0.75rem',
                                background: '#f3f4f6',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '0.8125rem',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#e5e7eb'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#f3f4f6'
                              }}
                            >
                              View
                            </button>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.375rem 0.75rem',
                              background: '#d1fae5',
                              color: '#065f46',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              textTransform: 'uppercase',
                              letterSpacing: '0.025em'
                            }}>
                              Approved
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* CONFIRMED SALES SECTION */}
          {activeSection === 'transactions' && (
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>Approved Transactions</h2>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                    {[...confirmedTransactions.filter(t => t.approvalStatus === 'approved'), ...shopRequests.filter(t => t.approvalStatus === 'approved')].length} approved transactions • 
                    {' '}{confirmedTransactions.filter(t => t.approvalStatus === 'approved').length} warehouse • 
                    {' '}{shopRequests.filter(t => t.approvalStatus === 'approved').length} shop
                  </p>
                </div>
                <button
                  onClick={() => setIsConfirmedMinimized(!isConfirmedMinimized)}
                  style={{
                    background: '#f3f4f6',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem 0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6b7280',
                    borderRadius: '6px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isConfirmedMinimized ? '▼' : '▲'}
                </button>
              </div>

              {!isConfirmedMinimized && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Source</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Customer</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Type</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Amount</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Payed By</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Additional</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Transaction</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Reason</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Items</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Date</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...confirmedTransactions.filter(t => t.approvalStatus === 'approved').map(t => ({...t, source: 'warehouse'})), ...shopRequests.filter(t => t.approvalStatus === 'approved').map(t => ({...t, source: 'shop'}))].map(transaction => (
                        <tr key={`${transaction.source}-${transaction.id}`} style={{ borderBottom: '1px solid #e5e7eb' }}>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.375rem 0.75rem',
                              background: transaction.source === 'warehouse' ? '#ede9fe' : '#fef3c7',
                              color: transaction.source === 'warehouse' ? '#7c3aed' : '#d97706',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em'
                            }}>
                              {transaction.source === 'warehouse' ? '🏢 Warehouse' : '🏪 Shop'}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#111827', fontWeight: '500' }}>
                            {transaction.customer}
                            {transaction.isMultiBankPayment && (
                              <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{
                                  fontSize: '0.7rem',
                                  color: '#6b7280',
                                  background: '#f3f4f6',
                                  padding: '0.15rem 0.5rem',
                                  borderRadius: '4px',
                                  fontWeight: '600'
                                }}>
                                  Payment {transaction.bankNumber}/{transaction.totalBanks}
                                </span>
                                <span style={{
                                  fontSize: '0.7rem',
                                  color: '#2563eb',
                                  fontWeight: '600'
                                }}>
                                  Total: {parseFloat(transaction.totalPaymentAmount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                                </span>
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.375rem 0.75rem',
                              background: transaction.transactionType === 'Refund' ? '#fee2e2' : transaction.transactionType === 'Pay Credit' ? '#dbeafe' : transaction.type === 'Payment' ? '#dbeafe' : '#fef3c7',
                              color: transaction.transactionType === 'Refund' ? '#dc2626' : transaction.transactionType === 'Pay Credit' ? '#0284c7' : transaction.type === 'Payment' ? '#0284c7' : '#ca8a04',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}>
                              {transaction.transactionType || transaction.type}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#111827', fontWeight: '600' }}>
                            {parseFloat(transaction.amount || '0').toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                            {transaction.bank ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '0.4rem 0.8rem',
                                background: '#eff6ff',
                                color: '#1e40af',
                                borderRadius: '6px',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                border: '1px solid #bfdbfe'
                              }}>
                                🏦 {transaction.bank}
                              </span>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                            {transaction.additionalAmount ? (
                              <span style={{
                                display: 'inline-block',
                                padding: '0.3rem 0.6rem',
                                background: '#fef3c7',
                                color: '#92400e',
                                borderRadius: '5px',
                                fontSize: '0.8rem',
                                fontWeight: '600'
                              }}>
                                +{parseFloat(transaction.additionalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                              </span>
                            ) : (
                              <span style={{ color: '#9ca3af' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {transaction.reason ? (
                              <button
                                onClick={() => openTransactionModal(transaction)}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  background: '#f0fdf4',
                                  color: '#16a34a',
                                  border: '1px solid #bbf7d0',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#dcfce7'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#f0fdf4'
                                }}
                              >
                                <Eye size={14} />
                                View
                              </button>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {transaction.paymentNotes ? (
                              <button
                                onClick={() => openReasonModal(transaction)}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  background: '#fef3c7',
                                  color: '#92400e',
                                  border: '1px solid #fde68a',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#fde68a'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#fef3c7'
                                }}
                              >
                                <Eye size={14} />
                                View
                              </button>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {transaction.items && transaction.items.length > 0 ? (
                              <button
                                onClick={() => openItemsModal(transaction)}
                                style={{
                                  padding: '0.4rem 0.8rem',
                                  background: '#eff6ff',
                                  color: '#1e40af',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.4rem',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#dbeafe'
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#eff6ff'
                                }}
                              >
                                <Eye size={14} />
                                View ({transaction.items.length})
                              </button>
                            ) : (
                              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                            {transaction.date}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              padding: '0.4rem 0.8rem',
                              background: '#dcfce7',
                              color: '#16a34a',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              border: '1px solid #bbf7d0'
                            }}>
                              <Check size={14} />
                              Approved
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* EXPENSES SECTION */}
          {activeSection === 'expenses' && (
            <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)', overflow: 'hidden' }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid #f0f0f0' }}>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: '#111827' }}>Expenses</h2>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>
                  Track and manage business expenses
                </p>
              </div>

              <div style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 1rem',
                  boxShadow: '0 4px 12px rgba(168, 85, 247, 0.3)'
                }}>
                  <Receipt size={40} color="white" strokeWidth={2} />
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#374151', margin: '0 0 0.5rem 0' }}>
                  Expenses Management
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#6b7280', margin: '0 0 1.5rem 0', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                  Record and track all business expenses including rent, utilities, salaries, and other operational costs.
                </p>
                <button
                  onClick={() => setShowAddExpenseModal(true)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(168, 85, 247, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(168, 85, 247, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(168, 85, 247, 0.2)';
                  }}
                >
                  + Add Expense
                </button>
              </div>

              {/* Placeholder for expense list when data exists */}
              {expenses.length > 0 && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Date</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Category</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Description</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Amount</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Payment Method</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'center', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense, index) => (
                        <tr 
                          key={index} 
                          style={{ 
                            borderBottom: '1px solid #e5e7eb',
                            backgroundColor: expense.paymentMethod === 'credit' ? '#fef2f2' : 'transparent'
                          }}
                        >
                          <td style={{ 
                            padding: '1rem', 
                            fontSize: '0.9rem', 
                            color: expense.paymentMethod === 'credit' ? '#dc2626' : '#111827',
                            fontWeight: expense.paymentMethod === 'credit' ? '600' : '400'
                          }}>
                            {expense.date}
                          </td>
                          <td style={{ 
                            padding: '1rem', 
                            fontSize: '0.9rem', 
                            color: expense.paymentMethod === 'credit' ? '#dc2626' : '#111827',
                            fontWeight: expense.paymentMethod === 'credit' ? '600' : '400'
                          }}>
                            {expense.category}
                          </td>
                          <td style={{ 
                            padding: '1rem', 
                            fontSize: '0.9rem', 
                            color: expense.paymentMethod === 'credit' ? '#dc2626' : '#6b7280',
                            fontWeight: expense.paymentMethod === 'credit' ? '600' : '400'
                          }}>
                            {expense.description}
                          </td>
                          <td style={{ 
                            padding: '1rem', 
                            fontSize: '0.9rem', 
                            color: expense.paymentMethod === 'credit' ? '#dc2626' : '#111827', 
                            fontWeight: '600' 
                          }}>
                            {parseFloat(expense.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                          </td>
                          <td style={{ 
                            padding: '1rem', 
                            fontSize: '0.9rem', 
                            color: expense.paymentMethod === 'credit' ? '#dc2626' : '#111827',
                            fontWeight: expense.paymentMethod === 'credit' ? '600' : '400',
                            textTransform: 'capitalize'
                          }}>
                            {expense.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : expense.paymentMethod}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <button 
                              onClick={() => handleDeleteExpense(expense.id)}
                              style={{
                                padding: '0.4rem 0.8rem',
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#fecaca'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#fee2e2'
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Transaction ID Modal */}
      {showTransactionModal && selectedTransaction && (
        <div
          onClick={() => setShowTransactionModal(false)}
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
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Transaction ID</h3>
              <button
                onClick={() => setShowTransactionModal(false)}
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
                  fontWeight: '700',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '2rem' }}>
              <div style={{
                background: '#f0fdf4',
                border: '2px solid #bbf7d0',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Customer
                </p>
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#111827', fontWeight: '700' }}>
                  {selectedTransaction.customer}
                </p>
              </div>
              <div style={{
                background: '#f0fdf4',
                border: '2px solid #bbf7d0',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Transaction ID
                </p>
                <p style={{ margin: 0, fontSize: '1.3rem', color: '#16a34a', fontWeight: '700', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                  {selectedTransaction.reason}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Reason Modal */}
      {showReasonModal && selectedTransaction && (
        <div
          onClick={() => setShowReasonModal(false)}
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
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700' }}>Payment Notes/Reason</h3>
              <button
                onClick={() => setShowReasonModal(false)}
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
                  fontWeight: '700',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '2rem' }}>
              <div style={{
                background: '#fef3c7',
                border: '2px solid #fde68a',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '1rem'
              }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Customer
                </p>
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#111827', fontWeight: '700' }}>
                  {selectedTransaction.customer}
                </p>
              </div>
              <div style={{
                background: '#fef3c7',
                border: '2px solid #fde68a',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Payment Notes
                </p>
                <p style={{ margin: 0, fontSize: '1rem', color: '#111827', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {selectedTransaction.paymentNotes}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction ID Modal */}
      {showTransactionIdModal && selectedTransaction && (
        <div
          onClick={() => setShowTransactionIdModal(false)}
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
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <div style={{ 
              padding: '1.5rem', 
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '12px 12px 0 0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>
                  Transaction ID
                </h3>
                <button
                  onClick={() => setShowTransactionIdModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: 'white',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            <div style={{ padding: '2rem' }}>
              <div style={{
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem'
              }}>
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Customer
                </p>
                <p style={{ margin: '0 0 1.5rem 0', fontSize: '1rem', color: '#111827', fontWeight: '600' }}>
                  {selectedTransaction.customer}
                </p>
                
                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.85rem', color: '#6b7280', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Transaction ID / Reference
                </p>
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#059669', lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontWeight: '700', fontFamily: 'monospace', background: 'white', padding: '1rem', borderRadius: '6px', border: '2px solid #10b981' }}>
                  {selectedTransaction.reason}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items Modal */}
      {showItemsModal && selectedTransaction && (
        <div
          onClick={() => setShowItemsModal(false)}
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
            zIndex: 9999,
            padding: '1rem'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
          >
            <div style={{ 
              padding: '1.5rem', 
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '12px 12px 0 0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: 'white' }}>
                    Transaction Items
                  </h3>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)' }}>
                    Customer: {selectedTransaction.customer}
                  </p>
                </div>
                <button
                  onClick={() => setShowItemsModal(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: 'white',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {selectedTransaction.items && selectedTransaction.items.length > 0 ? (
                <>
                  <div style={{ marginBottom: '1rem', padding: '1rem', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#1e40af', fontWeight: '600' }}>
                      Total Items: {selectedTransaction.items.length} | Total Amount: {selectedTransaction.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                    </p>
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>#</th>
                          <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Item Name</th>
                          <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Quantity</th>
                          <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Unit Price</th>
                          <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTransaction.items.map((item: any, index: number) => (
                          <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                            <td style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>{index + 1}</td>
                            <td style={{ padding: '0.75rem', fontSize: '0.9rem', color: '#111827', fontWeight: '500' }}>{item.name || item.itemName || 'Unknown Item'}</td>
                            <td style={{ padding: '0.75rem', fontSize: '0.9rem', color: '#111827', textAlign: 'right' }}>{item.quantity || 0}</td>
                            <td style={{ padding: '0.75rem', fontSize: '0.9rem', color: '#111827', textAlign: 'right' }}>{parseFloat(item.unitPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                            <td style={{ padding: '0.75rem', fontSize: '0.9rem', color: '#111827', textAlign: 'right', fontWeight: '600' }}>{parseFloat(item.total || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr style={{ background: '#f9fafb', borderTop: '2px solid #e5e7eb' }}>
                          <td colSpan={4} style={{ padding: '1rem', fontSize: '0.9rem', color: '#111827', fontWeight: '700', textAlign: 'right' }}>
                            Grand Total:
                          </td>
                          <td style={{ padding: '1rem', fontSize: '1rem', color: '#059669', textAlign: 'right', fontWeight: '700' }}>
                            {selectedTransaction.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ብር
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </>
              ) : (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#9ca3af' }}>
                  <p style={{ fontSize: '1rem', margin: 0 }}>No items found for this transaction</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpenseModal && (
        <div
          onClick={() => setShowAddExpenseModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
              backgroundColor: 'white',
              borderRadius: '1rem',
              maxWidth: '500px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '1.5rem',
                borderTopLeftRadius: '1rem',
                borderTopRightRadius: '1rem'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                Add New Expense
              </h3>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Category */}
                <div>
                  <label
                    htmlFor="expense-category"
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}
                  >
                    Category *
                  </label>
                  <select
                    id="expense-category"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  >
                    <option value="">Select Category</option>
                    <option value="office">Office Supplies</option>
                    <option value="utilities">Utilities</option>
                    <option value="rent">Rent</option>
                    <option value="salaries">Salaries</option>
                    <option value="transport">Transport</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="marketing">Marketing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="expense-description"
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}
                  >
                    Description *
                  </label>
                  <input
                    id="expense-description"
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="Enter expense description"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>

                {/* Amount and Date Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Amount */}
                  <div>
                    <label
                      htmlFor="expense-amount"
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Amount (ETB) *
                    </label>
                    <input
                      id="expense-amount"
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label
                      htmlFor="expense-date"
                      style={{
                        display: 'block',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}
                    >
                      Date *
                    </label>
                    <input
                      id="expense-date"
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        border: '1px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label
                    htmlFor="expense-payment"
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}
                  >
                    Payment Method *
                  </label>
                  <select
                    id="expense-payment"
                    value={newExpense.paymentMethod}
                    onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  >
                    <option value="">Select Payment Method</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit">Credit</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="expense-notes"
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}
                  >
                    Notes (Optional)
                  </label>
                  <textarea
                    id="expense-notes"
                    value={newExpense.notes}
                    onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                    placeholder="Additional notes about this expense"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'all 0.2s',
                      resize: 'vertical'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '1.5rem',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}
            >
              <button
                onClick={() => setShowAddExpenseModal(false)}
                style={{
                  padding: '0.625rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb'
                  e.currentTarget.style.borderColor = '#d1d5db'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white'
                  e.currentTarget.style.borderColor = '#e5e7eb'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddExpense}
                disabled={!newExpense.category || !newExpense.description || !newExpense.amount || !newExpense.paymentMethod}
                style={{
                  padding: '0.625rem 1.5rem',
                  background: (!newExpense.category || !newExpense.description || !newExpense.amount || !newExpense.paymentMethod)
                    ? '#e5e7eb'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: (!newExpense.category || !newExpense.description || !newExpense.amount || !newExpense.paymentMethod) 
                    ? 'not-allowed' 
                    : 'pointer',
                  transition: 'all 0.2s',
                  opacity: (!newExpense.category || !newExpense.description || !newExpense.amount || !newExpense.paymentMethod) 
                    ? 0.6 
                    : 1
                }}
                onMouseEnter={(e) => {
                  if (newExpense.category && newExpense.description && newExpense.amount && newExpense.paymentMethod) {
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                Save Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reason View Modal */}
      {showReasonModal && (
        <div 
          onClick={() => setShowReasonModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10002,
            backdropFilter: 'blur(2px)',
            padding: '1rem',
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#111827',
                margin: 0,
              }}>
                Refund Reason
              </h3>
              <button
                onClick={() => setShowReasonModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  color: '#6b7280',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f3f4f6'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div style={{
              padding: '1.5rem',
              maxHeight: '400px',
              overflowY: 'auto',
            }}>
              <p style={{
                fontSize: '0.9375rem',
                color: '#374151',
                lineHeight: '1.6',
                margin: 0,
                whiteSpace: 'pre-wrap',
              }}>
                {selectedReason}
              </p>
            </div>

            {/* Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e5e7eb',
              background: '#f9fafb',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setShowReasonModal(false)}
                style={{
                  padding: '0.625rem 1.25rem',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#2563eb'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#3b82f6'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <AdminBottomNav />
    </>
  )
}
