import {
  Controller,
  Post,
  Body,
  UseGuards,
  Logger,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { EmailService } from './email.service';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { RoleGuard } from '../../common/guards/role.guard';

@Controller('email')
@UseGuards(JwtAuthGuard, RoleGuard)
export class EmailController {
  private readonly logger = new Logger('EmailController');

  constructor(private readonly emailService: EmailService) {}

  @Post('send-test')
  @Roles('admin')
  async sendTestEmail(@Body() { email, subject }: { email: string; subject?: string }) {
    try {
      const result = await this.emailService.sendEmail({
        to: email,
        subject: subject || 'Test Email from ALEM TRADING',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a2332;">Test Email</h2>
            <p>This is a test email from ALEM TRADING Management System.</p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              Sent at ${new Date().toLocaleString()}
            </p>
          </div>
        `,
      });

      if (!result) {
        throw new BadRequestException('Failed to send email');
      }

      this.logger.log(`Test email sent to ${email}`);
      return { success: true, message: 'Test email sent successfully' };
    } catch (error) {
      this.logger.error(`Error sending test email: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to send test email');
    }
  }

  @Post('send-password-reset/:userId')
  async sendPasswordResetEmail(
    @Param('userId') userId: string,
    @Body() { email, name, resetToken }: { email: string; name: string; resetToken: string }
  ) {
    try {
      if (!email || !resetToken) {
        throw new BadRequestException('Email and reset token are required');
      }

      const result = await this.emailService.sendPasswordResetEmail(email, resetToken, name || 'User');

      if (!result) {
        throw new BadRequestException('Failed to send password reset email');
      }

      this.logger.log(`Password reset email sent to ${email}`);
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      this.logger.error(`Error sending password reset email: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to send password reset email');
    }
  }

  @Post('send-approval/:approvalId')
  @Roles('admin')
  async sendApprovalNotification(
    @Param('approvalId') approvalId: string,
    @Body()
    {
      email,
      name,
      requestType,
      status,
      details,
    }: {
      email: string;
      name: string;
      requestType: string;
      status: 'approved' | 'rejected';
      details: { amount: number; reason: string; date: string };
    }
  ) {
    try {
      if (!email || !requestType || !status) {
        throw new BadRequestException('Email, request type, and status are required');
      }

      const result = await this.emailService.sendApprovalNotificationEmail(
        email,
        requestType,
        status,
        details,
        name || 'User'
      );

      if (!result) {
        throw new BadRequestException('Failed to send approval notification');
      }

      this.logger.log(`Approval notification sent to ${email} for ${requestType}`);
      return { success: true, message: 'Approval notification sent' };
    } catch (error) {
      this.logger.error(`Error sending approval notification: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to send approval notification');
    }
  }

  @Post('send-welcome')
  @Roles('admin')
  async sendWelcomeEmail(
    @Body() { email, name, username }: { email: string; name: string; username: string }
  ) {
    try {
      if (!email || !name || !username) {
        throw new BadRequestException('Email, name, and username are required');
      }

      const result = await this.emailService.sendWelcomeEmail(email, name, username);

      if (!result) {
        throw new BadRequestException('Failed to send welcome email');
      }

      this.logger.log(`Welcome email sent to ${email}`);
      return { success: true, message: 'Welcome email sent' };
    } catch (error) {
      this.logger.error(`Error sending welcome email: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to send welcome email');
    }
  }

  @Post('send-payment-reminder')
  @Roles('admin')
  async sendPaymentReminder(
    @Body()
    { email, name, customerName, amount, dueDate }: 
    { email: string; name: string; customerName: string; amount: number; dueDate: string }
  ) {
    try {
      if (!email || !customerName || !amount) {
        throw new BadRequestException('Email, customer name, and amount are required');
      }

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a2332;">Payment Reminder</h2>
          <p>Hi ${name},</p>
          <p>This is a friendly reminder about an outstanding payment from <strong>${customerName}</strong>.</p>
          <div style="background-color: #F8FAFC; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Amount:</strong> $${amount.toLocaleString()}</p>
            ${dueDate ? `<p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>` : ''}
          </div>
          <p>Please follow up with the customer to collect this payment.</p>
          <p>Log in to your account to view more details.</p>
        </div>
      `;

      const result = await this.emailService.sendEmail({
        to: email,
        subject: `Payment Reminder - ${customerName}`,
        html,
      });

      if (!result) {
        throw new BadRequestException('Failed to send payment reminder');
      }

      this.logger.log(`Payment reminder sent to ${email}`);
      return { success: true, message: 'Payment reminder sent' };
    } catch (error) {
      this.logger.error(`Error sending payment reminder: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to send payment reminder');
    }
  }

  @Post('send-low-stock-alert')
  @Roles('admin')
  async sendLowStockAlert(
    @Body()
    { email, itemName, currentStock, minimumStock }:
    { email: string; itemName: string; currentStock: number; minimumStock: number }
  ) {
    try {
      if (!email || !itemName || currentStock === undefined || minimumStock === undefined) {
        throw new BadRequestException('All fields are required');
      }

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a2332;">⚠️ Low Stock Alert</h2>
          <p>An item in your inventory is running low on stock.</p>
          <div style="background-color: #FEF3C7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #F59E0B;">
            <p><strong>Item:</strong> ${itemName}</p>
            <p><strong>Current Stock:</strong> ${currentStock} units</p>
            <p><strong>Minimum Required:</strong> ${minimumStock} units</p>
          </div>
          <p>Please reorder this item to maintain adequate stock levels.</p>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/items" style="color: #1a2332; text-decoration: none; font-weight: 600;">Manage Items →</a></p>
        </div>
      `;

      const result = await this.emailService.sendEmail({
        to: email,
        subject: `Low Stock Alert - ${itemName}`,
        html,
      });

      if (!result) {
        throw new BadRequestException('Failed to send low stock alert');
      }

      this.logger.log(`Low stock alert sent to ${email} for ${itemName}`);
      return { success: true, message: 'Low stock alert sent' };
    } catch (error) {
      this.logger.error(`Error sending low stock alert: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to send low stock alert');
    }
  }

  @Post('send-batch')
  @Roles('admin')
  async sendBatchEmails(
    @Body() { recipients, subject, html }: { recipients: string[]; subject: string; html: string }
  ) {
    try {
      if (!recipients || recipients.length === 0 || !subject || !html) {
        throw new BadRequestException('Recipients, subject, and HTML content are required');
      }

      let successCount = 0;
      const failedRecipients: string[] = [];

      for (const email of recipients) {
        const result = await this.emailService.sendEmail({
          to: email,
          subject,
          html,
        });

        if (result) {
          successCount++;
        } else {
          failedRecipients.push(email);
        }
      }

      this.logger.log(`Batch email sent to ${successCount}/${recipients.length} recipients`);
      return {
        success: true,
        message: `Batch email sent`,
        successCount,
        failedCount: failedRecipients.length,
        failedRecipients,
      };
    } catch (error) {
      this.logger.error(`Error sending batch emails: ${error.message}`);
      throw new BadRequestException(error.message || 'Failed to send batch emails');
    }
  }
}
