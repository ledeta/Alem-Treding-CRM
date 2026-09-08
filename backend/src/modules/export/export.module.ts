import { Module } from '@nestjs/common';
import { ExportService } from './export.service';
import { ExportController } from './export.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { CustomersModule } from '../customers/customers.module';
import { ItemsModule } from '../items/items.module';
import { PaymentsModule } from '../payments/payments.module';
import { CreditsModule } from '../credits/credits.module';
import { RefundsModule } from '../refunds/refunds.module';

@Module({
  imports: [
    TransactionsModule,
    CustomersModule,
    ItemsModule,
    PaymentsModule,
    CreditsModule,
    RefundsModule,
  ],
  controllers: [ExportController],
  providers: [ExportService],
  exports: [ExportService],
})
export class ExportModule {}
