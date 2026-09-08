import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditsService } from './credits.service';
import { CreditsController } from './credits.controller';
import { CreditRequest } from './entities/credit-request.entity';
import { Customer } from '../customers/entities/customer.entity';
import { User } from '../auth/entities/user.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([CreditRequest, Customer, User]), EmailModule],
  controllers: [CreditsController],
  providers: [CreditsService],
  exports: [CreditsService],
})
export class CreditsModule {}
