import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { VerifyPaymentService } from './verify-payment.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';

export class VerifyPaymentDto {
  transactionId: string;
  bank?: string;
  account?: string;
}

@Controller('verify-payment')
@UseGuards(JwtAuthGuard)
export class VerifyPaymentController {
  constructor(private readonly verifyPaymentService: VerifyPaymentService) {}

  @Post()
  async verify(@Body() dto: VerifyPaymentDto) {
    return this.verifyPaymentService.verify(dto.transactionId, dto.bank, dto.account);
  }
}
