import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesTransaction } from '../transactions/entities/sales-transaction.entity';
import { PaymentRequest } from '../payments/entities/payment-request.entity';
import { CreditRequest } from '../credits/entities/credit-request.entity';
import { RefundRequest } from '../refunds/entities/refund-request.entity';
import { Customer } from '../customers/entities/customer.entity';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SalesTransaction,
      PaymentRequest,
      CreditRequest,
      RefundRequest,
      Customer,
    ]),
  ],
  providers: [ReportService],
  controllers: [ReportController],
  exports: [ReportService],
})
export class ReportModule {}
