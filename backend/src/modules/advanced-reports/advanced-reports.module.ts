import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesTransaction } from '../transactions/entities/sales-transaction.entity';
import { Customer } from '../customers/entities/customer.entity';
import { PaymentRequest } from '../payments/entities/payment-request.entity';
import { Item } from '../items/entities/item.entity';
import { AdvancedReportsService } from './advanced-reports.service';
import { AdvancedReportsController } from './advanced-reports.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalesTransaction, Customer, PaymentRequest, Item]),
  ],
  controllers: [AdvancedReportsController],
  providers: [AdvancedReportsService],
  exports: [AdvancedReportsService],
})
export class AdvancedReportsModule {}
