'use client'

import { useEffect, useState, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { io, Socket } from 'socket.io-client'
import { apiClient } from '@/lib/api-client'
import { useAuthStore } from '@/store/auth-store'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  type: 'upload' | 'payment' | 'credit' | 'refund' | 'approval' | 'system'
  title: string
  message: string
  relatedId?: string
  read: boolean
  createdAt: string
}

export function useNotifications() {
  const { user } = useAuthStore()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const queryClient = useQueryClient()

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiClient.get('/notifications'),
    enabled: !!user,
  })

  const notifications: Notification[] = notificationsData?.notifications || []
  const unreadCount: number = notificationsData?.unreadCount || 0

  // Initialize WebSocket
  useEffect(() => {
    if (!user) return

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    const newSocket = io(socketUrl, {
      query: { userId: user.id },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      console.log('Connected to notifications')
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    newSocket.on('notification', (notification: Notification) => {
      toast.success(notification.message)
      queryClient.invalidateQueries({ queryKey: ['notifications'] })

      // Play notification sound (optional)
      playNotificationSound()
    })

    newSocket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [user, queryClient])

  // Mark notification as read
  const markAsRead = useCallback(
    async (notificationId: string) => {
      try {
        await apiClient.post(`/notifications/${notificationId}/read`)
        queryClient.invalidateQueries({ queryKey: ['notifications'] })
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
      }
    },
    [queryClient]
  )

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await apiClient.post('/notifications/mark-all-read')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }, [queryClient])

  return {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    markAsRead,
    markAllAsRead,
    socket,
  }
}

function playNotificationSound(): void {
  // Create a simple beep sound using Web Audio API
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  const oscillator = audioContext.createOscillator()
  const gainNode = audioContext.createGain()

  oscillator.connect(gainNode)
  gainNode.connect(audioContext.destination)

  oscillator.frequency.value = 800
  oscillator.type = 'sine'

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

  oscillator.start(audioContext.currentTime)
  oscillator.stop(audioContext.currentTime + 0.5)
}
