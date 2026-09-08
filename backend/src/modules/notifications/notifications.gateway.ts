import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { NotificationsService } from './notifications.service';

interface AuthenticatedSocket extends Socket {
  userId?: number;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  // Map to track active connections: userId -> Set<socketId>
  private userConnections = new Map<number, Set<string>>();

  constructor(private readonly notificationsService: NotificationsService) {}

  afterInit(server: Server) {
    this.logger.log('Notifications Gateway initialized');
  }

  async handleConnection(socket: AuthenticatedSocket) {
    try {
      const userId = parseInt(socket.handshake.query.userId as string);

      if (!userId) {
        socket.disconnect();
        return;
      }

      socket.userId = userId;

      // Track user connection
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, new Set());
      }
      this.userConnections.get(userId).add(socket.id);

      // Join user-specific room for targeted notifications
      socket.join(`user_${userId}`);

      this.logger.log(`User ${userId} connected to notifications - Socket: ${socket.id}`);

      // Send unread count on connection
      const unreadCount = await this.notificationsService.getUnreadCount(userId);
      socket.emit('unread_count', { count: unreadCount });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    if (socket.userId) {
      const connections = this.userConnections.get(socket.userId);
      if (connections) {
        connections.delete(socket.id);
        if (connections.size === 0) {
          this.userConnections.delete(socket.userId);
          this.logger.log(`User ${socket.userId} disconnected from notifications`);
        }
      }
    }
  }

  /**
   * Send notification to specific user
   */
  sendNotificationToUser(userId: number, notification: any) {
    const roomName = `user_${userId}`;
    this.server.to(roomName).emit('notification', notification);

    this.logger.log(`Notification sent to user ${userId}`);
  }

  /**
   * Send notification to multiple users
   */
  sendNotificationToUsers(userIds: number[], notification: any) {
    userIds.forEach((userId) => {
      this.sendNotificationToUser(userId, notification);
    });

    this.logger.log(`Notification sent to ${userIds.length} users`);
  }

  /**
   * Broadcast notification to all connected users
   */
  broadcastNotification(notification: any) {
    this.server.emit('notification', notification);
    this.logger.log('Notification broadcasted to all users');
  }

  /**
   * Send notification to all admins
   */
  sendToAdmins(notification: any) {
    this.server.to('admins').emit('notification', notification);
    this.logger.log('Notification sent to all admins');
  }

  /**
   * Fetch notifications
   */
  @SubscribeMessage('fetch_notifications')
  async handleFetchNotifications(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { page?: number; limit?: number },
  ) {
    try {
      const notifications = await this.notificationsService.getByUserId(
        socket.userId,
        false,
        data.page || 1,
        data.limit || 10,
      );

      socket.emit('notifications_fetched', notifications);
      return { success: true };
    } catch (error) {
      this.logger.error(`Fetch notifications error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark notification as read
   */
  @SubscribeMessage('mark_read')
  async handleMarkAsRead(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { notificationId: number },
  ) {
    try {
      await this.notificationsService.markAsRead(String(data.notificationId));

      socket.emit('notification_read', { notificationId: data.notificationId });
      return { success: true };
    } catch (error) {
      this.logger.error(`Mark read error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark all notifications as read
   */
  @SubscribeMessage('mark_all_read')
  async handleMarkAllAsRead(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    try {
      const count = await this.notificationsService.markAllAsRead(
        socket.userId,
      );

      socket.emit('all_notifications_read', { markedCount: count });
      return { success: true, markedCount: count };
    } catch (error) {
      this.logger.error(`Mark all read error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete notification
   */
  @SubscribeMessage('delete_notification')
  async handleDeleteNotification(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { notificationId: number },
  ) {
    try {
      await this.notificationsService.delete(String(data.notificationId));

      socket.emit('notification_deleted', { notificationId: data.notificationId });
      return { success: true };
    } catch (error) {
      this.logger.error(`Delete notification error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get unread count
   */
  @SubscribeMessage('get_unread_count')
  async handleGetUnreadCount(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    try {
      const count = await this.notificationsService.getUnreadCount(socket.userId);
      socket.emit('unread_count', { count });
      return { success: true, count };
    } catch (error) {
      this.logger.error(`Get unread count error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get statistics
   */
  @SubscribeMessage('get_statistics')
  async handleGetStatistics(
    @ConnectedSocket() socket: AuthenticatedSocket,
  ) {
    try {
      const stats = await this.notificationsService.getStatistics();
      socket.emit('statistics', stats);
      return { success: true, stats };
    } catch (error) {
      this.logger.error(`Get statistics error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Test connection
   */
  @SubscribeMessage('ping')
  handlePing(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: any,
  ) {
    socket.emit('pong', data);
    return { success: true };
  }
}
