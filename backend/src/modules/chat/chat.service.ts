import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { CreateMessageDto, EditMessageDto } from './dto/message.dto';
import { v4 as uuid } from 'uuid';

const MESSAGE_RETENTION_LIMIT = 30; // Keep only last 30 messages per conversation

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
  ) {}

  /**
   * Send a message
   */
  async sendMessage(
    createMessageDto: CreateMessageDto,
    userId: number,
  ): Promise<ChatMessage> {
    const message = this.chatMessageRepository.create({
      ...createMessageDto,
      senderId: userId,
      messageType: createMessageDto.messageType || 'text',
    });

    const savedMessage = await this.chatMessageRepository.save(message);

    // Cleanup old messages if limit exceeded
    await this.enforceMessageRetention(createMessageDto.conversationId);

    this.logger.log(
      `Message sent in conversation ${createMessageDto.conversationId}`,
    );

    return this.getMessageWithRelations(savedMessage.id);
  }

  /**
   * Get messages for a conversation
   */
  async getConversationMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [messages, total] = await this.chatMessageRepository.findAndCount({
      where: { conversationId },
      relations: ['sender'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    // Reverse to get chronological order (oldest first)
    messages.reverse();

    return {
      data: messages,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get single message with relations
   */
  private async getMessageWithRelations(messageId: number): Promise<ChatMessage> {
    const message = await this.chatMessageRepository.findOne({
      where: { id: messageId },
      relations: ['sender'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    return message;
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: number): Promise<ChatMessage> {
    const message = await this.getMessageWithRelations(messageId);

    if (!message.isRead) {
      message.isRead = true;
      message.readAt = new Date();
      await this.chatMessageRepository.save(message);
    }

    return message;
  }

  /**
   * Mark all messages in conversation as read
   */
  async markConversationAsRead(conversationId: string): Promise<number> {
    const messages = await this.chatMessageRepository.find({
      where: {
        conversationId,
        isRead: false,
      },
    });

    if (messages.length === 0) {
      return 0;
    }

    const now = new Date();
    messages.forEach((m) => {
      m.isRead = true;
      m.readAt = now;
    });

    await this.chatMessageRepository.save(messages);
    this.logger.log(`Marked ${messages.length} messages as read in ${conversationId}`);

    return messages.length;
  }

  /**
   * Edit a message
   */
  async editMessage(
    messageId: number,
    editMessageDto: EditMessageDto,
    userId: number,
  ): Promise<ChatMessage> {
    const message = await this.getMessageWithRelations(messageId);

    if (message.senderId !== userId) {
      throw new BadRequestException('You can only edit your own messages');
    }

    message.message = editMessageDto.message;
    message.editedAt = new Date();

    const updated = await this.chatMessageRepository.save(message);
    this.logger.log(`Message edited: ${messageId}`);

    return updated;
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: number, userId: number): Promise<void> {
    const message = await this.getMessageWithRelations(messageId);

    if (message.senderId !== userId) {
      throw new BadRequestException('You can only delete your own messages');
    }

    await this.chatMessageRepository.remove(message);
    this.logger.log(`Message deleted: ${messageId}`);
  }

  /**
   * Get unread message count for user in conversation
   */
  async getUnreadCount(
    conversationId: string,
    userId: number,
  ): Promise<number> {
    const count = await this.chatMessageRepository.count({
      where: {
        conversationId,
        isRead: false,
        // Exclude messages sent by the current user
        sender: { id: userId },
      },
    });

    return count;
  }

  /**
   * Enforce message retention limit (keep only last 30 messages)
   */
  private async enforceMessageRetention(conversationId: string): Promise<void> {
    const messageCount = await this.chatMessageRepository.count({
      where: { conversationId },
    });

    if (messageCount > MESSAGE_RETENTION_LIMIT) {
      const excessCount = messageCount - MESSAGE_RETENTION_LIMIT;

      const messagesToDelete = await this.chatMessageRepository.find({
        where: { conversationId },
        order: { createdAt: 'ASC' },
        take: excessCount,
      });

      if (messagesToDelete.length > 0) {
        await this.chatMessageRepository.remove(messagesToDelete);
        this.logger.log(
          `Cleaned up ${messagesToDelete.length} old messages from ${conversationId}`,
        );
      }
    }
  }

  /**
   * Get conversation preview (last message, unread count)
   */
  async getConversationPreview(conversationId: string, userId: number) {
    const lastMessage = await this.chatMessageRepository.findOne({
      where: { conversationId },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
    });

    const unreadCount = await this.getUnreadCount(conversationId, userId);
    const messageCount = await this.chatMessageRepository.count({
      where: { conversationId },
    });

    return {
      conversationId,
      lastMessage,
      unreadCount,
      totalMessages: messageCount,
    };
  }

  /**
   * Search messages in conversation
   */
  async searchMessages(
    conversationId: string,
    query: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [messages, total] = await this.chatMessageRepository.findAndCount({
      where: [
        {
          conversationId,
          message: new (require('typeorm')).Like(`%${query}%`),
        },
      ],
      relations: ['sender'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: messages,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all conversations for a user (simplified)
   */
  async getUserConversations(userId: number) {
    const conversations = await this.chatMessageRepository.find({
      where: [{ senderId: userId }],
      select: ['conversationId'],
      // distinct: true, // Removed - not supported in FindManyOptions
    });

    const uniqueConversationIds = [
      ...new Set(conversations.map((c) => c.conversationId)),
    ];

    const previews = await Promise.all(
      uniqueConversationIds.map((convId) =>
        this.getConversationPreview(convId, userId),
      ),
    );

    return previews.sort(
      (a, b) =>
        new Date(b.lastMessage?.createdAt || 0).getTime() -
        new Date(a.lastMessage?.createdAt || 0).getTime(),
    );
  }

  /**
   * Create a new conversation
   */
  async createConversation(): Promise<string> {
    const conversationId = uuid();
    this.logger.log(`Conversation created: ${conversationId}`);
    return conversationId;
  }

  /**
   * Cleanup old messages (batch cleanup - can be run periodically)
   */
  async cleanupOldMessages(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.chatMessageRepository.delete({
      createdAt: LessThan(cutoffDate),
    });

    this.logger.log(
      `Deleted ${result.affected} messages older than ${daysOld} days`,
    );
    return result.affected || 0;
  }

  /**
   * Clear all messages in a conversation
   */
  async clearConversation(conversationId: string): Promise<number> {
    const result = await this.chatMessageRepository.delete({
      conversationId,
    });

    this.logger.log(`Cleared ${result.affected} messages from ${conversationId}`);
    return result.affected || 0;
  }

  /**
   * Delete entire conversation and its messages
   */
  async deleteConversation(conversationId: string): Promise<void> {
    const result = await this.chatMessageRepository.delete({
      conversationId,
    });

    this.logger.log(`Deleted conversation ${conversationId} and ${result.affected} messages`);
  }

  /**
   * Get chat statistics
   */
  async getStatistics() {
    const totalMessages = await this.chatMessageRepository.count();

    // Count conversations
    const conversations = await this.chatMessageRepository
      .createQueryBuilder('message')
      .select('DISTINCT message.conversationId')
      .getRawMany();

    const totalConversations = conversations.length;

    // Get message types distribution
    const messagesByType = await this.chatMessageRepository
      .createQueryBuilder('message')
      .select('message.messageType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('message.messageType')
      .getRawMany();

    // Get top conversations by message count
    const topConversations = await this.chatMessageRepository
      .createQueryBuilder('message')
      .select('message.conversationId', 'conversationId')
      .addSelect('COUNT(*)', 'messageCount')
      .groupBy('message.conversationId')
      .orderBy('messageCount', 'DESC')
      .take(10)
      .getRawMany();

    return {
      totalMessages,
      totalConversations,
      messagesByType: messagesByType.reduce((acc, item) => {
        acc[item.type] = parseInt(item.count);
        return acc;
      }, {}),
      topConversations,
    };
  }
}
