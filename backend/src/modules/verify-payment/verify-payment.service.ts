import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VerifyPaymentService {
  private readonly logger = new Logger(VerifyPaymentService.name);

  constructor(private readonly httpService: HttpService) {}

  private detectBank(transactionId: string): string {
    const tid = transactionId.trim().toUpperCase();
    if (tid.startsWith('FT')) return 'cbe';
    if (tid.startsWith('CHQ') || (tid.length === 10 && /^[A-Z0-9]+$/.test(tid))) return 'tele';
    if (tid.includes('ETAP')) return 'dashen';
    if (tid.startsWith('AW') || tid.startsWith('-')) return 'awash';
    if (tid.startsWith('BOA')) return 'boa';
    if (tid.startsWith('ZM')) return 'zemen';
    return 'unknown';
  }

  async verify(transactionId: string, bank?: string, account?: string) {
    const tid = transactionId.trim();
    const detectedBank = bank || this.detectBank(tid);

    this.logger.log(`Verifying ${detectedBank} transaction: ${tid}`);

    try {
      switch (detectedBank.toLowerCase()) {
        case 'cbe':
          return await this.verifyCBE(tid, account);
        case 'tele':
        case 'telebirr':
          return await this.verifyTelebirr(tid);
        case 'dashen':
          return await this.verifyDashen(tid);
        case 'awash':
          return await this.verifyAwash(tid);
        default:
          return await this.verifyCBE(tid, account);
      }
    } catch (error) {
      this.logger.error(`Verification error: ${error.message}`);
      return {
        success: false,
        verified: false,
        error: `Verification failed: ${error.message}`,
        transactionId: tid,
      };
    }
  }

  private async verifyCBE(transactionId: string, account?: string) {
    // CBE receipt URL format: https://apps.cbe.com.et:100/?id=FT{id}{last8digits}
    const tid = transactionId.toUpperCase().replace(/^FT/i, '');
    const acc = (account || '').replace(/\D/g, '').slice(-8);
    const url = `https://apps.cbe.com.et:100/?id=FT${tid}${acc}`;

    this.logger.log(`CBE URL: ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          timeout: 20000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
        })
      );

      const html = response.data as string;
      return this.parseCBEHtml(html, transactionId);
    } catch (error) {
      this.logger.error(`CBE request failed: ${error.message}`);

      // Try alternate URL format without account
      if (!account) {
        const altUrl = `https://apps.cbe.com.et:100/?id=FT${tid}`;
        try {
          const r2 = await firstValueFrom(
            this.httpService.get(altUrl, {
              timeout: 15000,
              headers: { 'User-Agent': 'Mozilla/5.0' },
              httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
            })
          );
          return this.parseCBEHtml(r2.data as string, transactionId);
        } catch (e2) {
          this.logger.error(`CBE alt request failed: ${e2.message}`);
        }
      }

      return {
        success: false,
        verified: false,
        error: 'Could not reach CBE receipt server. Please check transaction ID or try again.',
        transactionId,
        hint: account
          ? `Tried: ${url}`
          : 'For CBE, try entering your account last 8 digits in the account field.',
      };
    }
  }

  private parseCBEHtml(html: string, transactionId: string) {
    // CBE returns HTML with receipt details
    const extract = (pattern: RegExp) => {
      const m = html.match(pattern);
      return m ? m[1].replace(/<[^>]+>/g, '').trim() : null;
    };

    // Try to extract key fields from CBE receipt HTML
    const amount = extract(/[Aa]mount[^>]*>[^<]*<[^>]*>\s*([0-9,\.]+)/);
    const payerName = extract(/[Ss]ender[^>]*>[^<]*<[^>]*>\s*([A-Za-z ]+)/);
    const receiverName = extract(/[Rr]eceiver[^>]*>[^<]*<[^>]*>\s*([A-Za-z ]+)/);
    const date = extract(/[Dd]ate[^>]*>[^<]*<[^>]*>\s*(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2})/);
    const reference = extract(/[Rr]ef(?:erence)?[^>]*>[^<]*<[^>]*>\s*([A-Z0-9]+)/);
    const status = html.toLowerCase().includes('success') ? 'SUCCESS' :
                   html.toLowerCase().includes('fail') ? 'FAILED' : 'SUCCESS';

    // If HTML looks like a valid receipt (has amount or reference)
    if (amount || reference || html.length > 500) {
      return {
        success: true,
        verified: true,
        bank: 'cbe',
        transactionId,
        data: {
          payer_name: payerName || 'CBE Customer',
          receiver_name: receiverName || null,
          amount: amount ? parseFloat(amount.replace(/,/g, '')) : null,
          currency: 'ETB',
          date: date || new Date().toISOString(),
          reference: reference || transactionId,
          status,
        },
      };
    }

    return {
      success: false,
      verified: false,
      error: 'Receipt not found. Please check the transaction ID.',
      transactionId,
    };
  }

  private async verifyTelebirr(transactionId: string) {
    const url = `https://transactioninfo.ethiotelecom.et/receipt/${transactionId}`;
    this.logger.log(`Telebirr URL: ${url}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          timeout: 20000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36',
            'Accept': 'application/json, text/html, */*',
          },
        })
      );

      const data = response.data;
      if (typeof data === 'object') {
        return {
          success: true,
          verified: true,
          bank: 'telebirr',
          transactionId,
          data: {
            payer_phone: data.senderPhone || data.payer_phone || null,
            payer_name: data.senderName || data.payer_name || null,
            receiver_name: data.receiverName || data.receiver_name || null,
            receiver_account: data.receiverAccount || null,
            amount: parseFloat(data.amount || data.transAmount || 0),
            currency: 'ETB',
            date: data.transTime || data.date || new Date().toISOString(),
            reference: data.receiptNo || transactionId,
            status: 'SUCCESS',
          },
        };
      }

      return {
        success: false,
        verified: false,
        error: 'Telebirr receipt not found.',
        transactionId,
      };
    } catch (error) {
      return {
        success: false,
        verified: false,
        error: 'Telebirr verification failed. This service may be restricted outside Ethiopia.',
        transactionId,
      };
    }
  }

  private async verifyDashen(transactionId: string) {
    const url = `https://receipt.dashensuperapp.com/receipt/${transactionId}`;
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          timeout: 15000,
          headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json, text/html' },
        })
      );
      const data = response.data;
      return {
        success: true,
        verified: true,
        bank: 'dashen',
        transactionId,
        data: {
          payer_name: data.senderName || data.payer_name || 'Dashen Customer',
          receiver_name: data.receiverName || null,
          amount: parseFloat(data.amount || 0),
          currency: 'ETB',
          date: data.date || new Date().toISOString(),
          reference: transactionId,
          status: 'SUCCESS',
        },
      };
    } catch (error) {
      return { success: false, verified: false, error: 'Dashen verification failed.', transactionId };
    }
  }

  private async verifyAwash(transactionId: string) {
    const url = `https://awashpay.awashbank.com:8225/${transactionId}`;
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          timeout: 15000,
          headers: { 'User-Agent': 'Mozilla/5.0' },
          httpsAgent: new (require('https').Agent)({ rejectUnauthorized: false }),
        })
      );
      const data = response.data;
      return {
        success: true,
        verified: true,
        bank: 'awash',
        transactionId,
        data: {
          payer_name: data.payer_name || 'Awash Customer',
          receiver_name: data.receiver_name || null,
          amount: parseFloat(data.amount || 0),
          currency: 'ETB',
          date: data.date || new Date().toISOString(),
          reference: transactionId,
          status: 'SUCCESS',
        },
      };
    } catch (error) {
      return { success: false, verified: false, error: 'Awash verification failed.', transactionId };
    }
  }
}
