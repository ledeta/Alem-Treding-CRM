import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: any[];
}

@Injectable()
export class EmailService {
  private logger = new Logger('EmailService');
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'localhost';
    const smtpPort = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587');
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const smtpPass = process.env.SMTP_PASSWORD || process.env.EMAIL_PASSWORD;
    const smtpSecure = (process.env.SMTP_SECURE || process.env.EMAIL_SECURE || 'false') === 'true';

    // If credentials are not provided, use ethereal (test) service
    if (!smtpUser || !smtpPass) {
      this.logger.warn('No SMTP credentials provided. Using Ethereal test service.');
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: 'rudy.rath@ethereal.email',
          pass: 'wkXzDN2vQwDnRfP2nK',
        },
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.EMAIL_FROM || '"ALEM TRADING" <noreply@alem-trading.com>',
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${options.to}. Message ID: ${info.messageId}`);
      
      // Log test URL if using Ethereal
      if (process.env.NODE_ENV !== 'production' && info.response && info.response.includes('250')) {
        this.logger.debug(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}: ${error.message}`);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, name: string): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = `
      <div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: 0 auto; background: #f8f7f2; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(26, 35, 50, 0.1);">
          <h2 style="color: #1a2332; font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 20px;">
            Password Reset Request
          </h2>
          <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">Hi ${name},</p>
          <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">
            We received a request to reset your password for your ALEM TRADING account. 
            Click the button below to proceed:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: linear-gradient(135deg, #b8860b 0%, #d4af37 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-family: 'Poppins', sans-serif;">
              Reset Password
            </a>
          </div>
          <p style="color: #a0aec0; font-size: 12px; margin: 20px 0;">
            This link expires in 1 hour.
          </p>
          <p style="color: #a0aec0; font-size: 12px;">
            If you didn't request this reset, please ignore this email and your password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #a0aec0; font-size: 12px; text-align: center; margin: 0;">
            © ALEM TRADING Management System. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Password Reset Request - ALEM TRADING',
      html,
      text: `Click here to reset password: ${resetUrl}`,
    });
  }

  async sendApprovalNotificationEmail(
    email: string,
    requestType: string,
    status: 'approved' | 'rejected',
    details: any,
    name: string,
  ): Promise<boolean> {
    const statusColor = status === 'approved' ? '#22C55E' : '#EF4444';
    const statusBgColor = status === 'approved' ? '#f0fdf4' : '#fef2f2';
    const statusText = status === 'approved' ? 'APPROVED' : 'REJECTED';
    const statusEmoji = status === 'approved' ? '✅' : '❌';

    const html = `
      <div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: 0 auto; background: #f8f7f2; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(26, 35, 50, 0.1);">
          <h2 style="color: #1a2332; font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 10px;">
            ${statusEmoji} Request ${statusText}
          </h2>
          <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin-top: 0;">Hi ${name},</p>
          <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">
            Your <strong>${requestType}</strong> request has been <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span>.
          </p>
          <div style="background-color: ${statusBgColor}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${statusColor};">
            <p style="margin: 0 0 8px 0; color: #4a5568;"><strong>Amount:</strong> $${typeof details.amount === 'number' ? details.amount.toLocaleString() : details.amount}</p>
            <p style="margin: 0 0 8px 0; color: #4a5568;"><strong>Reason:</strong> ${details.reason}</p>
            <p style="margin: 0; color: #4a5568;"><strong>Date:</strong> ${new Date(details.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">
            Log in to your account for more details about this request.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #a0aec0; font-size: 12px; text-align: center; margin: 0;">
            © ALEM TRADING Management System. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Request ${statusText} - ALEM TRADING`,
      html,
    });
  }

  async sendWelcomeEmail(email: string, name: string, username: string): Promise<boolean> {
    const html = `
      <div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: 0 auto; background: #f8f7f2; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(26, 35, 50, 0.1);">
          <h2 style="color: #1a2332; font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 20px;">
            Welcome to ALEM TRADING
          </h2>
          <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">Hi ${name},</p>
          <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">
            Your account has been successfully created. You can now log in to ALEM TRADING Management System with the following credentials:
          </p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #b8860b;">
            <p style="margin: 0 0 8px 0; color: #4a5568;"><strong>Username:</strong> <code style="background: white; padding: 4px 8px; border-radius: 4px;">${username}</code></p>
            <p style="margin: 0; color: #a0aec0; font-size: 12px;">Please save your password securely.</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="background: linear-gradient(135deg, #b8860b 0%, #d4af37 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-family: 'Poppins', sans-serif;">
              Login to Your Account
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #a0aec0; font-size: 12px; text-align: center; margin: 0;">
            © ALEM TRADING Management System. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to ALEM TRADING - Account Created',
      html,
    });
  }

  async sendLowStockAlert(email: string, itemName: string, currentStock: number, minimumStock: number): Promise<boolean> {
    const html = `
      <div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: 0 auto; background: #f8f7f2; padding: 20px;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 8px rgba(26, 35, 50, 0.1);">
          <h2 style="color: #1a2332; font-family: 'Playfair Display', serif; font-size: 28px; margin-bottom: 10px;">
            ⚠️ Low Stock Alert
          </h2>
          <p style="color: #4a5568; font-size: 14px; line-height: 1.6; margin-top: 0;">
            An item in your inventory is running low on stock and needs attention.
          </p>
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
            <p style="margin: 0 0 8px 0; color: #92400e;"><strong>Item Name:</strong> ${itemName}</p>
            <p style="margin: 0 0 8px 0; color: #92400e;"><strong>Current Stock:</strong> ${currentStock} units</p>
            <p style="margin: 0; color: #92400e;"><strong>Minimum Required:</strong> ${minimumStock} units</p>
          </div>
          <p style="color: #4a5568; font-size: 14px; line-height: 1.6;">
            Please reorder this item to maintain adequate stock levels and prevent stockouts.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/items" style="background: linear-gradient(135deg, #b8860b 0%, #d4af37 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; font-family: 'Poppins', sans-serif;">
              Manage Items
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #a0aec0; font-size: 12px; text-align: center; margin: 0;">
            © ALEM TRADING Management System. All rights reserved.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: email,
      subject: `Low Stock Alert - ${itemName}`,
      html,
    });
  }
}

