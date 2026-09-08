import { useEffect, useState, useCallback, useRef } from 'react';
import { socketService } from '../services/socket.service';
import { Socket } from 'socket.io-client';

export interface ChatMessage {
  id: number;
  conversationId: string;
  sender: {
    id: number;
    name: string;
  };
  message: string;
  messageType: 'text' | 'file' | 'image' | 'system';
  createdAt: Date;
  editedAt?: Date;
  metadata?: any;
}

export interface TypingIndicator {
  userId: number;
  userName: string;
  isTyping: boolean;
}

export interface UserStatus {
  userId: number;
  userName: string;
  isOnline: boolean;
}

export function useChat(userId: number, userName: string, conversationId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [activeUsers, setActiveUsers] = useState<UserStatus[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Connect to chat socket
  useEffect(() => {
    const socket = socketService.connectChat(userId, userName);
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      // Join conversation if provided
      if (conversationId) {
        socket.emit('join_conversation', { conversationId });
      }
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Listen for new messages
    socket.on('message_received', (message: ChatMessage) => {
      setMessages((prev) => {
        // Keep only last 30 messages (as per requirement)
        const updated = [...prev, message];
        return updated.slice(-30);
      });
    });

    // Listen for message edits
    socket.on('message_edited', (data: { id: number; conversationId: string; message: string; editedAt: Date }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.id ? { ...msg, message: data.message, editedAt: data.editedAt } : msg
        )
      );
    });

    // Listen for message deletions
    socket.on('message_deleted', (data: { id: number; conversationId: string }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== data.id));
    });

    // Listen for typing indicators
    socket.on('user_typing', (data: TypingIndicator) => {
      setTypingUsers((prev) => {
        const filtered = prev.filter((u) => u.userId !== data.userId);
        if (data.isTyping) {
          return [...filtered, data];
        }
        return filtered;
      });
    });

    // Listen for user status
    socket.on('user_online', (data: { userId: number; userName: string }) => {
      setActiveUsers((prev) => {
        const exists = prev.find((u) => u.userId === data.userId);
        if (!exists) {
          return [...prev, { ...data, isOnline: true }];
        }
        return prev.map((u) => (u.userId === data.userId ? { ...u, isOnline: true } : u));
      });
    });

    socket.on('user_offline', (data: { userId: number }) => {
      setActiveUsers((prev) =>
        prev.map((u) => (u.userId === data.userId ? { ...u, isOnline: false } : u))
      );
    });

    socket.on('user_joined', (data: { userId: number; userName: string }) => {
      setActiveUsers((prev) => {
        const exists = prev.find((u) => u.userId === data.userId);
        if (!exists) {
          return [...prev, { ...data, isOnline: true }];
        }
        return prev;
      });
    });

    socket.on('user_left', (data: { userId: number }) => {
      // Keep user in list but mark as inactive
    });

    // Handle errors
    socket.on('error', (error: { message: string }) => {
      console.error('Chat error:', error.message);
    });

    return () => {
      if (conversationId) {
        socket.emit('leave_conversation', { conversationId });
      }
      socket.off('message_received');
      socket.off('message_edited');
      socket.off('message_deleted');
      socket.off('user_typing');
      socket.off('user_online');
      socket.off('user_offline');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('error');
    };
  }, [userId, userName, conversationId]);

  // Send message
  const sendMessage = useCallback(
    (message: string, messageType: 'text' | 'file' | 'image' = 'text', metadata?: any) => {
      if (!socketRef.current || !conversationId) return;

      socketRef.current.emit('send_message', {
        conversationId,
        message,
        messageType,
        metadata,
      });
    },
    [conversationId]
  );

  // Edit message
  const editMessage = useCallback(
    (messageId: number, newMessage: string) => {
      if (!socketRef.current || !conversationId) return;

      socketRef.current.emit('edit_message', {
        messageId,
        conversationId,
        message: newMessage,
      });
    },
    [conversationId]
  );

  // Delete message
  const deleteMessage = useCallback(
    (messageId: number) => {
      if (!socketRef.current || !conversationId) return;

      socketRef.current.emit('delete_message', {
        messageId,
        conversationId,
      });
    },
    [conversationId]
  );

  // Send typing indicator
  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!socketRef.current || !conversationId) return;

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      socketRef.current.emit('typing', {
        conversationId,
        isTyping,
      });

      // Auto-stop typing after 3 seconds
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          socketRef.current?.emit('typing', {
            conversationId,
            isTyping: false,
          });
        }, 3000);
      }
    },
    [conversationId]
  );

  // Mark message as read
  const markAsRead = useCallback(
    (messageId: number) => {
      if (!socketRef.current || !conversationId) return;

      socketRef.current.emit('mark_read', {
        messageId,
        conversationId,
      });
    },
    [conversationId]
  );

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    if (!socketRef.current || !conversationId) return;

    socketRef.current.emit('mark_conversation_read', {
      conversationId,
    });
  }, [conversationId]);

  // Get active users
  const fetchActiveUsers = useCallback(() => {
    if (!socketRef.current || !conversationId) return;

    socketRef.current.emit('get_active_users', { conversationId }, (response: any) => {
      if (response.success) {
        setActiveUsers(response.activeUsers);
      }
    });
  }, [conversationId]);

  return {
    messages,
    typingUsers,
    activeUsers,
    connected,
    sendMessage,
    editMessage,
    deleteMessage,
    setTyping,
    markAsRead,
    markAllAsRead,
    fetchActiveUsers,
  };
}
