import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { BatchService } from './batch.service'
import { Customer } from '../customers/entities/customer.entity'
import { PaymentRequest } from '../payments/entities/payment-request.entity'
import { CreditRequest } from '../credits/entities/credit-request.entity'
import { RefundRequest } from '../refunds/entities/refund-request.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, PaymentRequest, CreditRequest, RefundRequest]),
  ],
  providers: [BatchService],
  exports: [BatchService],
})
export class BatchModule {}
