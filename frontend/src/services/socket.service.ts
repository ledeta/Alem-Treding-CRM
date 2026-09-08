import { io, Socket } from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://alem-treding-backend.onrender.com';

export class SocketService {
  private chatSocket: Socket | null = null;
  private notificationSocket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  /**
   * Connect to chat socket
   */
  connectChat(userId: number, userName: string) {
    if (this.chatSocket?.connected) {
      return this.chatSocket;
    }

    this.chatSocket = io(`${BACKEND_URL}/chat`, {
      query: { userId: userId.toString(), userName },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.chatSocket.on('connect', () => {
      console.log('Connected to chat socket');
      this.reconnectAttempts = 0;
    });

    this.chatSocket.on('disconnect', () => {
      console.log('Disconnected from chat socket');
    });

    this.chatSocket.on('connect_error', (error) => {
      console.error('Chat socket connection error:', error);
      this.reconnectAttempts++;
    });

    return this.chatSocket;
  }

  /**
   * Connect to notifications socket
   */
  connectNotifications(userId: number) {
    if (this.notificationSocket?.connected) {
      return this.notificationSocket;
    }

    this.notificationSocket = io(`${BACKEND_URL}/notifications`, {
      query: { userId: userId.toString() },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.notificationSocket.on('connect', () => {
      console.log('Connected to notifications socket');
      this.reconnectAttempts = 0;
    });

    this.notificationSocket.on('disconnect', () => {
      console.log('Disconnected from notifications socket');
    });

    this.notificationSocket.on('connect_error', (error) => {
      console.error('Notifications socket connection error:', error);
      this.reconnectAttempts++;
    });

    return this.notificationSocket;
  }

  /**
   * Get chat socket
   */
  getChatSocket() {
    return this.chatSocket;
  }

  /**
   * Get notification socket
   */
  getNotificationSocket() {
    return this.notificationSocket;
  }

  /**
   * Disconnect all sockets
   */
  disconnectAll() {
    if (this.chatSocket) {
      this.chatSocket.disconnect();
      this.chatSocket = null;
    }
    if (this.notificationSocket) {
      this.notificationSocket.disconnect();
      this.notificationSocket = null;
    }
    this.reconnectAttempts = 0;
  }

  /**
   * Check if connected
   */
  isConnected() {
    return {
      chat: this.chatSocket?.connected || false,
      notifications: this.notificationSocket?.connected || false,
    };
  }
}

// Export singleton instance
export const socketService = new SocketService();
