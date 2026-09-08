import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundsService } from './refunds.service';
import { RefundsController } from './refunds.controller';
import { RefundRequest } from './entities/refund-request.entity';
import { Customer } from '../customers/entities/customer.entity';
import { Item } from '../items/entities/item.entity';
import { User } from '../auth/entities/user.entity';
import { ItemsModule } from '../items/items.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefundRequest, Customer, Item, User]),
    ItemsModule,
    EmailModule,
  ],
  controllers: [RefundsController],
  providers: [RefundsService],
  exports: [RefundsService],
})
export class RefundsModule {}
