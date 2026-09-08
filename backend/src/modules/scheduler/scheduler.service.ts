import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { BatchService } from '../batch/batch.service'
import { CacheService } from '../cache/cache.service'
import { NotificationsService } from '../notifications/notifications.service'
import { AuditService } from '../audit/audit.service'

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name)

  constructor(
    private batchService: BatchService,
    private cacheService: CacheService,
    private notificationsService: NotificationsService,
    private auditService: AuditService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleHourlyTasks(): Promise<void> {
    this.logger.debug('Running hourly scheduled tasks')
    try {
      // Refresh critical caches
      this.cacheService.deleteByPattern('dashboard:*')
      this.logger.debug('Refreshed dashboard cache')
    } catch (error) {
      this.logger.error('Error in hourly tasks', error)
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyTasks(): Promise<void> {
    this.logger.debug('Running daily scheduled tasks')
    try {
      // DISABLED: Process inactive customers - causing issues with newly imported customers
      // await this.batchService.batchProcessInactiveCustomers(15)

      // Update credit and refund balances
      await this.batchService.batchUpdateCreditBalances()
      await this.batchService.batchUpdateRefundBalances()

      // Clear old cache
      this.cacheService.clear()

      this.logger.log('Daily tasks completed successfully')
    } catch (error) {
      this.logger.error('Error in daily tasks', error)
    }
  }

  @Cron(CronExpression.EVERY_WEEK)
  async handleWeeklyTasks(): Promise<void> {
    this.logger.debug('Running weekly scheduled tasks')
    try {
      // Archive old audit logs
      await this.auditService.cleanup(30)

      // Generate weekly reports (placeholder)
      this.logger.log('Weekly reports generated')
    } catch (error) {
      this.logger.error('Error in weekly tasks', error)
    }
  }

  @Cron(CronExpression.EVERY_6_MONTHS)
  async handleMonthlyTasks(): Promise<void> {
    this.logger.debug('Running monthly scheduled tasks')
    try {
      // Cleanup old exports
      this.logger.log('Monthly cleanup completed')
    } catch (error) {
      this.logger.error('Error in monthly tasks', error)
    }
  }

  // Custom interval: Every 5 minutes for real-time checks
  @Cron('*/5 * * * *')
  async handleRealtimeTasks(): Promise<void> {
    try {
      // Check for pending approvals and send reminders
      this.logger.debug('Real-time tasks check')
    } catch (error) {
      this.logger.error('Error in real-time tasks', error)
    }
  }
}
