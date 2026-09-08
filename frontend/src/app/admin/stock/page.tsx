'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import AdminBottomNav from '@/components/AdminBottomNav'
import { formatCurrency } from '@/lib/utils'
import { MOCK_ITEMS } from '@/lib/mock-data'
import { Package, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface StockItem {
  id: string | number
  name?: string
  itemName?: string
  sku?: string
  category?: string
  quantity?: number
  stock?: number
  price?: number
  purchasePrice?: number
  costPrice?: number
  sellingPrice?: number
  minStockLevel?: number
  reorderLevel?: number
  lastRestocked?: string
}

interface FormData {
  name: string
  category: string
  quantity: number
  purchasePrice: number
  sellingPrice: number
  minStockLevel: number
}

const CATEGORIES = ['Accessories', 'Electronics', 'Screen', 'Other']
const INITIAL_FORM = {
  name: '',
  category: 'Accessories',
  quantity: 0,
  purchasePrice: 0,
  sellingPrice: 0,
  minStockLevel: 10,
}

export default function StockPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [items, setItems] = useState<StockItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [tokenReady, setTokenReady] = useState(false)
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else {
      setTokenReady(true)
    }
  }, [router])

  useEffect(() => {
    if (!tokenReady) return

    const loadItems = () => {
      try {
        // Try to load from localStorage first
        const storedItems = localStorage.getItem('items_data')
        let data = []

        if (storedItems) {
          try {
            data = JSON.parse(storedItems)
          } catch (e) {
            data = MOCK_ITEMS
          }
        } else {
          // Use mock data as fallback
          data = MOCK_ITEMS
        }

        // Ensure data is an array
        if (!Array.isArray(data)) {
          data = data.data || MOCK_ITEMS
        }

        setItems(data)
      } catch (error) {
        console.error('Error loading items:', error)
        setItems(MOCK_ITEMS)
      } finally {
        setIsLoading(false)
      }
    }

    loadItems()
  }, [tokenReady])

  const filteredItems = items.filter((item: StockItem) => {
    const name = (item.name || item.itemName || '').toLowerCase()
    const sku = (item.sku || '').toLowerCase()
    const category = (item.category || '').toLowerCase()
    const search = searchTerm.toLowerCase()
    return name.includes(search) || sku.includes(search) || category.includes(search)
  })

  const lowStockItems = filteredItems.filter((item: StockItem) => {
    const qty = item.quantity || item.stock || 0
    const minLevel = item.minStockLevel || item.reorderLevel || 10
    return qty <= minLevel
  })

  const stats = {
    total: filteredItems.length,
    lowStock: lowStockItems.length,
    totalValue: filteredItems.reduce((sum: number, item: StockItem) => {
      const qty = item.quantity || item.stock || 0
      const price = item.sellingPrice || item.price || 0
      return sum + (qty * price)
    }, 0),
    totalCost: filteredItems.reduce((sum: number, item: StockItem) => {
      const qty = item.quantity || item.stock || 0
      const cost = item.purchasePrice || item.costPrice || 0
      return sum + (qty * cost)
    }, 0),
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'name' || name === 'category' ? value : parseFloat(value) || 0
    }))
  }

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.name.trim()) {
      toast.error('Item name is required')
      return
    }
    if (formData.sellingPrice <= 0) {
      toast.error('Selling price must be greater than 0')
      return
    }

    try {
      const newItem: StockItem = {
        id: items.length + 1,
        name: formData.name,
        itemName: formData.name,
        sku: `ITEM${String(items.length + 1).padStart(3, '0')}`,
        category: formData.category,
        stock: formData.quantity,
        quantity: formData.quantity,
        costPrice: formData.purchasePrice,
        purchasePrice: formData.purchasePrice,
        price: formData.sellingPrice,
        sellingPrice: formData.sellingPrice,
        reorderLevel: formData.minStockLevel,
        minStockLevel: formData.minStockLevel,
        lastRestocked: new Date().toISOString(),
      }

      const updatedItems = [...items, newItem]
      setItems(updatedItems)
      localStorage.setItem('items_data', JSON.stringify(updatedItems))

      setFormData(INITIAL_FORM)
      setShowForm(false)
      toast.success('Item added successfully!')
    } catch (error) {
      console.error('Error adding item:', error)
      toast.error('Failed to add item')
    }
  }

  const columns: ColumnDef<StockItem>[] = [
    {
      accessorKey: 'name',
      header: 'Item Name',
      cell: ({ row }) => {
        const item = row.original
        const name = item.name || item.itemName || 'N/A'
        return <span className="font-medium">{name}</span>
      },
    },
    {
      accessorKey: 'sku',
      header: 'SKU',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-gray-600">{row.getValue('sku') || 'N/A'}</span>
      ),
    },
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'stock',
      header: 'Stock Level',
      cell: ({ row }) => {
        const item = row.original
        const qty = item.quantity || item.stock || 0
        const minLevel = item.minStockLevel || item.reorderLevel || 10
        const isLow = qty <= minLevel
        return (
          <div className="flex items-center gap-2">
            <span className={isLow ? 'font-bold text-danger' : 'font-bold'}>
              {qty}
            </span>
            {isLow && <AlertTriangle size={16} className="text-danger" />}
          </div>
        )
      },
    },
    {
      accessorKey: 'costPrice',
      header: 'Purchase Price',
      cell: ({ row }) => {
        const item = row.original
        const price = item.purchasePrice || item.costPrice || 0
        return formatCurrency(price)
      },
    },
    {
      accessorKey: 'price',
      header: 'Selling Price',
      cell: ({ row }) => {
        const item = row.original
        const price = item.sellingPrice || item.price || 0
        return (
          <span className="font-semibold text-success">
            {formatCurrency(price)}
          </span>
        )
      },
    },
    {
      id: 'totalValue',
      header: 'Total Value',
      cell: ({ row }) => {
        const item = row.original
        const qty = item.quantity || item.stock || 0
        const price = item.sellingPrice || item.price || 0
        const value = qty * price
        return (
          <span className="font-bold text-secondary">
            {formatCurrency(value)}
          </span>
        )
      },
    },
  ]

  if (!tokenReady) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6" style={{ paddingBottom: '140px' }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Stock Management</h1>
          <p className="text-gray-600 text-sm mt-1">Track inventory levels and manage stock</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          + Add Item
        </Button>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Alert variant="warning" title="Low Stock Alert">
          {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} below minimum stock level
        </Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Items</p>
            <p className="text-2xl font-bold text-secondary">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Low Stock Items</p>
            <p className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-danger' : 'text-success'}`}>
              {stats.lowStock}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Stock Value</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(stats.totalValue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total Cost</p>
            <p className="text-2xl font-bold text-warning">{formatCurrency(stats.totalCost)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by item name, SKU, or category..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Table */}
      {isLoading ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Loading stock items...
          </CardContent>
        </Card>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<Package />}
          title="No stock items"
          description="Start by adding items to your inventory"
          action={
            <Button onClick={() => setShowForm(true)}>
              Add First Item
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={filteredItems} />
      )}

      {/* Add Item Modal */}
      {showForm && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowForm(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              zIndex: 10000,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1a2332' }}>
                Add New Item
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#718096', marginTop: '0.5rem' }}>
                Add a new item to your inventory
              </p>
            </div>

            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Item Name */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>
                  Item Name <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter item name"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    backgroundColor: 'white',
                  }}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>
                  Initial Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Purchase Price */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>
                  Purchase Price
                </label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Selling Price */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>
                  Selling Price <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Minimum Stock Level */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#2d3748' }}>
                  Minimum Stock Level
                </label>
                <input
                  type="number"
                  name="minStockLevel"
                  value={formData.minStockLevel}
                  onChange={handleInputChange}
                  placeholder="10"
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#1B4FA5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0D2B5F'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1B4FA5'}
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData(INITIAL_FORM)
                  }}
                  style={{
                    flex: 1,
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#e2e8f0',
                    color: '#2d3748',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#cbd5e0'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
      <AdminBottomNav />
    </>
  )
}


