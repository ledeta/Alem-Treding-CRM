import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Logger,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('2fa')
@UseGuards(JwtAuthGuard)
export class TwoFactorAuthController {
  private readonly logger = new Logger('TwoFactorAuthController');

  constructor(private readonly twoFactorService: TwoFactorAuthService) {}

  @Post('setup')
  async setupTwoFactor(@CurrentUser() user: any) {
    try {
      const { secret, otpauth_url, backupCodes } = await this.twoFactorService.generateSecret(
        user.id,
        user.email
      );

      this.logger.log(`2FA setup requested for user ${user.id}`);

      return {
        success: true,
        secret,
        otpauth_url,
        backupCodes,
        message: 'Scan QR code with authenticator app or enter secret manually',
      };
    } catch (error) {
      this.logger.error(`2FA setup failed: ${error.message}`);
      throw new BadRequestException('Failed to setup 2FA');
    }
  }

  @Post('enable')
  async enableTwoFactor(
    @CurrentUser() user: any,
    @Body() { secret, verificationCode }: { secret: string; verificationCode: string }
  ) {
    try {
      const isValid = await this.twoFactorService.verifyToken(user.id, verificationCode);

      if (!isValid) {
        throw new BadRequestException('Invalid verification code');
      }

      const { backupCodes } = await this.twoFactorService.generateSecret(
        user.id,
        user.email
      );

      await this.twoFactorService.enable2FA(user.id, secret, backupCodes);

      this.logger.log(`2FA enabled for user ${user.id}`);

      return {
        success: true,
        backupCodes,
        message: '2FA successfully enabled. Save backup codes in a safe place.',
      };
    } catch (error) {
      this.logger.error(`2FA enable failed: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to enable 2FA');
    }
  }

  @Post('disable')
  async disableTwoFactor(@CurrentUser() user: any, @Body() { password }: { password: string }) {
    try {
      // In production, verify password here
      await this.twoFactorService.disable2FA(user.id);

      this.logger.log(`2FA disabled for user ${user.id}`);

      return {
        success: true,
        message: '2FA successfully disabled',
      };
    } catch (error) {
      this.logger.error(`2FA disable failed: ${error.message}`);
      throw new BadRequestException('Failed to disable 2FA');
    }
  }

  @Get('status')
  async check2FAStatus(@CurrentUser() user: any) {
    const is2FAEnabled = await this.twoFactorService.is2FAEnabled(user.id);

    return {
      enabled: is2FAEnabled,
      userId: user.id,
    };
  }

  @Post('verify')
  async verifyToken(
    @CurrentUser() user: any,
    @Body() { token }: { token: string }
  ) {
    try {
      const isValid = await this.twoFactorService.verifyToken(user.id, token);

      if (!isValid) {
        throw new BadRequestException('Invalid token or expired');
      }

      return {
        success: true,
        message: 'Token verified successfully',
      };
    } catch (error) {
      this.logger.error(`Token verification failed: ${error.message}`);
      throw new BadRequestException(error.message || 'Token verification failed');
    }
  }

  @Post('verify-backup-code')
  async verifyBackupCode(
    @CurrentUser() user: any,
    @Body() { code }: { code: string }
  ) {
    try {
      const isValid = await this.twoFactorService.verifyBackupCode(user.id, code);

      if (!isValid) {
        throw new BadRequestException('Invalid backup code');
      }

      return {
        success: true,
        message: 'Backup code verified successfully',
      };
    } catch (error) {
      this.logger.error(`Backup code verification failed: ${error.message}`);
      throw new BadRequestException(error.message || 'Backup code verification failed');
    }
  }
}
