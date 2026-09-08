import { Controller, Get, Post, Put, Delete, Param, UseGuards, Query, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { NotificationsService } from './notifications.service'
import { JwtAuthGuard } from '../../common/guards/auth.guard'
import { RoleGuard } from '../../common/guards/role.guard'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, RoleGuard)
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name)

  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  async getNotifications(
    @CurrentUser() user: any,
    @Query('unreadOnly') unreadOnly: boolean = false,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const notifications = await this.notificationsService.getByUserId(user.id, unreadOnly, page, limit)
    const unreadCount = await this.notificationsService.getUnreadCount(user.id)

    return {
      notifications,
      unreadCount,
    }
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@CurrentUser() user: any) {
    const count = await this.notificationsService.getUnreadCount(user.id)
    return { unreadCount: count }
  }

  @Get('stats')
  @Roles('admin')
  @ApiOperation({ summary: 'Get notification statistics (admin)' })
  async getStats() {
    return this.notificationsService.getStatistics()
  }

  @Get('templates')
  @Roles('admin')
  @ApiOperation({ summary: 'Get notification templates (admin)' })
  async getTemplates() {
    return this.notificationsService.getTemplates()
  }

  @Post('send')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send notification (admin)' })
  async sendNotification(
    @Body() payload: {
      title: string
      message: string
      type: 'info' | 'success' | 'warning' | 'error' | 'approval'
      recipients: 'all' | number[]
    },
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Admin ${user.id} sending notification`)
    return this.notificationsService.sendNotification(payload)
  }

  @Post('broadcast')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Broadcast notification to all users (admin)' })
  async broadcastNotification(
    @Body() payload: {
      title: string
      message: string
      type: 'info' | 'success' | 'warning' | 'error' | 'approval'
    },
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Admin ${user.id} broadcasting notification`)
    return this.notificationsService.sendNotification({
      ...payload,
      recipients: 'all',
    })
  }

  @Post('send-template')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send notification from template (admin)' })
  async sendFromTemplate(
    @Body() payload: {
      templateId: string
      recipients: 'all' | number[]
      customData?: Record<string, any>
    },
    @CurrentUser() user: any,
  ) {
    this.logger.log(`Admin ${user.id} sending template notification`)
    return this.notificationsService.sendFromTemplate(payload)
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') notificationId: string) {
    await this.notificationsService.markAsRead(notificationId)
    return { success: true }
  }

  @Post('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: any) {
    const count = await this.notificationsService.markAllAsRead(user.id)
    return { success: true, markedCount: count }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete notification' })
  async deleteNotification(@Param('id') notificationId: string) {
    await this.notificationsService.delete(notificationId)
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  async getPreferences(@CurrentUser() user: any): Promise<any> {
    return this.notificationsService.getPreferences(user.id)
  }

  @Post('preferences')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update notification preferences' })
  async updatePreferences(
    @CurrentUser() user: any,
    @Body() preferences: any,
  ): Promise<any> {
    return this.notificationsService.updatePreferences(user.id, preferences)
  }

  @Post('cleanup')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cleanup old notifications (admin)' })
  async cleanup(@Query('daysOld') daysOld: number = 90) {
    const deleted = await this.notificationsService.cleanupOld(daysOld)
    return { deletedCount: deleted }
  }
}
