import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwoFactorAuth } from './two-factor-auth.entity';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { TwoFactorAuthController } from './two-factor-auth.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TwoFactorAuth])],
  controllers: [TwoFactorAuthController],
  providers: [TwoFactorAuthService],
  exports: [TwoFactorAuthService],
})
export class TwoFactorAuthModule {}
