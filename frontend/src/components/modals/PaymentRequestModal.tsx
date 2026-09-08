'use client'

import { useState } from 'react'
import { X, Send, Eye, EyeOff, CheckCircle, AlertCircle, Copy, Download, ArrowRight } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface PaymentRequestModalProps {
  customer: {
    id: string | number
    name: string
    phone: string
    email?: string
    balance?: number
    credit?: number
  }
  transactions: any[]
  isOpen: boolean
  onClose: () => void
}

export default function PaymentRequestModal({
  customer,
  transactions,
  isOpen,
  onClose,
}: PaymentRequestModalProps) {
  const [amount, setAmount] = useState('')
  const [showAmount, setShowAmount] = useState(false)
  const [notes, setNotes] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('bank')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const totalDue = Math.abs(customer.balance || 0)
  const creditAmount = customer.credit || 0
  const transactionCount = transactions.length

  const handleSubmit = async () => {
    if (!amount || isNaN(parseFloat(amount))) return

    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitted(true)
      setTimeout(() => {
        onClose()
        setSubmitted(false)
        setAmount('')
        setNotes('')
        setSelectedMethod('bank')
      }, 2000)
    } catch (error) {
      console.error('Error submitting payment request:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-hidden flex flex-col border-2 border-emerald-200">
        {/* Premium Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 opacity-95"></div>
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-grid-pattern"></div>
          </div>

          <div className="relative p-8 text-white z-10">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 hover:bg-white hover:bg-opacity-20 p-3 rounded-full transition-all duration-200 backdrop-blur-sm hover:scale-110"
            >
              <X size={24} />
            </button>

            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white bg-opacity-20 rounded-xl">
                <Send size={28} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-black">Payment Invoice</h2>
                <p className="text-emerald-100 text-sm font-semibold">Professional Payment Request</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto flex-1 bg-gradient-to-b from-gray-50 to-white">
          <div className="p-8 space-y-6">
            {submitted ? (
              // Success State
              <div className="text-center py-8 space-y-4">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-400 rounded-full opacity-20 animate-pulse"></div>
                    <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                      <CheckCircle className="text-white" size={40} />
                    </div>
                  </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900">✅ Success!</h3>
                <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-5">
                  <p className="text-gray-700 text-lg font-bold">Payment request sent to</p>
                  <p className="text-2xl font-black text-green-700 mt-2">{customer.name}</p>
                </div>
                <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-4 flex items-center gap-3">
                  <AlertCircle className="text-blue-600 flex-shrink-0" size={24} />
                  <p className="text-sm text-blue-800 font-semibold">Invoice will be sent via SMS & Email</p>
                </div>
              </div>
            ) : (
              <>
                {/* Customer Card - Premium */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl p-6 shadow-md">
                  <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider mb-3">👤 Bill To</p>
                  <p className="text-2xl font-black text-emerald-900">{customer.name}</p>
                  <div className="flex items-center gap-3 mt-3 text-emerald-800">
                    <span className="text-sm font-semibold">📞 {customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-3 mt-2 text-emerald-800">
                      <span className="text-sm font-semibold">📧 {customer.email}</span>
                    </div>
                  )}
                </div>

                {/* Amount Information - Critical */}
                <div className="space-y-4">
                  <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-gray-600 font-bold uppercase">Total Amount Due</p>
                        <p className="text-sm text-gray-700 font-semibold mt-1">
                          Based on {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAmount(!showAmount)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                      >
                        {showAmount ? (
                          <Eye className="text-emerald-600" size={24} />
                        ) : (
                          <EyeOff className="text-gray-400" size={24} />
                        )}
                      </button>
                    </div>
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-4">
                      <p className="text-4xl font-black text-red-600">
                        {showAmount ? formatCurrency(totalDue) : '••••••'}
                      </p>
                    </div>
                    {creditAmount > 0 && (
                      <div className="bg-green-50 border-2 border-green-300 rounded-xl p-3 mt-3">
                        <p className="text-xs text-green-700 font-bold uppercase">💚 Available Credit</p>
                        <p className="text-xl font-bold text-green-700 mt-1">{formatCurrency(creditAmount)}</p>
                      </div>
                    )}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setAmount(totalDue.toString())}
                      className="bg-gradient-to-br from-red-500 to-red-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm"
                    >
                      💯 Full Amount
                    </button>
                    <button
                      onClick={() => setAmount((totalDue / 2).toFixed(2))}
                      className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 text-sm"
                    >
                      ½ Half Payment
                    </button>
                  </div>
                </div>

                {/* Custom Amount Input */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-900 uppercase">
                    📝 Custom Amount (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-gray-700 font-bold text-lg">ETB</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter custom amount"
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 focus:outline-none font-bold text-xl transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Payment Method Selection - Enhanced */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-900 uppercase">💳 Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'bank', label: 'Bank Transfer', emoji: '🏦', color: 'from-blue-500 to-blue-600' },
                      { value: 'mobile', label: 'Mobile Money', emoji: '📱', color: 'from-purple-500 to-purple-600' },
                      { value: 'cash', label: 'Cash Payment', emoji: '💵', color: 'from-green-500 to-green-600' },
                      { value: 'check', label: 'Check', emoji: '✅', color: 'from-orange-500 to-orange-600' },
                    ].map(method => (
                      <button
                        key={method.value}
                        onClick={() => setSelectedMethod(method.value)}
                        className={`p-4 rounded-xl border-3 transition-all duration-200 font-bold text-sm transform ${
                          selectedMethod === method.value
                            ? `bg-gradient-to-br ${method.color} text-white shadow-lg scale-105 border-white`
                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <p className="text-2xl mb-1">{method.emoji}</p>
                        <p>{method.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-900 uppercase">📋 Invoice Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add due date, bank details, or special instructions..."
                    rows={3}
                    className="w-full p-4 border-2 border-gray-300 rounded-2xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200 focus:outline-none resize-none font-medium text-sm transition-all duration-200"
                  />
                </div>

                {/* Invoice Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-2xl p-5">
                  <p className="text-xs text-gray-700 font-bold uppercase mb-3">📄 Invoice Summary</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-700">Amount Requested:</span>
                      <span className="text-gray-900 font-black">{amount ? formatCurrency(parseFloat(amount)) : '—'}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-700">Payment Method:</span>
                      <span className="text-gray-900 font-black capitalize">{selectedMethod}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t border-gray-300">
                      <span className="text-gray-700">Total Transactions:</span>
                      <span className="text-gray-900 font-black">{transactionCount}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {!submitted && (
          <div className="border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6 flex gap-4 sticky bottom-0">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all duration-200 hover:scale-105"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!amount || isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 hover:shadow-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 flex items-center justify-center gap-2 shadow-lg border-2 border-emerald-400"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Invoice
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
