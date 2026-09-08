import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { SeedsService } from './database/seeds.service';
import { User } from './modules/auth/entities/user.entity';
import { Role } from './modules/auth/entities/role.entity';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CustomersModule } from './modules/customers/customers.module';
import { ItemsModule } from './modules/items/items.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CreditsModule } from './modules/credits/credits.module';
import { RefundsModule } from './modules/refunds/refunds.module';
import { ChatModule } from './modules/chat/chat.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ApprovalsModule } from './modules/approvals/approvals.module';
import { AuditModule } from './modules/audit/audit.module';
import { EmailModule } from './modules/email/email.module';
import { ReportModule } from './modules/reports/report.module';
import { ExcelModule } from './modules/excel/excel.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { SearchModule } from './modules/search/search.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { BatchModule } from './modules/batch/batch.module';
import { ExportModule } from './modules/export/export.module';
import { CacheModule } from './modules/cache/cache.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { TwoFactorAuthModule } from './modules/two-factor-auth/two-factor-auth.module';
import { ApiKeyModule } from './modules/api-keys/api-key.module';
import { AdvancedReportsModule } from './modules/advanced-reports/advanced-reports.module';
import { WebhookModule } from './modules/webhooks/webhook.module';
import { HealthModule } from './modules/health/health.module';
import { CompanyModule } from './modules/company/company.module';

// MEGA AGGRESSIVE: Parse DATABASE_URL if available (for Render production)
// Otherwise use individual env vars (for local development)
function getDbConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    // PRODUCTION: Parse Render DATABASE_URL
    // Format: postgresql://user:password@host:port/database
    const url = new URL(databaseUrl);
    return {
      type: 'postgres' as const,
      host: url.hostname,
      port: parseInt(url.port || '5432'),
      username: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading '/'
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
      synchronize: true,
      logging: process.env.NODE_ENV !== 'production',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }
  
  // DEVELOPMENT: Use individual env vars
  return {
    type: 'postgres' as const,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'alem_crm',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
    synchronize: true,
    logging: process.env.NODE_ENV !== 'production',
  };
}

const dbConfig = getDbConfig();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Rate Limiting Configuration
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: parseInt(process.env.RATE_LIMIT || '100'), // 100 requests per minute
      },
    ]),
    TypeOrmModule.forRoot(dbConfig),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([
      User,
      Role,
    ]),
    // Core Modules
    AuthModule,
    UsersModule,
    CustomersModule,
    ItemsModule,
    UploadsModule,
    PaymentsModule,
    CreditsModule,
    RefundsModule,
    ChatModule,
    NotificationsModule,
    DashboardModule,
    TransactionsModule,
    ApprovalsModule,
    // New Security & Utility Modules
    AuditModule,
    EmailModule,
    ReportModule,
    // Phase 3 Modules
    ExcelModule,
    WebsocketModule,
    SearchModule,
    AnalyticsModule,
    BatchModule,
    ExportModule,
    CacheModule,
    SchedulerModule,
    // Phase 6 Modules
    TwoFactorAuthModule,
    ApiKeyModule,
    AdvancedReportsModule,
    WebhookModule,
    HealthModule,
    CompanyModule,
  ],
  providers: [
    SeedsService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
