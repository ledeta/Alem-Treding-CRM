'use client'

import { useState, useEffect } from 'react'
import { X, ShoppingCart, Phone, Mail, MapPin, Send, Package, Zap, TrendingUp, Award, Flame, Clock, User, DollarSign, Users } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import PaymentRequestModal from './PaymentRequestModal'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Customer {
  id: string | number
  name: string
  phone: string
  address?: string
  totalPurchases?: number
  balance?: number
  credit?: number
  refund?: number
  lastTransactionDate?: string
  email?: string
  city?: string
  isActive?: boolean
  createdAt?: string
}

interface Transaction {
  id: number
  transactionId: string
  item: {
    id: number
    name: string
    brand?: string
    model?: string
  }
  quantity: number
  unitPrice: number
  totalAmount: number
  transactionDate: string
  transactionType: string
  status: string
  branch: string
  createdBy?: {
    name: string
  }
  discountAmount?: number
  taxAmount?: number
}

interface Item {
  id: number
  name: string
  brand?: string
  model?: string
  category?: string
  stock?: number
  price?: number
  costPrice?: number
  unitsSold?: number
}

interface CustomerProfileModalProps {
  customer: Customer
  isOpen: boolean
  onClose: () => void
}

export default function CustomerProfileModal({ customer, isOpen, onClose }: CustomerProfileModalProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    if (!isOpen || !customer.id) return

    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Load transactions
        const txResponse = await fetch(
          `${API_URL}/api/transactions/customer/${customer.id}?page=1&limit=100`,
          {
            method: 'GET',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
          }
        )

        if (txResponse.ok) {
          const result = await txResponse.json()
          const txns = result.data || []
          setTransactions(txns)
          
          const total = txns.reduce((sum: number, t: Transaction) => sum + parseFloat(t.totalAmount.toString()), 0)
          setTotalRevenue(total)
        }

        // Load all items from Excel
        const itemsResponse = await fetch(
          `${API_URL}/api/items?page=1&limit=500`,
          {
            method: 'GET',
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
          }
        )

        if (itemsResponse.ok) {
          const result = await itemsResponse.json()
          const itemsList = result.data || []
          setItems(itemsList)
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [customer.id, isOpen])

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true
    return t.transactionType === filterType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-gray-100">
        {/* Premium Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-95"></div>
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-300 opacity-5 rounded-full blur-2xl animate-pulse delay-1000"></div>
          
          <div className="relative p-8 text-white z-10">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 hover:bg-white hover:bg-opacity-20 p-3 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-110 hover:rotate-90"
            >
              <X size={24} />
            </button>

            <div className="flex items-start gap-6">
              {/* Avatar with Status Badge */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 via-white to-pink-200 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/30 backdrop-blur-sm">
                  <span className="text-4xl font-black bg-gradient-to-br from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                    {customer.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-400 border-3 border-white rounded-full shadow-lg animate-pulse"></div>
              </div>
              
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-4xl font-black">{customer.name}</h2>
                  <Award className="text-yellow-300 animate-bounce" size={28} />
                </div>
                <p className="text-white text-opacity-90 text-lg font-bold mb-2">
                  ⭐ Premium Customer Profile
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge className="bg-yellow-300 text-yellow-900 font-black text-xs px-3 py-1">
                    🔥 VIP Client
                  </Badge>
                  <Badge className="bg-green-300 text-green-900 font-black text-xs px-3 py-1">
                    ✓ Active
                  </Badge>
                  <Badge className="bg-blue-300 text-blue-900 font-black text-xs px-3 py-1">
                    📊 {transactions.length} Transactions
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Scrollable Area */}
        <div className="overflow-y-auto flex-1 bg-gradient-to-b from-gray-50 to-white">
          <div className="p-8 space-y-8">
            {/* Contact Information - Premium Card */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-7 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                  <Phone className="text-indigo-600 font-black" size={24} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customer.phone && (
                  <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105">
                    <p className="text-xs text-blue-700 font-black uppercase tracking-widest mb-2">📱 Phone</p>
                    <p className="font-black text-lg text-blue-900 group-hover:text-blue-700 transition-colors">{customer.phone}</p>
                  </div>
                )}
                {customer.email && (
                  <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-300 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105">
                    <p className="text-xs text-purple-700 font-black uppercase tracking-widest mb-2">✉️ Email</p>
                    <p className="font-black text-lg text-purple-900 group-hover:text-purple-700 transition-colors">{customer.email}</p>
                  </div>
                )}
                {customer.address && (
                  <div className="group bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-5 border-2 border-emerald-300 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105">
                    <p className="text-xs text-emerald-700 font-black uppercase tracking-widest mb-2">📍 Address</p>
                    <p className="font-black text-lg text-emerald-900 group-hover:text-emerald-700 transition-colors">{customer.address}</p>
                  </div>
                )}
                {customer.city && (
                  <div className="group bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border-2 border-orange-300 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105">
                    <p className="text-xs text-orange-700 font-black uppercase tracking-widest mb-2">🏙️ City</p>
                    <p className="font-black text-lg text-orange-900 group-hover:text-orange-700 transition-colors">{customer.city}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Items Inventory Section - ALL ITEMS FROM EXCEL */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-7 shadow-md hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl">
                  <Package className="text-violet-600 font-black" size={24} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">📦 Available Items Inventory</h3>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full animate-spin opacity-20"></div>
                    <div className="absolute inset-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : items.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {items.map((item, index) => (
                    <div 
                      key={item.id} 
                      className="group relative bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl p-4 hover:border-violet-500 hover:shadow-lg transition-all duration-300 hover:scale-102 flex items-center justify-between"
                    >
                      {/* Item Index */}
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-lg flex items-center justify-center font-black text-sm shadow-lg">
                        {index + 1}
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 ml-4">
                        <p className="text-lg font-black text-gray-900">{item.name}</p>
                        <div className="flex gap-3 mt-1 flex-wrap">
                          {item.brand && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-lg font-bold">🏷️ {item.brand}</span>}
                          {item.model && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-lg font-bold">📋 {item.model}</span>}
                          {item.category && <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg font-bold">📂 {item.category}</span>}
                        </div>
                      </div>

                      {/* Item Stats */}
                      <div className="flex items-center gap-4 ml-4">
                        {item.stock !== undefined && (
                          <div className="text-center">
                            <p className="text-xs text-gray-600 font-bold uppercase">Stock</p>
                            <p className={`text-xl font-black ${item.stock! > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {item.stock}
                            </p>
                          </div>
                        )}
                        {item.price !== undefined && (
                          <div className="text-center bg-amber-50 px-3 py-2 rounded-lg">
                            <p className="text-xs text-gray-600 font-bold uppercase">Price</p>
                            <p className="text-lg font-black text-amber-700">{formatCurrency(item.price)}</p>
                          </div>
                        )}
                        {item.unitsSold !== undefined && (
                          <div className="text-center">
                            <p className="text-xs text-gray-600 font-bold uppercase">Sold</p>
                            <p className="text-lg font-black text-blue-600">{item.unitsSold}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <Package className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-600 font-bold">No items found in inventory</p>
                </div>
              )}
            </div>

            {/* Account Summary - Premium Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="group bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-blue-400 cursor-pointer overflow-hidden relative">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-black opacity-90 uppercase">Total Spent</p>
                    <TrendingUp size={22} className="opacity-70 group-hover:scale-125 transition-transform" />
                  </div>
                  <p className="text-3xl font-black">{formatCurrency(customer.totalPurchases || 0)}</p>
                  <p className="text-xs opacity-75 mt-2 font-bold">💼 Lifetime Value</p>
                </div>
              </div>

              <div className={`group rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 cursor-pointer overflow-hidden relative ${
                customer.balance! > 0 
                  ? 'bg-gradient-to-br from-red-500 to-red-600 border-red-400' 
                  : 'bg-gradient-to-br from-green-500 to-green-600 border-green-400'
              }`}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-black opacity-90 uppercase">Balance</p>
                    <Zap size={22} className="opacity-70 group-hover:scale-125 transition-transform" />
                  </div>
                  <p className="text-3xl font-black">{formatCurrency(customer.balance || 0)}</p>
                  <p className="text-xs opacity-75 mt-2 font-bold">{customer.balance! > 0 ? '⚠️ Due' : '✅ Credit'}</p>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-amber-400 cursor-pointer overflow-hidden relative">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-black opacity-90 uppercase">Credit</p>
                    <Package size={22} className="opacity-70 group-hover:scale-125 transition-transform" />
                  </div>
                  <p className="text-3xl font-black">{formatCurrency(customer.credit || 0)}</p>
                  <p className="text-xs opacity-75 mt-2 font-bold">💳 Available</p>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 border-2 border-pink-400 cursor-pointer overflow-hidden relative">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-black opacity-90 uppercase">Refund</p>
                    <TrendingUp size={22} className="opacity-70 group-hover:scale-125 transition-transform" />
                  </div>
                  <p className="text-3xl font-black">{formatCurrency(customer.refund || 0)}</p>
                  <p className="text-xs opacity-75 mt-2 font-bold">🔄 Pending</p>
                </div>
              </div>
            </div>

            {/* Transactions Section - Enhanced */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                    <ShoppingCart className="text-indigo-600 font-black" size={28} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-900">📊 Purchase History</h3>
                    <p className="text-sm text-gray-600 font-bold">{filteredTransactions.length} transactions • Total: {formatCurrency(totalRevenue)}</p>
                  </div>
                </div>
              </div>

              {/* Filter Tabs - Enhanced */}
              <div className="flex gap-3 overflow-x-auto pb-3 flex-wrap">
                {['all', 'Sale', 'Payment', 'Credit', 'Refund'].map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-6 py-3 rounded-xl font-black transition-all duration-200 whitespace-nowrap uppercase text-sm tracking-wide border-2 ${
                      filterType === type
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105 border-indigo-400'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {type === 'all' ? '📊 All' : type}
                  </button>
                ))}
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center items-center py-12">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-spin opacity-20"></div>
                    <div className="absolute inset-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-spin"></div>
                  </div>
                </div>
              )}

              {/* Premium Transaction Cards */}
              {!isLoading && filteredTransactions.length > 0 && (
                <div className="space-y-4">
                  {filteredTransactions.map((transaction, index) => (
                    <div 
                      key={transaction.id} 
                      className="group relative bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-indigo-500 hover:shadow-2xl transition-all duration-300 hover:scale-102 overflow-hidden"
                    >
                      {/* Background Gradient on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                      
                      {/* Index Badge */}
                      <div className="absolute top-4 left-4 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-black text-sm shadow-lg">
                        {index + 1}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 items-center">
                        {/* Date - With Calendar Icon */}
                        <div className="lg:col-span-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock size={16} className="text-indigo-600" />
                            <p className="text-xs text-gray-600 font-bold uppercase">Date</p>
                          </div>
                          <p className="text-lg font-black text-gray-900 bg-indigo-50 rounded-lg px-3 py-2 text-center">
                            {formatDate(transaction.transactionDate)}
                          </p>
                        </div>

                        {/* Item Details - Product/Item name */}
                        <div className="lg:col-span-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Package size={16} className="text-purple-600" />
                            <p className="text-xs text-gray-600 font-bold uppercase">Product/Item</p>
                          </div>
                          <div className="bg-purple-50 rounded-lg px-3 py-2">
                            <p className="font-black text-lg text-gray-900">{transaction.item.name}</p>
                            {(transaction.item.brand || transaction.item.model) && (
                              <p className="text-xs text-gray-600 font-bold mt-1">
                                {transaction.item.brand && <span>Brand: {transaction.item.brand}</span>}
                                {transaction.item.brand && transaction.item.model && <span> | </span>}
                                {transaction.item.model && <span>Model: {transaction.item.model}</span>}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="lg:col-span-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Users size={16} className="text-pink-600" />
                            <p className="text-xs text-gray-600 font-bold uppercase"># Units</p>
                          </div>
                          <div className="bg-gradient-to-br from-pink-100 to-rose-100 border-2 border-pink-400 rounded-lg p-2 text-center">
                            <p className="text-2xl font-black text-pink-600">
                              {transaction.quantity}
                            </p>
                          </div>
                        </div>

                        {/* Unit Price */}
                        <div className="lg:col-span-1">
                          <div className="flex items-center gap-2 mb-2">
                            <DollarSign size={16} className="text-yellow-600" />
                            <p className="text-xs text-gray-600 font-bold uppercase">Price/Unit</p>
                          </div>
                          <div className="bg-yellow-50 rounded-lg px-3 py-2 text-center">
                            <p className="text-lg font-black text-yellow-700">
                              {formatCurrency(transaction.unitPrice)}
                            </p>
                          </div>
                        </div>

                        {/* Branch/Shop */}
                        <div className="lg:col-span-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MapPin size={16} className="text-orange-600" />
                            <p className="text-xs text-gray-600 font-bold uppercase">Branch</p>
                          </div>
                          <Badge className="bg-gradient-to-r from-orange-200 to-orange-300 text-orange-900 font-black text-xs px-3 py-2 w-full text-center block">
                            🏪 {transaction.branch}
                          </Badge>
                        </div>

                        {/* Total Amount - Most Important */}
                        <div className="lg:col-span-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Flame size={16} className="text-red-600" />
                            <p className="text-xs text-gray-600 font-bold uppercase">Total</p>
                          </div>
                          <div className="bg-gradient-to-br from-green-100 to-emerald-100 border-3 border-green-500 rounded-lg px-3 py-2 text-center">
                            <p className="text-2xl font-black text-green-600">
                              {formatCurrency(transaction.totalAmount)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Info Bar - Sales Person & Status */}
                      <div className="flex justify-between items-center mt-5 pt-5 border-t-2 border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                            <User size={16} className="text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 font-bold uppercase">Sold By</p>
                            <p className="text-sm font-black text-gray-900">{transaction.createdBy?.name || 'System'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-1.5 rounded-full text-xs font-black border-2 ${getStatusColor(transaction.status)}`}>
                            ✓ {transaction.status}
                          </span>
                        </div>
                      </div>

                      {/* Hover Effect Border */}
                      <div className="absolute inset-0 border-2 border-indigo-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!isLoading && filteredTransactions.length === 0 && (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                  <ShoppingCart className="mx-auto text-gray-300 mb-4" size={64} />
                  <p className="text-gray-600 text-xl font-bold">No transactions found</p>
                  <p className="text-gray-500 text-sm mt-2">Try selecting a different filter</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Premium Footer with Action Buttons */}
        <div className="border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 flex gap-4 justify-between items-center sticky bottom-0 shadow-lg">
          <div className="text-sm text-gray-600 font-semibold">
            <span className="block text-xs uppercase tracking-wide text-gray-500 mb-1">Last Purchase</span>
            <span className="text-gray-900 font-black text-lg">{customer.lastTransactionDate ? formatDate(customer.lastTransactionDate) : 'Never'}</span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl font-black text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all duration-200 hover:scale-105 hover:shadow-lg uppercase text-sm tracking-wide"
            >
              ✕ Close
            </button>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-8 py-3 rounded-xl font-black text-white bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 hover:shadow-2xl transition-all duration-200 hover:scale-105 flex items-center gap-2 shadow-lg border-2 border-emerald-400 uppercase text-sm tracking-wide"
            >
              💳 Payment Request
            </button>
          </div>
        </div>
      </div>

      {/* Payment Request Modal */}
      <PaymentRequestModal
        customer={customer}
        transactions={transactions}
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
      />
    </div>
  )
}
