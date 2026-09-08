import { Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, LessThan } from 'typeorm'
import { Notification } from './entities/notification.entity'
import { User } from '../auth/entities/user.entity'

interface NotificationData {
  type: 'upload' | 'payment' | 'credit' | 'refund' | 'approval' | 'system' | 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  relatedId?: string
  recipientIds: string[] | 'all'
}

interface NotificationPreferences {
  emailNotifications: boolean
  pushNotifications: boolean
  inAppNotifications: boolean
  notificationTypes: Record<string, boolean>
  quietHours: {
    enabled: boolean
    startTime: string
    endTime: string
  }
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly'
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  private preferences: Map<number, NotificationPreferences> = new Map()

  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async create(data: NotificationData): Promise<Notification[]> {
    const notifications: Notification[] = []

    const recipientIds = data.recipientIds === 'all' ? [] : 
      (Array.isArray(data.recipientIds) ? data.recipientIds : [data.recipientIds])

    for (const recipientId of recipientIds) {
      const notification = this.notificationsRepository.create({
        type: data.type as any,
        title: data.title,
        message: data.message,
        relatedId: data.relatedId,
        recipientId: parseInt(recipientId),
      })

      const saved = await this.notificationsRepository.save(notification)
      notifications.push(saved)
    }

    return notifications
  }

  async getByUserId(
    userId: number,
    unreadOnly = false,
    page = 1,
    limit = 20,
  ): Promise<any> {
    const skip = (page - 1) * limit

    const query = this.notificationsRepository
      .createQueryBuilder('notification')
      .where('notification.recipientId = :userId', { userId })

    if (unreadOnly) {
      query.andWhere('notification.read = false')
    }

    const [data, total] = await query
      .orderBy('notification.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount()

    return {
      data,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    await this.notificationsRepository.update(notificationId, { 
      read: true,
      readAt: new Date(),
    })
    this.logger.log(`Notification marked as read: ${notificationId}`)
  }

  async markAllAsRead(userId: number): Promise<number> {
    const result = await this.notificationsRepository.update(
      { recipient: { id: userId } as any, read: false },
      { read: true, readAt: new Date() }
    )
    this.logger.log(`Marked ${result.affected} notifications as read for user ${userId}`)
    return result.affected || 0
  }

  async delete(notificationId: string): Promise<void> {
    await this.notificationsRepository.delete(notificationId)
    this.logger.log(`Notification deleted: ${notificationId}`)
  }

  async getUnreadCount(userId: number): Promise<number> {
    const count = await this.notificationsRepository.count({
      where: { recipient: { id: userId } as any, read: false },
    })
    return count
  }

  async getStatistics(): Promise<any> {
    const total = await this.notificationsRepository.count()
    const unread = await this.notificationsRepository.count({
      where: { read: false },
    })

    // Get notifications by type
    const byType = await this.notificationsRepository
      .createQueryBuilder('notification')
      .select('notification.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('notification.type')
      .getRawMany()

    const typeMap = byType.reduce((acc, item) => {
      acc[item.type] = parseInt(item.count)
      return acc
    }, {})

    return {
      total,
      sent: total,
      pending: unread,
      byType: typeMap,
    }
  }

  async getTemplates(): Promise<any[]> {
    return [
      {
        id: '1',
        name: 'Payment Approval',
        title: 'Payment Approved',
        message: 'Your payment has been approved',
        type: 'success',
      },
      {
        id: '2',
        name: 'Pending Review',
        title: 'Pending Review',
        message: 'Your request is pending review',
        type: 'warning',
      },
      {
        id: '3',
        name: 'System Alert',
        title: 'System Alert',
        message: 'System maintenance scheduled',
        type: 'info',
      },
    ]
  }

  async sendNotification(payload: {
    title: string
    message: string
    type: string
    recipients: 'all' | number[]
  }): Promise<any> {
    this.logger.log(`Sending notification: ${payload.title}`)
    
    // Send to WebSocket gateway for real-time delivery
    // This would be implemented in the gateway
    return {
      success: true,
      message: 'Notification sent',
      recipients: Array.isArray(payload.recipients) ? payload.recipients.length : 'all',
    }
  }

  async sendFromTemplate(payload: {
    templateId: string
    recipients: 'all' | number[]
    customData?: Record<string, any>
  }): Promise<any> {
    const templates = await this.getTemplates()
    const template = templates.find((t) => t.id === payload.templateId)

    if (!template) {
      throw new Error('Template not found')
    }

    return this.sendNotification({
      title: template.title,
      message: template.message,
      type: template.type,
      recipients: payload.recipients,
    })
  }

  async getPreferences(userId: number): Promise<NotificationPreferences> {
    if (this.preferences.has(userId)) {
      return this.preferences.get(userId)!
    }

    const defaultPreferences: NotificationPreferences = {
      emailNotifications: true,
      pushNotifications: true,
      inAppNotifications: true,
      notificationTypes: {
        payments: true,
        approvals: true,
        messages: true,
        updates: true,
        alerts: true,
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
      },
      frequency: 'immediate',
    }

    this.preferences.set(userId, defaultPreferences)
    return defaultPreferences
  }

  async updatePreferences(
    userId: number,
    preferences: Partial<NotificationPreferences>,
  ): Promise<NotificationPreferences> {
    const current = await this.getPreferences(userId)
    const updated = { ...current, ...preferences }
    this.preferences.set(userId, updated)
    this.logger.log(`Preferences updated for user ${userId}`)
    return updated
  }

  async cleanupOld(daysOld: number = 90): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await this.notificationsRepository.delete({
      createdAt: LessThan(cutoffDate),
      read: true,
    })

    this.logger.log(
      `Deleted ${result.affected} old notifications (older than ${daysOld} days)`
    )
    return result.affected || 0
  }
}
