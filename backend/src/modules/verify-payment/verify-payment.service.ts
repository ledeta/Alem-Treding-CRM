import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class VerifyPaymentService {
  private readonly logger = new Logger(VerifyPaymentService.name);

  private detectBank(transactionId: string): string {
    const tid = transactionId.trim().toUpperCase();
    // CBE new receipt links
    if (tid.includes('MBRECIEPT.CBE.COM.ET') || tid.includes('MB.CBE.COM.ET')) return 'cbe';
    // CBE legacy FT
    if (tid.startsWith('FT')) return 'cbe';
    // Telebirr
    if (tid.startsWith('CHQ') || tid.includes('TRANSACTIONINFO.ETHIOTELECOM')) return 'telebirr';
    // Dashen
    if (tid.includes('ETAP') || tid.includes('RECEIPTS.DASHENBANKSC') || tid.includes('DASHENSUPERAPP')) return 'dashen';
    // Awash
    if (tid.includes('AWASHPAY') || tid.startsWith('AW')) return 'awash';
    // BOA
    if (tid.includes('CS.BANKOFABYSSINIA') || tid.startsWith('BOA')) return 'boa';
    // M-Pesa
    if (tid.includes('MPESA') || tid.includes('SAFARICOM')) return 'mpesa';
    // Siinqee
    if (tid.includes('SIINQEE')) return 'siinqee';
    // eBirr
    if (tid.includes('EBIRR')) return 'ebirr';
    // ZamZam
    if (tid.includes('ZAMZAM')) return 'zamzam';
    // CBE Birr
    if (tid.startsWith('DTS') || tid.includes('CBEPAY')) return 'cbebirr';
    // Bunna
    if (tid.includes('BUNNABANKSC')) return 'bunna';
    // Wegagen
    if (tid.includes('WEGAGEN')) return 'wegagen';
    return 'cbe'; // default
  }

  async verify(transactionId: string, bank?: string, account?: string, phoneNumber?: string) {
    if (!transactionId?.trim()) {
      return { success: false, verified: false, error: 'Transaction ID is required' };
    }

    const tid = transactionId.trim();
    const detectedBank = (bank && bank !== 'auto' && bank !== '') 
      ? bank.toLowerCase().replace(/\s+/g, '').replace('commercialbank', 'cbe').replace('commercialbankofethiopia', 'cbe')
      : this.detectBank(tid);

    this.logger.log(`Verifying ${detectedBank} transaction: ${tid}`);

    try {
      // Dynamically import cheki-verify (ES module)
      const { Cheki, isVerified } = await import('cheki-verify');
      const cheki = new Cheki();

      const options: any = {
        bank: detectedBank,
        reference: tid,
      };

      // Add account number for CBE legacy FT and BOA
      if (account?.trim()) {
        options.accountNumber = account.trim();
      }

      // Add phone number for CBE Birr
      if (phoneNumber?.trim()) {
        options.phoneNumber = phoneNumber.trim();
      }

      this.logger.log(`Cheki options: ${JSON.stringify(options)}`);

      const result = await cheki.verify(options.bank, options.reference, {
        accountNumber: options.accountNumber,
        phoneNumber: options.phoneNumber,
      });

      this.logger.log(`Cheki result: verified=${result.verified}, bank=${result.bank}`);

      if (isVerified(result)) {
        return {
          success: true,
          verified: true,
          bank: result.bank || detectedBank,
          bankCode: result.bankCode || detectedBank,
          transactionId: tid,
          cached: (result as any).cached || false,
          data: {
            payer_name: (result as any).senderName || null,
            payer_account: (result as any).senderAccount || null,
            receiver_name: (result as any).receiverName || null,
            receiver_account: (result as any).receiverAccount || null,
            amount: (result as any).amount || null,
            currency: (result as any).currency || 'ETB',
            date: (result as any).date || null,
            reference: (result as any).reference || tid,
            status: 'SUCCESS',
          },
        };
      }

      // Not verified but got a response
      return {
        success: false,
        verified: false,
        bank: detectedBank,
        transactionId: tid,
        error: (result as any).error
          || 'Transaction could not be confirmed by the bank. The receipt may be invalid or not found.',
        fallbackUrl: (result as any).fallbackUrl || null,
      };

    } catch (error) {
      this.logger.error(`Cheki verification error: ${error.message}`);

      // Handle geo-blocked banks (Telebirr, M-Pesa)
      if (error.message?.includes('502') || error.message?.includes('fallback')) {
        return {
          success: false,
          verified: false,
          error: 'This bank (Telebirr/M-Pesa) cannot be verified from outside Ethiopia. Please check the receipt manually.',
          transactionId: tid,
          fallbackUrl: `https://transactioninfo.ethiotelecom.et/receipt/${tid}`,
        };
      }

      // Rate limit
      if (error.message?.includes('429')) {
        return {
          success: false,
          verified: false,
          error: 'Too many verification requests. Please wait a moment and try again.',
          transactionId: tid,
        };
      }

      return {
        success: false,
        verified: false,
        error: `Verification failed: ${error.message}`,
        transactionId: tid,
      };
    }
  }
}
