import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { DashboardGateway } from './dashboard.gateway';
import { Customer } from '../customers/entities/customer.entity';
import { CustomerBalance } from '../customers/entities/customer-balance.entity';
import { CustomersModule } from '../customers/customers.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer, CustomerBalance]),
    CustomersModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService, DashboardGateway],
  exports: [DashboardService, DashboardGateway],
})
export class DashboardModule {}
