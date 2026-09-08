import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UploadsService } from './uploads.service'
import { UploadsController } from './uploads.controller'
import { UploadedFile } from './entities/uploaded-file.entity'
import { ExcelModule } from '../excel/excel.module'
import { CustomersModule } from '../customers/customers.module'
import { ItemsModule } from '../items/items.module'
import { TransactionsModule } from '../transactions/transactions.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([UploadedFile]),
    ExcelModule,
    CustomersModule,
    ItemsModule,
    TransactionsModule,
  ],
  providers: [UploadsService],
  controllers: [UploadsController],
  exports: [UploadsService],
})
export class UploadsModule {}
