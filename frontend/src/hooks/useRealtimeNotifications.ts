import { useEffect, useState, useCallback, useRef } from 'react';
import { socketService } from '../services/socket.service';
import { Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

export interface Notification {
  id: number;
  userId: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'approval';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  metadata?: any;
}

export function useRealtimeNotifications(userId: number, showToast = true) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Connect to notifications socket
  useEffect(() => {
    if (!userId) return;

    const socket = socketService.connectNotifications(userId);
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Request initial unread count
      socket.emit('get_unread_count');
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Listen for unread count updates
    socket.on('unread_count', (data: { count: number }) => {
      setUnreadCount(data.count);
    });

    // Listen for new notifications
    socket.on('notification', (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Show toast notification if enabled
      if (showToast) {
        const toastMessage = notification.message || notification.title;
        switch (notification.type) {
          case 'success':
            toast.success(toastMessage);
            break;
          case 'error':
            toast.error(toastMessage);
            break;
          case 'warning':
            toast(toastMessage, { icon: '⚠️' });
            break;
          case 'approval':
            toast(toastMessage, { icon: '✅', duration: 5000 });
            break;
          default:
            toast(toastMessage);
        }
      }
    });

    // Listen for notification read events
    socket.on('notification_read', (data: { notificationId: number }) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === data.notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    });

    // Listen for all notifications read
    socket.on('all_notifications_read', (data: { markedCount: number }) => {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    });

    // Listen for notification deletions
    socket.on('notification_deleted', (data: { notificationId: number }) => {
      setNotifications((prev) => {
        const notification = prev.find((n) => n.id === data.notificationId);
        if (notification && !notification.isRead) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        return prev.filter((n) => n.id !== data.notificationId);
      });
    });

    // Listen for fetched notifications
    socket.on('notifications_fetched', (data: any) => {
      setNotifications(data.data || []);
      setUnreadCount(data.unreadCount || 0);
    });

    // Listen for statistics
    socket.on('statistics', (stats: any) => {
      // Can be used for notification insights
      console.log('Notification statistics:', stats);
    });

    // Handle errors
    socket.on('error', (error: { message: string }) => {
      console.error('Notification error:', error.message);
    });

    return () => {
      socket.off('unread_count');
      socket.off('notification');
      socket.off('notification_read');
      socket.off('all_notifications_read');
      socket.off('notification_deleted');
      socket.off('notifications_fetched');
      socket.off('statistics');
      socket.off('error');
    };
  }, [userId, showToast]);

  // Fetch notifications
  const fetchNotifications = useCallback(
    (page = 1, limit = 10) => {
      if (!socketRef.current) return;
      socketRef.current.emit('fetch_notifications', { page, limit });
    },
    []
  );

  // Mark as read
  const markAsRead = useCallback((notificationId: number) => {
    if (!socketRef.current) return;
    socketRef.current.emit('mark_read', { notificationId });
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('mark_all_read');
  }, []);

  // Delete notification
  const deleteNotification = useCallback((notificationId: number) => {
    if (!socketRef.current) return;
    socketRef.current.emit('delete_notification', { notificationId });
  }, []);

  // Get statistics
  const getStatistics = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('get_statistics');
  }, []);

  // Ping/pong test
  const ping = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('ping', { timestamp: Date.now() });
  }, []);

  return {
    notifications,
    unreadCount,
    connected,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getStatistics,
    ping,
  };
}
