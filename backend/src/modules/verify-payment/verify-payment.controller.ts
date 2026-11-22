import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { VerifyPaymentService } from './verify-payment.service';
import { Public } from '../../common/decorators/public.decorator';

export class VerifyPaymentDto {
  transactionId: string;
  bank?: string;
  account?: string;
}

@Controller('verify-payment')
export class VerifyPaymentController {
  constructor(private readonly verifyPaymentService: VerifyPaymentService) {}

  @Public()
  @Post()
  async verify(@Body() dto: VerifyPaymentDto) {
    return this.verifyPaymentService.verify(dto.transactionId, dto.bank, dto.account);
  }
}
