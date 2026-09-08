import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Webhook } from './webhook.entity';
import { createHmac } from 'crypto';
import { request } from 'http';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(Webhook)
    private webhookRepo: Repository<Webhook>
  ) {}

  async registerWebhook(userId: number, name: string, url: string, events: string[]) {
    // Validate URL
    try {
      new URL(url);
    } catch {
      throw new BadRequestException('Invalid webhook URL');
    }

    const secret = this.generateSecret();

    const webhook = this.webhookRepo.create({
      userId,
      name,
      url,
      events,
      secret,
      isActive: true,
    });

    await this.webhookRepo.save(webhook);
    this.logger.log(`Webhook registered: ${name} for user ${userId}`);

    return {
      id: webhook.id,
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      secret: secret,
    };
  }

  async listWebhooks(userId: number) {
    return this.webhookRepo.find({
      where: { userId },
      select: ['id', 'name', 'url', 'events', 'isActive', 'deliveryCount', 'failureCount', 'lastDeliveredAt'],
    });
  }

  async updateWebhook(userId: number, webhookId: string, updates: any) {
    const webhook = await this.webhookRepo.findOne({
      where: { id: webhookId, userId },
    });

    if (!webhook) {
      throw new BadRequestException('Webhook not found');
    }

    if (updates.url) {
      try {
        new URL(updates.url);
      } catch {
        throw new BadRequestException('Invalid webhook URL');
      }
      webhook.url = updates.url;
    }

    if (updates.events) {
      webhook.events = updates.events;
    }

    if (updates.name) {
      webhook.name = updates.name;
    }

    await this.webhookRepo.save(webhook);
    this.logger.log(`Webhook updated: ${webhookId}`);

    return webhook;
  }

  async deleteWebhook(userId: number, webhookId: string) {
    const webhook = await this.webhookRepo.findOne({
      where: { id: webhookId, userId },
    });

    if (!webhook) {
      throw new BadRequestException('Webhook not found');
    }

    await this.webhookRepo.remove(webhook);
    this.logger.log(`Webhook deleted: ${webhookId}`);

    return { success: true };
  }

  async triggerWebhook(event: string, payload: any) {
    const webhooks = await this.webhookRepo.find({
      where: { isActive: true },
    });

    const relevantWebhooks = webhooks.filter((w) => w.events.includes(event));

    for (const webhook of relevantWebhooks) {
      this.deliverWebhook(webhook, event, payload);
    }
  }

  private async deliverWebhook(webhook: Webhook, event: string, payload: any) {
    const signature = this.generateSignature(JSON.stringify(payload), webhook.secret);
    const payloadStr = JSON.stringify(payload);

    return new Promise<void>((resolve) => {
      try {
        const url = new URL(webhook.url);
        const isHttps = url.protocol === 'https:';
        const httpModule = require(isHttps ? 'https' : 'http');

        const options = {
          method: 'POST',
          headers: {
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payloadStr),
          },
          timeout: 5000,
        };

        const req = httpModule.request(webhook.url, options, (res: any) => {
          webhook.deliveryCount++;
          webhook.lastDeliveredAt = new Date();
          webhook.lastError = null;
          this.webhookRepo.save(webhook);
          this.logger.log(`Webhook delivered: ${webhook.id} for event ${event}`);
          resolve();
        });

        req.on('error', (error: any) => {
          webhook.failureCount++;
          webhook.lastError = error.message;
          this.webhookRepo.save(webhook);
          this.logger.error(`Webhook delivery failed: ${webhook.id} - ${error.message}`);
          resolve();
        });

        req.write(payloadStr);
        req.end();
      } catch (error: any) {
        webhook.failureCount++;
        webhook.lastError = error.message;
        this.webhookRepo.save(webhook);
        this.logger.error(`Webhook delivery failed: ${webhook.id} - ${error.message}`);
        resolve();
      }
    });
  }

  private generateSecret(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  private generateSignature(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
  }

  async testWebhook(userId: number, webhookId: string) {
    const webhook = await this.webhookRepo.findOne({
      where: { id: webhookId, userId },
    });

    if (!webhook) {
      throw new BadRequestException('Webhook not found');
    }

    const testPayload = {
      event: 'test.webhook',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook delivery',
      },
    };

    await this.deliverWebhook(webhook, 'test.webhook', testPayload);

    return {
      success: true,
      message: 'Test webhook sent',
    };
  }
}
