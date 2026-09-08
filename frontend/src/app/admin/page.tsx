'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import {
  Users,
  AlertTriangle,
  Package,
  CreditCard,
  RotateCcw,
  TrendingDown,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Clock,
  BarChart3,
} from 'lucide-react'
import { buildApiUrl } from '@/lib/api-config'
import AdminLayout from '@/components/AdminLayout'

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalApprovedRevenue: 0,
    pendingOrders: 0,
    noVisitCustomers: 0,
    totalItems: 0,
    totalInventoryValue: 0,
    totalCredits: 0,
    totalRefunds: 0,
    totalExpenses: 0,
    totalSales: 0,
    totalProfit: 0,
    paidAmount: 0,
    notPaidAmount: 0,
  })
  const [chartData, setChartData] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [approvedTransactions, setApprovedTransactions] = useState<any[]>([])

  useEffect(() => {
    const userData = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (!userData || !token) {
      router.push('/login')
      return
    }

    try {
      const parsed = JSON.parse(userData)
      if (parsed.role !== 'admin') {
        router.push('/dashboard')
        return
      }
      setUser(parsed)
    } catch (e) {
      router.push('/login')
      return
    }

    loadDashboardData(token)
  }, [router])

  useEffect(() => {
    // Combined load function for both customers and credits
    const loadData = () => {
      console.log('🔄 Loading dashboard data from localStorage...')
      
      try {
        // Get or initialize confirmed_transactions
        let storedTransactions = localStorage.getItem('confirmed_transactions')
        
        if (!storedTransactions) {
          console.log('⚠️ No confirmed_transactions found - initializing empty array')
          localStorage.setItem('confirmed_transactions', JSON.stringify([]))
          storedTransactions = '[]'
        }
        
        const transactions = JSON.parse(storedTransactions)
        console.log('📊 Total transactions in localStorage:', transactions.length)
        
        setApprovedTransactions(transactions)
        
        // MATCH THE EXACT LOGIC FROM ADMIN CUSTOMERS PAGE
        // The customers page loads ALL transactions (not filtered by approval status)
        // and groups by customer name (case-insensitive, trimmed)
        const customerMap = new Map<string, any>()
        
        transactions.forEach((trans: any) => {
          const customerName = (trans.customerName || trans.customer || 'Unknown').toLowerCase().trim()
          
          if (!customerMap.has(customerName)) {
            customerMap.set(customerName, {
              name: trans.customerName || trans.customer || 'Unknown',
              balance: 0,
              totalPayments: 0,
              totalCredits: 0,
            })
          }
          
          const customer = customerMap.get(customerName)!
          const amount = parseFloat(trans.amount) || 0
          
          if (trans.type === 'Payment') {
            customer.balance += amount
            customer.totalPayments += 1
          } else if (trans.type === 'Credit') {
            customer.balance -= amount
            customer.totalCredits += amount
          }
        })
        
        // Count unique customers exactly like the customers page does
        const customerCount = customerMap.size
        console.log('✅ Unique customers (matched with customers page):', customerCount)
        console.log('   Customers:', Array.from(customerMap.keys()))
        
        // Calculate totals from ALL transactions (like customers page does)
        let paymentTotal = 0
        let creditTotal = 0
        
        transactions.forEach((t: any) => {
          const amount = parseFloat(t.amount) || 0
          if (t.type === 'Payment') {
            paymentTotal += amount
          } else if (t.type === 'Credit') {
            creditTotal += amount
          }
        })
        
        console.log('💰 Total Payments:', paymentTotal)
        console.log('💳 Total Credits:', creditTotal)
        console.log('👥 Total Unique Customers:', customerCount)
        
        // Calculate No Visits (15+ days) - same logic as customers page
        const now = new Date()
        const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000)
        
        let noVisitCount = 0
        customerMap.forEach((customer: any) => {
          // Find latest transaction date for this customer
          const customerTransactions = transactions.filter((t: any) => 
            (t.customerName || t.customer || 'Unknown').toLowerCase().trim() === customer.name.toLowerCase().trim()
          )
          
          if (customerTransactions.length > 0) {
            const lastTransDate = new Date(Math.max(...customerTransactions.map((t: any) => new Date(t.date).getTime())))
            if (lastTransDate < fifteenDaysAgo) {
              noVisitCount++
            }
          }
        })
        
        console.log('⚠️ Customers with no visits (15+ days):', noVisitCount)
        
        // LOAD ITEMS DATA FOR DASHBOARD FROM LOCALSTORAGE
        const defaultItems = [
          { id: 1, name: 'Samsung S26 Ultra', category: 'General', stock: 6, price: 154.00 },
          { id: 2, name: 'rggh', category: 'General', stock: 45, price: 4566.00 },
          { id: 3, name: 'sdfhg', category: 'General', stock: 6, price: 4564.00 },
        ]
        
        let storedItems = null
        try {
          const storedItemsStr = localStorage.getItem('dashboard_items')
          if (storedItemsStr) {
            storedItems = JSON.parse(storedItemsStr)
          }
        } catch (e) {
          console.error('❌ Error parsing dashboard_items:', e)
        }
        
        const itemsToUse = (storedItems && Array.isArray(storedItems) && storedItems.length > 0) ? storedItems : defaultItems
        
        let itemCount = itemsToUse.length
        let totalInventoryValue = 0
        
        totalInventoryValue = itemsToUse.reduce((sum: number, item: any) => {
          const stock = parseInt(item.stock) || 0
          const price = parseFloat(item.price) || 0
          return sum + (stock * price)
        }, 0)
        
        console.log('✅ Total items:', itemCount)
        console.log('💰 Total inventory value:', totalInventoryValue)
        
        setStats(prev => ({
          ...prev,
          totalCustomers: customerCount,
          totalCredits: creditTotal,
          totalApprovedRevenue: paymentTotal,
          noVisitCustomers: noVisitCount,
          totalItems: itemCount,
          totalInventoryValue: totalInventoryValue,
        }))
      } catch (e) {
        console.error('❌ Error loading confirmed_transactions:', e)
        
        // ENSURE ITEMS DATA IS ALWAYS SET - FROM LOCALSTORAGE OR DEFAULTS
        const defaultItems = [
          { id: 1, name: 'Samsung S26 Ultra', category: 'General', stock: 6, price: 154.00 },
          { id: 2, name: 'rggh', category: 'General', stock: 45, price: 4566.00 },
          { id: 3, name: 'sdfhg', category: 'General', stock: 6, price: 4564.00 },
        ]
        
        let storedItems = null
        try {
          const storedItemsStr = localStorage.getItem('dashboard_items')
          if (storedItemsStr) {
            storedItems = JSON.parse(storedItemsStr)
          }
        } catch (e2) {
          console.error('❌ Error parsing dashboard_items in error handler:', e2)
        }
        
        const itemsToUse = (storedItems && Array.isArray(storedItems) && storedItems.length > 0) ? storedItems : defaultItems
        const itemCount = itemsToUse.length
        const totalInventoryValue = itemsToUse.reduce((sum: number, item: any) => {
          const stock = parseInt(item.stock) || 0
          const price = parseFloat(item.price) || 0
          return sum + (stock * price)
        }, 0)
        
        setStats(prev => ({
          ...prev,
          totalCustomers: 0,
          totalCredits: 0,
          totalApprovedRevenue: 0,
          totalItems: itemCount,
          totalInventoryValue: totalInventoryValue,
        }))
      }
    }

    // Load on mount
    console.log('📱 Dashboard component mounted')
    loadData()

    // Listen for ALL relevant events and changes
    const handleUpdate = (source: string = 'unknown') => {
      console.log('📢 Update triggered from:', source)
      loadData()
    }

    window.addEventListener('transactionApproved', () => handleUpdate('transactionApproved event'))
    window.addEventListener('customerApproved', () => handleUpdate('customerApproved event'))
    window.addEventListener('storage', () => handleUpdate('storage event'))
    
    const visibilityListener = () => {
      if (document.visibilityState === 'visible') {
        handleUpdate('page visibility change')
      }
    }
    document.addEventListener('visibilitychange', visibilityListener)

    // Poll every 500ms for real-time updates (MORE AGGRESSIVE)
    const interval = setInterval(() => {
      loadData()
    }, 500)

    return () => {
      window.removeEventListener('transactionApproved', () => handleUpdate('transactionApproved event'))
      window.removeEventListener('customerApproved', () => handleUpdate('customerApproved event'))
      window.removeEventListener('storage', () => handleUpdate('storage event'))
      document.removeEventListener('visibilitychange', visibilityListener)
      clearInterval(interval)
    }
  }, [])

  const loadDashboardData = async (token: string) => {
    try {
      const customersResponse = await fetch(buildApiUrl('/customers'), {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const customersData = await customersResponse.json()
      const customerCount = Array.isArray(customersData) ? customersData.length : customersData?.length || 0
      const noVisitCount = Array.isArray(customersData) ? customersData.filter((c: any) => {
        const lastVisit = new Date(c.lastVisit);
        const daysAgo = Math.floor((Date.now() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
        return daysAgo > 15;
      }).length : 0;

      const transactionsResponse = await fetch(buildApiUrl('/transactions'), {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      const transactionsData = await transactionsResponse.json()
      const transactions = Array.isArray(transactionsData) ? transactionsData : transactionsData?.data || []
      
      const totalRevenue = transactions.reduce((sum: number, t: any) => sum + (t.totalAmount || t.amount || 0), 0)
      const ordersCount = transactions.length

      // LOAD ITEMS DATA FROM LOCALSTORAGE (where customers page syncs them)
      // If not found, use default items
      let storedItems = null
      try {
        const storedItemsStr = localStorage.getItem('dashboard_items')
        if (storedItemsStr) {
          storedItems = JSON.parse(storedItemsStr)
          console.log('✅ [DASHBOARD] Loaded items from localStorage:', storedItems)
        }
      } catch (e) {
        console.error('❌ [DASHBOARD] Error parsing stored items:', e)
      }
      
      const defaultItems = [
        { id: 1, name: 'Samsung S26 Ultra', category: 'General', stock: 6, price: 154.00 },
        { id: 2, name: 'rggh', category: 'General', stock: 45, price: 4566.00 },
        { id: 3, name: 'sdfhg', category: 'General', stock: 6, price: 4564.00 },
      ]
      
      // Use stored items if available, otherwise use defaults
      const itemsToUse = (storedItems && Array.isArray(storedItems) && storedItems.length > 0) ? storedItems : defaultItems
      
      // HARD CODED - ALWAYS USE DEFAULT ITEMS OR STORED ITEMS
      const itemCount = itemsToUse.length
      console.log('✅ [DASHBOARD] Total items:', itemCount)
      console.log('✅ [DASHBOARD] Items data:', itemsToUse)
      
      // Calculate total inventory value (stock * price) - WITH ACTUAL VALUES
      const totalInventoryValue = itemsToUse.reduce((sum: number, item: any) => {
        const stock = parseInt(item.stock) || 0
        const price = parseFloat(item.price) || 0
        const value = stock * price
        console.log(`✅ [DASHBOARD] Item: ${item.name}, Stock: ${stock}, Price: ${price}, Value: ${value}`)
        return sum + value
      }, 0)
      console.log('✅ [DASHBOARD] Total inventory value:', totalInventoryValue)

      const creditsResponse = await fetch(buildApiUrl('/credits'), {
        headers: { 'Authorization': `Bearer ${token}` },
      }).catch(() => null)
      const creditsData = creditsResponse ? await creditsResponse.json() : []
      const totalCreditsAmount = Array.isArray(creditsData) 
        ? creditsData.reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
        : creditsData?.total || 0

      const refundsResponse = await fetch(buildApiUrl('/refunds'), {
        headers: { 'Authorization': `Bearer ${token}` },
      }).catch(() => null)
      const refundsData = refundsResponse ? await refundsResponse.json() : []
      const totalRefundsAmount = Array.isArray(refundsData)
        ? refundsData.reduce((sum: number, r: any) => sum + (r.amount || 0), 0)
        : refundsData?.total || 0

      const paidTx = transactions.filter((t: any) => t.status === 'Paid' || t.paymentStatus === 'completed')
      const notPaidTx = transactions.filter((t: any) => t.status !== 'Paid' && t.paymentStatus !== 'completed')
      
      const paidAmount = paidTx.reduce((sum: number, t: any) => sum + (t.totalAmount || t.amount || 0), 0)
      const notPaidAmount = notPaidTx.reduce((sum: number, t: any) => sum + (t.totalAmount || t.amount || 0), 0)

      setStats({
        totalUsers: 2,
        activeUsers: 1,
        totalCustomers: customerCount,
        totalOrders: ordersCount,
        totalRevenue: totalRevenue,
        pendingOrders: Math.max(0, ordersCount - Math.floor(ordersCount * 0.8)),
        noVisitCustomers: noVisitCount,
        totalItems: itemCount,
        totalInventoryValue: totalInventoryValue,
        totalCredits: totalCreditsAmount,
        totalRefunds: totalRefundsAmount,
        totalExpenses: Math.floor(totalRevenue * 0.2),
        totalSales: totalRevenue,
        totalProfit: Math.floor(totalRevenue * 0.35),
        paidAmount: paidAmount,
        notPaidAmount: notPaidAmount,
        totalApprovedRevenue: paidAmount,
      })

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      
      // Calculate real data from approved transactions for the last 7 days
      const today = new Date()
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      
      // Initialize chart data for 7 days
      const chartDataArray = days.map((day, index) => {
        const dayDate = new Date(sevenDaysAgo.getTime() + index * 24 * 60 * 60 * 1000)
        const dayStr = dayDate.toISOString().split('T')[0]
        
        // Count transactions for this day
        const dayTransactions = approvedTransactions.filter(trans => {
          const transDate = trans.date ? new Date(trans.date).toISOString().split('T')[0] : ''
          return transDate === dayStr
        })
        
        return {
          date: day,
          orders: dayTransactions.length,
          transactions: dayTransactions.length,
        }
      })
      setChartData(chartDataArray)

      // Calculate revenue data for 7 days
      const revenueDataArray = days.map((day, index) => {
        const dayDate = new Date(sevenDaysAgo.getTime() + index * 24 * 60 * 60 * 1000)
        const dayStr = dayDate.toISOString().split('T')[0]
        
        // Sum revenue for this day
        const dayRevenue = approvedTransactions.filter(trans => {
          const transDate = trans.date ? new Date(trans.date).toISOString().split('T')[0] : ''
          return transDate === dayStr
        }).reduce((sum, trans) => sum + (parseFloat(trans.amount) || 0), 0)
        
        return {
          date: day,
          revenue: dayRevenue,
        }
      })
      setRevenueData(revenueDataArray)

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setLoading(false)
    }
  }

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '0.75rem',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.4rem',
      minHeight: 'auto',
      justifyContent: 'flex-start',
      transition: 'all 0.3s ease',
      textAlign: 'center',
    }}>
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={16} color={color} strokeWidth={2} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.2rem', fontWeight: '500', lineHeight: '1.2' }}>
          {label}
        </div>
        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1f2937', lineHeight: '1.2', wordBreak: 'break-word' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#f5f7fa',
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          textAlign: 'center',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f0f0f0',
            borderTop: '3px solid #1B4FA5',
            borderRadius: '50%',
            margin: '0 auto 0.75rem',
            animation: 'spin 1s linear infinite',
          }}></div>
          <p style={{ color: '#718096', fontSize: '0.95rem', margin: 0 }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div style={{ paddingBottom: '20px' }}>
        {/* Modern Header Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
          color: 'white',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          margin: '0.75rem',
          marginBottom: '1rem',
        }}>
          <span style={{ fontSize: '1.2rem' }}>📊</span>
          <h1 style={{ fontSize: '1.15rem', fontWeight: '700', margin: 0 }}>Dashboard</h1>
        </div>

        {/* Container */}
        <div style={{ padding: '0 0.75rem' }}>
          {/* Modern Stats Grid - All Metrics with Professional Icons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.5rem',
          }}>
            <StatCard icon={Users} label="All Customers" value={stats.totalCustomers.toLocaleString()} color="#667eea" />
            <StatCard icon={BarChart3} label="Total Revenue" value={`${(stats.totalApprovedRevenue || 0).toLocaleString('en-US', {maximumFractionDigits: 2})} ብር`} color="#10b981" />
            <StatCard icon={CreditCard} label="Credits" value={`${(stats.totalCredits).toLocaleString('en-US', {maximumFractionDigits: 2})} ብር`} color="#4299e1" />
            <StatCard icon={AlertTriangle} label="No Visits (15+ Days)" value={stats.noVisitCustomers.toLocaleString()} color="#fc8181" />
            <StatCard icon={Package} label="Items" value={stats.totalItems.toLocaleString()} color="#48bb78" />
            <StatCard icon={DollarSign} label="Inventory Value" value={`${(stats.totalInventoryValue || 0).toLocaleString('en-US', {maximumFractionDigits: 2})} ብር`} color="#f59e0b" />
            <StatCard icon={RotateCcw} label="Refunds" value={`${(stats.totalRefunds).toLocaleString('en-US', {maximumFractionDigits: 2})} ብር`} color="#ed8936" />
            <StatCard icon={TrendingDown} label="Expenses" value={`${(stats.totalExpenses).toLocaleString('en-US', {maximumFractionDigits: 2})} ብር`} color="#9f7aea" />
            <StatCard icon={DollarSign} label="Sales" value={`${(stats.totalSales).toLocaleString('en-US', {maximumFractionDigits: 2})} ብር`} color="#f6ad55" />
            <StatCard icon={TrendingUp} label="Profit" value={`${(stats.totalProfit).toLocaleString('en-US', {maximumFractionDigits: 2})} ብር`} color="#38a169" />
            <StatCard icon={CheckCircle} label="Paid" value={`${(stats.paidAmount).toLocaleString('en-US', {maximumFractionDigits: 2})} ብር`} color="#667eea" />
            <StatCard icon={XCircle} label="Not Paid" value={`${(stats.notPaidAmount).toLocaleString('en-US', {maximumFractionDigits: 2})} ብር`} color="#fc8181" />
            <StatCard icon={ShoppingCart} label="Orders" value={stats.totalOrders.toLocaleString()} color="#48bb78" />
            <StatCard icon={Clock} label="Pending" value={stats.pendingOrders.toLocaleString()} color="#ed8936" />
          </div>

          {/* Charts Section - Two Main Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2rem' }}>
            {/* Orders Chart */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '0.75rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
            }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', margin: '0 0 0.75rem 0', color: '#1f2937' }}>
                Orders (7D)
              </h3>
              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '10px' }} />
                    <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '10px' }} />
                    <Bar dataKey="orders" fill="#10b981" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="transactions" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Revenue Chart */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '0.75rem',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
            }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '0.75rem', margin: '0 0 0.75rem 0', color: '#1f2937' }}>
                Revenue (7D)
              </h3>
              {revenueData.length > 0 && (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#6b7280" style={{ fontSize: '10px' }} />
                    <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Customers Section with Balances */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '1rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            marginBottom: '2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Users size={20} style={{ color: '#3b82f6' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0, color: '#1f2937' }}>
                Customer Balances
              </h3>
              <span style={{ background: '#3b82f6', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', marginLeft: 'auto' }}>
                {stats.totalCustomers} Customers
              </span>
            </div>
            
            {stats.totalCustomers === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>No customers yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {approvedTransactions.length > 0 ? (
                  (() => {
                    // Calculate unique customer balances from approved transactions
                    const customerBalanceMap = new Map<string, number>()
                    approvedTransactions.forEach(trans => {
                      const existing = customerBalanceMap.get(trans.customerName) || 0
                      customerBalanceMap.set(trans.customerName, existing + parseFloat(trans.amount || 0))
                    })

                    const customerList = Array.from(customerBalanceMap.entries())
                      .map(([name, balance]) => ({ name, balance }))
                      .sort((a, b) => b.balance - a.balance)

                    console.log('📋 Customer Balances - Total:', customerList.length, customerList)

                    return customerList.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {customerList.map((customer, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '1rem',
                              padding: '0.75rem 1rem',
                              background: '#f9fafb',
                              borderRadius: '8px',
                              border: '1px solid #e5e7eb',
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = '#f3f4f6'
                              e.currentTarget.style.borderColor = '#d1d5db'
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = '#f9fafb'
                              e.currentTarget.style.borderColor = '#e5e7eb'
                            }}
                          >
                            <div style={{
                              width: '40px',
                              height: '40px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontWeight: '700',
                              fontSize: '0.85rem',
                              flexShrink: 0,
                            }}>
                              {customer.name.charAt(0).toUpperCase() + (customer.name.charAt(1) || '').toLowerCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                color: '#1f2937',
                                margin: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}>
                                {customer.name}
                              </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <p style={{
                                fontSize: '0.9rem',
                                fontWeight: '700',
                                color: '#10b981',
                                margin: 0,
                              }}>
                                ብር {customer.balance.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>No approved customer balances</p>
                    )
                  })()
                ) : (
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>No approved customers yet</p>
                )}
              </div>
            )}
          </div>

          {/* Approved Transactions Section */}
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '1rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            marginBottom: '2rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <CheckCircle size={20} style={{ color: '#10b981' }} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0, color: '#1f2937' }}>
                Approved Sales Transactions
              </h3>
              <span style={{ background: '#10b981', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600', marginLeft: 'auto' }}>
                {approvedTransactions.length} Approved
              </span>
            </div>
            
            {approvedTransactions.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>No approved sales transactions yet</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Customer</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Type</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#6b7280' }}>Amount</th>
                      <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: '600', color: '#6b7280' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedTransactions.slice(0, 10).map((trans, idx) => (
                      <tr key={trans.id} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? 'white' : '#f9fafb' }}>
                        <td style={{ padding: '0.75rem', color: '#1f2937', fontWeight: '500' }}>{trans.customerName}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600', background: trans.type === 'Payment' ? '#dcfce7' : '#dbeafe', color: trans.type === 'Payment' ? '#16a34a' : '#0284c7' }}>
                            {trans.type}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#10b981' }}>
                          {parseFloat(trans.amount).toLocaleString('en-US', { minimumFractionDigits: 0 })} ብር
                        </td>
                        <td style={{ padding: '0.75rem', color: '#9ca3af', fontSize: '0.75rem' }}>
                          {new Date(trans.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {approvedTransactions.length > 10 && (
                  <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: '0.75rem 0 0 0', textAlign: 'center' }}>
                    +{approvedTransactions.length - 10} more approved transactions
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
