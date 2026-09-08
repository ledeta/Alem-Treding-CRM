import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { SalesTransaction } from './entities/sales-transaction.entity';
import { Customer } from '../customers/entities/customer.entity';
import { CustomerBalance } from '../customers/entities/customer-balance.entity';
import { Item } from '../items/entities/item.entity';
import { User } from '../auth/entities/user.entity';
import { ItemsModule } from '../items/items.module';
import { ExcelModule } from '../excel/excel.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SalesTransaction, Customer, CustomerBalance, Item, User]),
    ItemsModule,
    ExcelModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
