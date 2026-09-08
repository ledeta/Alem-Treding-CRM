import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SearchService } from './search.service'
import { SearchController } from './search.controller'
import { Customer } from '../customers/entities/customer.entity'
import { Item } from '../items/entities/item.entity'
import { SalesTransaction } from '../transactions/entities/sales-transaction.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Item, SalesTransaction])],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
