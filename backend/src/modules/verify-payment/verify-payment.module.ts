import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { VerifyPaymentController } from './verify-payment.controller';
import { VerifyPaymentService } from './verify-payment.service';

@Module({
  imports: [HttpModule],
  controllers: [VerifyPaymentController],
  providers: [VerifyPaymentService],
  exports: [VerifyPaymentService],
})
export class VerifyPaymentModule {}
