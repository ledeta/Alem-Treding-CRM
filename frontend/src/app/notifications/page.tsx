'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import { Trash2, CheckCircle, Clock, Bell, AlertCircle, Info, BadgeCheck, MessageSquare } from 'lucide-react'

interface Notification {
  id: number
  title: string
  message: string
  type: 'info' | 'success' | 'error' | 'warning' | 'approval' | 'sales-request' | 'chat-message'
  isRead: boolean
  createdAt: Date | string
  metadata?: any
}

// ADMIN NOTIFICATIONS
const ADMIN_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: 'System Alert',
    message: 'Backend is currently unavailable. Real-time notifications will be available soon.',
    type: 'info',
    isRead: false,
    createdAt: new Date(),
  },
  {
    id: 2,
    title: 'Service Status',
    message: 'The application is running in offline mode with limited functionality.',
    type: 'warning',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: 3,
    title: 'New Payment Request',
    message: 'Ahmed Hassan submitted a payment request for 75,000 ብር',
    type: 'approval',
    isRead: true,
    createdAt: new Date(Date.now() - 7200000),
  },
]

// SALES USER NOTIFICATIONS - Only Sales Requests & Chat Messages
const SALES_NOTIFICATIONS: Notification[] = [
  {
    id: 101,
    title: 'New Sales Request',
    message: 'Payment request from John Doe for 50,000 ብር',
    type: 'sales-request',
    isRead: false,
    createdAt: new Date(),
  },
  {
    id: 102,
    title: 'New Chat Message',
    message: 'You have a new message from Admin',
    type: 'chat-message',
    isRead: false,
    createdAt: new Date(Date.now() - 600000),
  },
  {
    id: 103,
    title: 'Request Approved',
    message: 'Your payment request has been approved',
    type: 'success',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000),
  },
]

const notificationConfig = {
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800',
    text: 'text-blue-900',
    accent: 'text-blue-600',
  },
  success: {
    icon: BadgeCheck,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800',
    text: 'text-emerald-900',
    accent: 'text-emerald-600',
  },
  error: {
    icon: AlertCircle,
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'bg-red-100 text-red-800',
    text: 'text-red-900',
    accent: 'text-red-600',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800',
    text: 'text-amber-900',
    accent: 'text-amber-600',
  },
  approval: {
    icon: BadgeCheck,
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-800',
    text: 'text-purple-900',
    accent: 'text-purple-600',
  },
  'sales-request': {
    icon: Bell,
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-800',
    text: 'text-violet-900',
    accent: 'text-violet-600',
  },
  'chat-message': {
    icon: MessageSquare,
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    badge: 'bg-cyan-100 text-cyan-800',
    text: 'text-cyan-900',
    accent: 'text-cyan-600',
  },
}

export default function NotificationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'approval' | 'sales' | 'chat'>('all')
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Set notifications based on role
      if (parsedUser.role === 'admin') {
        setNotifications(ADMIN_NOTIFICATIONS)
      } else if (parsedUser.role === 'Sales User') {
        setNotifications(SALES_NOTIFICATIONS)
      }
    } else {
      router.push('/login')
    }
  }, [router])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const markAsRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const deleteNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'approval') return n.type === 'approval'
    if (filter === 'sales') return n.type === 'sales-request'
    if (filter === 'chat') return n.type === 'chat-message'
    return true
  })

  const getTimeAgo = (date: string | Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return new Date(date).toLocaleDateString()
  }

  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">Loading...</p>
        </div>
      </MainLayout>
    )
  }

  // Get filter buttons based on role
  const getFilterButtons = () => {
    if (user.role === 'admin') {
      return ['all', 'unread', 'approval'] as const
    } else {
      return ['all', 'unread', 'sales', 'chat'] as const
    }
  }

  const filterButtons = getFilterButtons()
  const getFilterLabel = (f: string) => {
    switch (f) {
      case 'all':
        return 'All'
      case 'unread':
        return `Unread (${unreadCount})`
      case 'approval':
        return 'Approvals'
      case 'sales':
        return 'Sales Requests'
      case 'chat':
        return 'Chat Messages'
      default:
        return f
    }
  }

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-gradient-to-br from-white via-violet-50 to-purple-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-white to-violet-50 border-b border-violet-200 px-6 py-6 shadow-sm">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Notifications
          </h1>
          <p className="text-sm text-violet-600">Stay updated with all your important messages and alerts</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white border-b border-violet-100 px-6 py-4 shadow-sm">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {filterButtons.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  filter === f
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getFilterLabel(f)}
              </button>
            ))}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="mt-3 px-4 py-2 text-sm text-violet-600 hover:text-violet-700 font-medium hover:bg-violet-50 rounded-lg transition-colors"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {filteredNotifications.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">🔕</div>
                <p className="text-violet-600 text-lg font-medium">All caught up!</p>
                <p className="text-violet-500 text-sm mt-2">
                  {filter === 'unread' && 'No unread notifications'}
                  {filter === 'approval' && 'No pending approvals'}
                  {filter === 'sales' && 'No sales requests'}
                  {filter === 'chat' && 'No chat messages'}
                  {filter === 'all' && 'No notifications yet'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => {
                const config = notificationConfig[notification.type]
                const IconComponent = config.icon

                return (
                  <div
                    key={notification.id}
                    className={`rounded-xl border-2 p-4 transition-all hover:shadow-lg ${config.bg} ${config.border} ${
                      !notification.isRead ? 'ring-2 ring-violet-300' : ''
                    }`}
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 p-3 rounded-lg ${config.badge}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3 className={`font-bold text-sm ${config.text}`}>{notification.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                            <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {getTimeAgo(notification.createdAt)}
                              </span>
                              {!notification.isRead && (
                                <span className={`px-2 py-1 rounded-full font-medium ${config.badge}`}>
                                  New
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 ml-2 flex-shrink-0">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                title="Mark as read"
                                className={`p-2 rounded-lg transition-colors hover:bg-white hover:bg-opacity-50 ${config.accent}`}
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              title="Delete"
                              className="p-2 text-red-500 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Metadata */}
                        {notification.metadata && (
                          <div className="mt-3 p-2 bg-white bg-opacity-50 rounded text-xs text-gray-600 space-y-1">
                            {Object.entries(notification.metadata).map(([key, value]) => (
                              <div key={key}>
                                <strong>{key}:</strong> {String(value)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Info Banner */}
        <div className="border-t border-violet-200 bg-amber-50 px-6 py-4 shadow-sm">
          <div className="flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>Offline Mode:</strong> The application is running in offline mode. Real-time notifications will
              be available when the backend service is restored.
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
