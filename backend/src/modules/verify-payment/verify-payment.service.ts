import { Injectable, Logger } from '@nestjs/common';
import * as https from 'https';
import * as http from 'http';

@Injectable()
export class VerifyPaymentService {
  private readonly logger = new Logger(VerifyPaymentService.name);

  private detectBank(transactionId: string): string {
    const tid = transactionId.trim().toUpperCase();
    if (tid.startsWith('FT')) return 'cbe';
    if (tid.startsWith('CHQ') || (tid.length === 10 && /^[A-Z0-9]+$/.test(tid))) return 'tele';
    if (tid.includes('ETAP')) return 'dashen';
    if (tid.startsWith('AW') || tid.startsWith('-')) return 'awash';
    if (tid.startsWith('BOA')) return 'boa';
    if (tid.startsWith('ZM')) return 'zemen';
    return 'cbe'; // default to CBE
  }

  private fetchUrl(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https');
      const lib = isHttps ? https : http;
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html,application/json,*/*',
        },
        rejectUnauthorized: false,
        timeout: 20000,
      };

      const req = lib.get(url, options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => resolve(data));
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timed out'));
      });
      req.setTimeout(20000);
    });
  }

  async verify(transactionId: string, bank?: string, account?: string) {
    const tid = transactionId.trim();
    const detectedBank = (bank && bank !== 'auto' && bank !== '') ? bank.toLowerCase() : this.detectBank(tid);

    this.logger.log(`Verifying ${detectedBank} transaction: ${tid}`);

    try {
      switch (detectedBank) {
        case 'cbe':
        case 'commercial bank of ethiopia':
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
    // Normalize: remove FT prefix if already there, then add it back
    const tid = transactionId.toUpperCase().replace(/^FT/i, '');
    const acc = (account || '').replace(/\D/g, '').slice(-8);

    // Try with account suffix first, then without
    const urls = acc
      ? [`https://apps.cbe.com.et:100/?id=FT${tid}${acc}`, `https://apps.cbe.com.et:100/?id=FT${tid}`]
      : [`https://apps.cbe.com.et:100/?id=FT${tid}`];

    for (const url of urls) {
      this.logger.log(`CBE request: ${url}`);
      try {
        const html = await this.fetchUrl(url);
        const result = this.parseCBEHtml(html, transactionId);
        if (result.success) return result;
      } catch (e) {
        this.logger.warn(`CBE URL failed: ${url} - ${e.message}`);
      }
    }

    return {
      success: false,
      verified: false,
      error: 'CBE receipt not found. Please check the transaction ID (format: FT26326L38T6).',
      transactionId,
    };
  }

  private parseCBEHtml(html: string, transactionId: string) {
    if (!html || html.length < 100) {
      return { success: false, verified: false, error: 'Empty response from CBE', transactionId };
    }

    // Check for error pages
    if (html.toLowerCase().includes('not found') || html.toLowerCase().includes('invalid')) {
      return { success: false, verified: false, error: 'Transaction not found in CBE', transactionId };
    }

    // Extract fields from CBE HTML receipt
    const getText = (pattern: RegExp): string | null => {
      const m = html.match(pattern);
      return m ? m[1].replace(/<[^>]+>/g, '').trim() : null;
    };

    // CBE receipt patterns
    const amount = getText(/(?:Amount|ብር)[^>]*>[\s\S]*?>([\d,\.]+)\s*(?:ETB|Birr)?/i)
      || getText(/([\d,]+\.?\d*)\s*ETB/i);
    const payerName = getText(/(?:Sender|From|Payer)[^>]*>[\s\S]{1,50}?<[^>]+>([A-Za-z][A-Za-z\s]{2,40})</i);
    const receiverName = getText(/(?:Receiver|To|Beneficiary)[^>]*>[\s\S]{1,50}?<[^>]+>([A-Za-z][A-Za-z\s]{2,40})</i);
    const date = getText(/(\d{4}[-\/]\d{2}[-\/]\d{2}[T ]\d{2}:\d{2})/);
    const reference = getText(/(?:Reference|Ref\.?|TxnNo)[^>]*>[\s\S]{1,30}?<[^>]+>([A-Z0-9]+)</i)
      || transactionId;

    const hasContent = !!(amount || payerName || reference !== transactionId);

    if (hasContent || html.length > 1000) {
      return {
        success: true,
        verified: true,
        bank: 'CBE',
        transactionId,
        data: {
          payer_name: payerName || null,
          receiver_name: receiverName || null,
          amount: amount ? parseFloat(amount.replace(/,/g, '')) : null,
          currency: 'ETB',
          date: date || new Date().toISOString(),
          reference: reference || transactionId,
          status: 'SUCCESS',
        },
      };
    }

    return {
      success: false,
      verified: false,
      error: 'Could not parse CBE receipt. Transaction may not exist.',
      transactionId,
    };
  }

  private async verifyTelebirr(transactionId: string) {
    const url = `https://transactioninfo.ethiotelecom.et/receipt/${transactionId}`;
    this.logger.log(`Telebirr request: ${url}`);

    try {
      const body = await this.fetchUrl(url);
      let data: any;

      try { data = JSON.parse(body); } catch { data = null; }

      if (data && (data.amount || data.transAmount)) {
        return {
          success: true,
          verified: true,
          bank: 'Telebirr',
          transactionId,
          data: {
            payer_phone: data.senderPhone || data.payer_phone || null,
            payer_name: data.senderName || data.payer_name || null,
            receiver_name: data.receiverName || data.receiver_name || null,
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
        error: 'Telebirr receipt not found. Note: Telebirr may be restricted outside Ethiopia.',
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
      const body = await this.fetchUrl(url);
      let data: any;
      try { data = JSON.parse(body); } catch { data = {}; }

      return {
        success: true,
        verified: true,
        bank: 'Dashen',
        transactionId,
        data: {
          payer_name: data.senderName || null,
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
      const body = await this.fetchUrl(url);
      let data: any;
      try { data = JSON.parse(body); } catch { data = {}; }

      return {
        success: true,
        verified: true,
        bank: 'Awash',
        transactionId,
        data: {
          payer_name: data.payer_name || null,
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
