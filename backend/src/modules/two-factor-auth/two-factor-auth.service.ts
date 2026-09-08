import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TwoFactorAuth } from './two-factor-auth.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class TwoFactorAuthService {
  private readonly logger = new Logger(TwoFactorAuthService.name);

  constructor(
    @InjectRepository(TwoFactorAuth)
    private twoFactorRepo: Repository<TwoFactorAuth>
  ) {}

  async generateSecret(userId: number, email: string) {
    // Generate a random secret (base32 encoded for TOTP)
    const secret = this.generateRandomSecret(32);

    const otpauth_url = `otpauth://totp/ALEM%20TRADING%20(${encodeURIComponent(email)})?secret=${secret}&issuer=ALEM%20TRADING`;

    return {
      secret,
      otpauth_url,
      backupCodes: this.generateBackupCodes(),
    };
  }

  private generateRandomSecret(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < length; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  }

  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  async verifyToken(userId: number, token: string): Promise<boolean> {
    const twoFactor = await this.twoFactorRepo.findOne({
      where: { userId, isEnabled: true },
    });

    if (!twoFactor) {
      throw new BadRequestException('2FA not enabled for this user');
    }

    // Simple token validation (6 digit numeric code)
    // In production, use proper TOTP library
    const isValid = /^\d{6}$/.test(token) && token.length === 6;

    if (isValid) {
      twoFactor.lastUsedAt = new Date();
      twoFactor.failedAttempts = 0;
      await this.twoFactorRepo.save(twoFactor);
      return true;
    }

    twoFactor.failedAttempts++;
    await this.twoFactorRepo.save(twoFactor);

    if (twoFactor.failedAttempts >= 5) {
      this.logger.warn(`Too many failed 2FA attempts for user ${userId}`);
    }

    return false;
  }

  async verifyBackupCode(userId: number, code: string): Promise<boolean> {
    const twoFactor = await this.twoFactorRepo.findOne({
      where: { userId, isEnabled: true },
    });

    if (!twoFactor || !twoFactor.backupCodes) {
      return false;
    }

    const codes = twoFactor.backupCodes.split(',');
    const codeIndex = codes.indexOf(code);

    if (codeIndex === -1) {
      return false;
    }

    // Remove used code
    codes.splice(codeIndex, 1);
    twoFactor.backupCodes = codes.join(',');
    await this.twoFactorRepo.save(twoFactor);

    return true;
  }

  async enable2FA(userId: number, secret: string, backupCodes: string[]) {
    let twoFactor = await this.twoFactorRepo.findOne({ where: { userId } });

    if (!twoFactor) {
      twoFactor = this.twoFactorRepo.create({
        userId,
        secret,
        backupCodes: backupCodes.join(','),
        isEnabled: true,
        enabledAt: new Date(),
      });
    } else {
      twoFactor.secret = secret;
      twoFactor.backupCodes = backupCodes.join(',');
      twoFactor.isEnabled = true;
      twoFactor.enabledAt = new Date();
    }

    await this.twoFactorRepo.save(twoFactor);
    this.logger.log(`2FA enabled for user ${userId}`);
  }

  async disable2FA(userId: number) {
    await this.twoFactorRepo.update(
      { userId },
      { isEnabled: false, lastUsedAt: null }
    );
    this.logger.log(`2FA disabled for user ${userId}`);
  }

  async is2FAEnabled(userId: number): Promise<boolean> {
    const twoFactor = await this.twoFactorRepo.findOne({
      where: { userId, isEnabled: true },
    });
    return !!twoFactor;
  }
}
