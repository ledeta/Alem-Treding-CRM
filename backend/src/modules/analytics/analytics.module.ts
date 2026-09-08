import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AnalyticsService } from './analytics.service'
import { AnalyticsController } from './analytics.controller'
import { Customer } from '../customers/entities/customer.entity'
import { SalesTransaction } from '../transactions/entities/sales-transaction.entity'
import { PaymentRequest } from '../payments/entities/payment-request.entity'
import { Item } from '../items/entities/item.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Customer, SalesTransaction, PaymentRequest, Item])],
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
