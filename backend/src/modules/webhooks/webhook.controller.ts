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
import { WebhookService } from './webhook.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('webhooks')
@UseGuards(JwtAuthGuard)
export class WebhookController {
  private readonly logger = new Logger('WebhookController');

  constructor(private readonly webhookService: WebhookService) {}

  @Post('register')
  async registerWebhook(
    @CurrentUser() user: any,
    @Body() { name, url, events }: { name: string; url: string; events: string[] }
  ) {
    const webhook = await this.webhookService.registerWebhook(user.id, name, url, events);

    this.logger.log(`Webhook registered: ${name} for user ${user.id}`);

    return {
      success: true,
      webhook,
      message: 'Webhook registered successfully',
    };
  }

  @Get('list')
  async listWebhooks(@CurrentUser() user: any) {
    const webhooks = await this.webhookService.listWebhooks(user.id);

    return {
      success: true,
      webhooks,
    };
  }

  @Get(':webhookId')
  async getWebhook(@CurrentUser() user: any, @Param('webhookId') webhookId: string) {
    const webhooks = await this.webhookService.listWebhooks(user.id);
    const webhook = webhooks.find((w) => w.id === webhookId);

    if (!webhook) {
      return { success: false, message: 'Webhook not found' };
    }

    return {
      success: true,
      webhook,
    };
  }

  @Put(':webhookId')
  async updateWebhook(
    @CurrentUser() user: any,
    @Param('webhookId') webhookId: string,
    @Body() updates: any
  ) {
    const webhook = await this.webhookService.updateWebhook(user.id, webhookId, updates);

    this.logger.log(`Webhook updated: ${webhookId}`);

    return {
      success: true,
      webhook,
      message: 'Webhook updated successfully',
    };
  }

  @Delete(':webhookId')
  async deleteWebhook(@CurrentUser() user: any, @Param('webhookId') webhookId: string) {
    await this.webhookService.deleteWebhook(user.id, webhookId);

    this.logger.log(`Webhook deleted: ${webhookId}`);

    return {
      success: true,
      message: 'Webhook deleted successfully',
    };
  }

  @Post(':webhookId/test')
  async testWebhook(@CurrentUser() user: any, @Param('webhookId') webhookId: string) {
    const result = await this.webhookService.testWebhook(user.id, webhookId);

    this.logger.log(`Webhook test executed: ${webhookId}`);

    return result;
  }
}
