import { Controller, Post, Body } from '@nestjs/common';
import { VerifyPaymentService } from './verify-payment.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('verify-payment')
export class VerifyPaymentController {
  constructor(private readonly verifyPaymentService: VerifyPaymentService) {}

  @Public()
  @Post()
  async verify(@Body() body: any) {
    const transactionId = body?.transactionId || body?.transaction_id || '';
    const bank = body?.bank || '';
    const account = body?.account || '';
    return this.verifyPaymentService.verify(transactionId, bank, account);
  }
}
