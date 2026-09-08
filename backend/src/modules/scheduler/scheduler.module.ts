import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { SchedulerService } from './scheduler.service'
import { BatchModule } from '../batch/batch.module'
import { CacheModule } from '../cache/cache.module'
import { NotificationsModule } from '../notifications/notifications.module'
import { AuditModule } from '../audit/audit.module'

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BatchModule,
    CacheModule,
    NotificationsModule,
    AuditModule,
  ],
  providers: [SchedulerService],
})
export class SchedulerModule {}
