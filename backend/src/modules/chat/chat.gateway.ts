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
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/message.dto';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userName?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  // Map to track active connections: userId -> Set<socketId>
  private userConnections = new Map<number, Set<string>>();

  // Map to track conversation subscribers: conversationId -> Set<userId>
  private conversationSubscribers = new Map<string, Set<number>>();

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    this.logger.log('Chat Gateway initialized');
  }

  async handleConnection(socket: AuthenticatedSocket) {
    try {
      // Extract user info from socket query or headers
      const userId = parseInt(socket.handshake.query.userId as string);
      const userName = socket.handshake.query.userName as string;

      if (!userId) {
        socket.disconnect();
        return;
      }

      socket.userId = userId;
      socket.userName = userName;

      // Track user connection
      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, new Set());
      }
      this.userConnections.get(userId).add(socket.id);

      this.logger.log(
        `User ${userName} (ID: ${userId}) connected - Socket: ${socket.id}`,
      );

      // Notify others that user is online
      socket.broadcast.emit('user_online', { userId, userName });
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
          this.logger.log(`User ${socket.userId} disconnected (all sockets)`);
          socket.broadcast.emit('user_offline', { userId: socket.userId });
        }
      }
    }
  }

  /**
   * Join a conversation
   */
  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    const roomName = `conversation_${data.conversationId}`;
    socket.join(roomName);

    // Track conversation subscribers
    if (!this.conversationSubscribers.has(data.conversationId)) {
      this.conversationSubscribers.set(data.conversationId, new Set());
    }
    this.conversationSubscribers.get(data.conversationId).add(socket.userId);

    this.logger.log(
      `User ${socket.userId} joined conversation ${data.conversationId}`,
    );

    // Notify others in the room
    socket.to(roomName).emit('user_joined', {
      userId: socket.userId,
      userName: socket.userName,
    });

    return { success: true, conversationId: data.conversationId };
  }

  /**
   * Leave a conversation
   */
  @SubscribeMessage('leave_conversation')
  handleLeaveConversation(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    const roomName = `conversation_${data.conversationId}`;
    socket.leave(roomName);

    const subscribers = this.conversationSubscribers.get(data.conversationId);
    if (subscribers) {
      subscribers.delete(socket.userId);
      if (subscribers.size === 0) {
        this.conversationSubscribers.delete(data.conversationId);
      }
    }

    this.logger.log(
      `User ${socket.userId} left conversation ${data.conversationId}`,
    );

    socket.to(roomName).emit('user_left', {
      userId: socket.userId,
      userName: socket.userName,
    });

    return { success: true };
  }

  /**
   * Send a message
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: CreateMessageDto,
  ) {
    try {
      const message = await this.chatService.sendMessage(data, socket.userId);

      const roomName = `conversation_${data.conversationId}`;

      // Broadcast message to all subscribers in the conversation
      this.server.to(roomName).emit('message_received', {
        id: message.id,
        conversationId: message.conversationId,
        sender: {
          id: message.senderId,
          name: socket.userName,
        },
        message: message.message,
        messageType: message.messageType,
        createdAt: message.createdAt,
        metadata: message.metadata,
      });

      this.logger.log(
        `Message sent in conversation ${data.conversationId} by user ${socket.userId}`,
      );

      return { success: true, messageId: message.id };
    } catch (error) {
      this.logger.error(`Send message error: ${error.message}`);
      socket.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Edit a message
   */
  @SubscribeMessage('edit_message')
  async handleEditMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: { messageId: number; conversationId: string; message: string },
  ) {
    try {
      const updated = await this.chatService.editMessage(
        data.messageId,
        { message: data.message },
        socket.userId,
      );

      const roomName = `conversation_${data.conversationId}`;

      this.server.to(roomName).emit('message_edited', {
        id: updated.id,
        conversationId: data.conversationId,
        message: updated.message,
        editedAt: updated.editedAt,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Edit message error: ${error.message}`);
      socket.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a message
   */
  @SubscribeMessage('delete_message')
  async handleDeleteMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: { messageId: number; conversationId: string },
  ) {
    try {
      await this.chatService.deleteMessage(data.messageId, socket.userId);

      const roomName = `conversation_${data.conversationId}`;

      this.server.to(roomName).emit('message_deleted', {
        id: data.messageId,
        conversationId: data.conversationId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Delete message error: ${error.message}`);
      socket.emit('error', { message: error.message });
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark message as read
   */
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody()
    data: { messageId: number; conversationId: string },
  ) {
    try {
      await this.chatService.markAsRead(data.messageId);

      const roomName = `conversation_${data.conversationId}`;

      this.server.to(roomName).emit('message_read', {
        id: data.messageId,
        conversationId: data.conversationId,
        readBy: socket.userId,
      });

      return { success: true };
    } catch (error) {
      this.logger.error(`Mark read error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark all messages in conversation as read
   */
  @SubscribeMessage('mark_conversation_read')
  async handleMarkConversationRead(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    try {
      const count = await this.chatService.markConversationAsRead(
        data.conversationId,
      );

      const roomName = `conversation_${data.conversationId}`;

      this.server.to(roomName).emit('conversation_read', {
        conversationId: data.conversationId,
        readBy: socket.userId,
        count,
      });

      return { success: true, markedCount: count };
    } catch (error) {
      this.logger.error(`Mark conversation read error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * User is typing
   */
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    const roomName = `conversation_${data.conversationId}`;

    socket.to(roomName).emit('user_typing', {
      userId: socket.userId,
      userName: socket.userName,
      isTyping: data.isTyping,
    });

    return { success: true };
  }

  /**
   * Get active users in conversation
   */
  @SubscribeMessage('get_active_users')
  handleGetActiveUsers(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    const subscribers = this.conversationSubscribers.get(data.conversationId);
    const activeUsers = subscribers
      ? Array.from(subscribers).map((userId) => ({
          userId,
          isOnline: this.userConnections.has(userId),
        }))
      : [];

    return { success: true, activeUsers };
  }

  /**
   * Send direct message to user
   */
  @SubscribeMessage('direct_message')
  async handleDirectMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { recipientId: number; message: string },
  ) {
    const recipientSockets = this.userConnections.get(data.recipientId);

    if (recipientSockets && recipientSockets.size > 0) {
      recipientSockets.forEach((socketId) => {
        this.server.to(socketId).emit('direct_message', {
          senderId: socket.userId,
          senderName: socket.userName,
          message: data.message,
          timestamp: new Date(),
        });
      });

      return { success: true, delivered: true };
    }

    return { success: true, delivered: false };
  }
}
