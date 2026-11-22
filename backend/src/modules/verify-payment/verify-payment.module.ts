import { Module } from '@nestjs/common';
import { VerifyPaymentController } from './verify-payment.controller';
import { VerifyPaymentService } from './verify-payment.service';

@Module({
  controllers: [VerifyPaymentController],
  providers: [VerifyPaymentService],
  exports: [VerifyPaymentService],
})
export class VerifyPaymentModule {}
