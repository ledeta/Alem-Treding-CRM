import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiKeyService } from './api-key.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeyController {
  private readonly logger = new Logger('ApiKeyController');

  constructor(private readonly apiKeyService: ApiKeyService) {}

  @Post('generate')
  async generateApiKey(
    @CurrentUser() user: any,
    @Body() { name, scopes, expiresAt }: { name: string; scopes?: string[]; expiresAt?: string }
  ) {
    const apiKey = await this.apiKeyService.generateKey(
      user.id,
      name,
      scopes || ['read', 'write'],
      expiresAt ? new Date(expiresAt) : null
    );

    this.logger.log(`API key generated for user ${user.id}: ${name}`);

    return {
      success: true,
      apiKey,
      message: 'API key generated successfully. Store it safely - you won\'t see it again.',
    };
  }

  @Get('list')
  async listApiKeys(@CurrentUser() user: any) {
    const keys = await this.apiKeyService.listKeys(user.id);

    return {
      success: true,
      keys,
    };
  }

  @Get(':keyId')
  async getApiKey(@CurrentUser() user: any, @Param('keyId') keyId: string) {
    const keys = await this.apiKeyService.listKeys(user.id);
    const key = keys.find((k) => k.id === keyId);

    if (!key) {
      return { success: false, message: 'API key not found' };
    }

    return {
      success: true,
      key,
    };
  }

  @Put(':keyId/scopes')
  async updateScopes(
    @CurrentUser() user: any,
    @Param('keyId') keyId: string,
    @Body() { scopes }: { scopes: string[] }
  ) {
    const updated = await this.apiKeyService.updateKeyScopes(user.id, keyId, scopes);

    this.logger.log(`Scopes updated for API key ${keyId}`);

    return {
      success: true,
      key: updated,
      message: 'Scopes updated successfully',
    };
  }

  @Put(':keyId/ip-whitelist')
  async updateIPWhitelist(
    @CurrentUser() user: any,
    @Param('keyId') keyId: string,
    @Body() { allowedIPs }: { allowedIPs: string[] }
  ) {
    const updated = await this.apiKeyService.updateIPWhitelist(user.id, keyId, allowedIPs);

    this.logger.log(`IP whitelist updated for API key ${keyId}`);

    return {
      success: true,
      key: updated,
      message: 'IP whitelist updated successfully',
    };
  }

  @Delete(':keyId')
  async revokeApiKey(@CurrentUser() user: any, @Param('keyId') keyId: string) {
    await this.apiKeyService.revokeKey(user.id, keyId);

    this.logger.log(`API key revoked for user ${user.id}: ${keyId}`);

    return {
      success: true,
      message: 'API key revoked successfully',
    };
  }

  @Delete(':keyId/permanently')
  async deleteApiKey(@CurrentUser() user: any, @Param('keyId') keyId: string) {
    await this.apiKeyService.deleteKey(user.id, keyId);

    this.logger.log(`API key permanently deleted for user ${user.id}: ${keyId}`);

    return {
      success: true,
      message: 'API key permanently deleted',
    };
  }
}
