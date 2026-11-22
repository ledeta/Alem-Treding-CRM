import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VerifyPaymentService {
  private readonly logger = new Logger(VerifyPaymentService.name);
  private readonly verifyServiceUrl = process.env.VERIFY_SERVICE_URL || 'http://localhost:5001';

  constructor(private readonly httpService: HttpService) {}

  async verify(transactionId: string, bank?: string, account?: string) {
    try {
      this.logger.log(`Verifying transaction: ${transactionId} bank: ${bank}`);

      const response = await firstValueFrom(
        this.httpService.post(`${this.verifyServiceUrl}/verify`, {
          transactionId,
          bank: bank || 'auto',
          account: account || '',
        }, {
          timeout: 30000,
        })
      );

      return {
        success: true,
        verified: true,
        data: response.data?.data,
        bank: response.data?.bank,
        transactionId,
      };
    } catch (error) {
      const errData = error?.response?.data;
      this.logger.error(`Verification failed: ${JSON.stringify(errData || error.message)}`);

      return {
        success: false,
        verified: false,
        error: errData?.error || 'Verification service unavailable. Please verify manually.',
        transactionId,
      };
    }
  }
}
