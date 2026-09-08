import { Injectable, BadRequestException, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ApiKey } from './api-key.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class ApiKeyService {
  private readonly logger = new Logger(ApiKeyService.name);

  constructor(
    @InjectRepository(ApiKey)
    private apiKeyRepo: Repository<ApiKey>
  ) {}

  async generateKey(userId: number, name: string, scopes: string[], expiresAt?: Date) {
    const token = `alem_${randomBytes(32).toString('hex')}`;

    const apiKey = this.apiKeyRepo.create({
      userId,
      token,
      name,
      scopes: scopes || ['read', 'write'],
      expiresAt,
      isActive: true,
    });

    await this.apiKeyRepo.save(apiKey);
    this.logger.log(`API key created: ${name} for user ${userId}`);

    return {
      id: apiKey.id,
      token,
      name,
      scopes: apiKey.scopes,
      expiresAt,
      createdAt: apiKey.createdAt,
    };
  }

  async validateApiKey(token: string, requiredScopes?: string[], clientIP?: string) {
    const apiKey = await this.apiKeyRepo.findOne({
      where: { token, isActive: true },
      relations: ['user'],
    });

    if (!apiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Check if expired
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      apiKey.isActive = false;
      await this.apiKeyRepo.save(apiKey);
      throw new UnauthorizedException('API key expired');
    }

    // Check IP whitelist
    if (apiKey.allowedIPs && apiKey.allowedIPs.length > 0 && clientIP) {
      if (!apiKey.allowedIPs.includes(clientIP)) {
        this.logger.warn(`Unauthorized IP access attempt with key ${apiKey.id}: ${clientIP}`);
        throw new UnauthorizedException('IP not whitelisted');
      }
    }

    // Check scopes
    if (requiredScopes && requiredScopes.length > 0) {
      const hasAllScopes = requiredScopes.every((scope) => apiKey.scopes.includes(scope));
      if (!hasAllScopes) {
        throw new UnauthorizedException('Insufficient permissions');
      }
    }

    // Update usage stats
    apiKey.lastUsedAt = new Date();
    apiKey.usageCount++;
    apiKey.lastUsedIP = clientIP;
    await this.apiKeyRepo.save(apiKey);

    return apiKey;
  }

  async listKeys(userId: number) {
    const keys = await this.apiKeyRepo.find({
      where: { userId },
      select: ['id', 'name', 'scopes', 'isActive', 'expiresAt', 'lastUsedAt', 'usageCount', 'createdAt'],
    });

    return keys;
  }

  async revokeKey(userId: number, keyId: string) {
    const apiKey = await this.apiKeyRepo.findOne({
      where: { id: keyId, userId },
    });

    if (!apiKey) {
      throw new BadRequestException('API key not found');
    }

    apiKey.isActive = false;
    await this.apiKeyRepo.save(apiKey);
    this.logger.log(`API key revoked: ${keyId}`);

    return { success: true };
  }

  async updateKeyScopes(userId: number, keyId: string, scopes: string[]) {
    const apiKey = await this.apiKeyRepo.findOne({
      where: { id: keyId, userId },
    });

    if (!apiKey) {
      throw new BadRequestException('API key not found');
    }

    apiKey.scopes = scopes;
    await this.apiKeyRepo.save(apiKey);
    this.logger.log(`API key scopes updated: ${keyId}`);

    return apiKey;
  }

  async updateIPWhitelist(userId: number, keyId: string, allowedIPs: string[]) {
    const apiKey = await this.apiKeyRepo.findOne({
      where: { id: keyId, userId },
    });

    if (!apiKey) {
      throw new BadRequestException('API key not found');
    }

    apiKey.allowedIPs = allowedIPs && allowedIPs.length > 0 ? allowedIPs : null;
    await this.apiKeyRepo.save(apiKey);
    this.logger.log(`API key IP whitelist updated: ${keyId}`);

    return apiKey;
  }

  async deleteKey(userId: number, keyId: string) {
    const apiKey = await this.apiKeyRepo.findOne({
      where: { id: keyId, userId },
    });

    if (!apiKey) {
      throw new BadRequestException('API key not found');
    }

    await this.apiKeyRepo.remove(apiKey);
    this.logger.log(`API key deleted: ${keyId}`);

    return { success: true };
  }
}
