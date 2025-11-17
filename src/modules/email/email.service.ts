import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface EmailPayload {
  to: string;
  subject: string;
  template: string;
  templateData: Record<string, any>;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService');
  private mailjetApiKey: string;
  private mailjetApiSecret: string;
  private senderEmail: string;
  private senderName: string;

  constructor(private configService: ConfigService) {
    this.mailjetApiKey =
      this.configService.get<string>('MAILJET_API_KEY') ?? '';
    this.mailjetApiSecret =
      this.configService.get<string>('MAILJET_API_SECRET') ?? '';
    this.senderEmail = this.configService.get<string>('SENDER_EMAIL') ?? '';
    this.senderName = this.configService.get<string>('SENDER_NAME') ?? '';
  }

  /**
   * Send registration confirmation email
   */
  async sendRegistrationConfirmation(
    email: string,
    cooperativeName: string,
    applicationId: string,
  ): Promise<void> {
    try {
      const payload = {
        to: email,
        subject: 'Application Submitted - Bauchi Cooperative Registry',
        template: 'registration-confirmation',
        templateData: {
          cooperativeName,
          applicationId,
          dashboardLink: `${this.configService.get('FRONTEND_URL')}/track/${applicationId}`,
        },
      };

      await this.sendEmail(payload);
      this.logger.log(`Registration confirmation sent to ${email}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send registration confirmation: ${error?.message || 'Unknown error'}`,
      );
      // Don't throw - email failure shouldn't block the flow
    }
  }

  /**
   * Send payment successful email
   */
  async sendPaymentSuccessful(
    email: string,
    cooperativeName: string,
    amount: number,
    transactionRef: string,
  ): Promise<void> {
    try {
      const payload = {
        to: email,
        subject: 'Payment Received - Bauchi Cooperative Registry',
        template: 'payment-successful',
        templateData: {
          cooperativeName,
          amount: this.formatCurrency(amount),
          transactionRef,
          message:
            'Your payment has been received and is pending verification.',
        },
      };

      await this.sendEmail(payload);
      this.logger.log(`Payment success email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send payment success email: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Send payment failed email
   */
  async sendPaymentFailed(
    email: string,
    cooperativeName: string,
    reason: string,
  ): Promise<void> {
    try {
      const payload = {
        to: email,
        subject: 'Payment Failed - Bauchi Cooperative Registry',
        template: 'payment-failed',
        templateData: {
          cooperativeName,
          reason,
          retryLink: `${this.configService.get('FRONTEND_URL')}/payment`,
        },
      };

      await this.sendEmail(payload);
      this.logger.log(`Payment failure email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send payment failure email: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Send admin verification pending email
   */
  async sendAdminVerificationNotice(
    cooperativeName: string,
    amount: number,
    transactionRef: string,
  ): Promise<void> {
    try {
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL') ?? '';

      const payload = {
        to: adminEmail,
        subject: 'Payment Verification Required - Bauchi Cooperative Registry',
        template: 'admin-payment-verification',
        templateData: {
          cooperativeName,
          amount: this.formatCurrency(amount),
          transactionRef,
          verificationLink: `${this.configService.get('FRONTEND_URL')}/admin/payments`,
        },
      };

      await this.sendEmail(payload);
      this.logger.log('Admin verification notice sent');
    } catch (error: any) {
      this.logger.error(
        `Failed to send admin verification notice: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Send application approved with certificate link
   */
  async sendApplicationApproved(
    email: string,
    cooperativeName: string,
    certificateDownloadUrl: string,
    registrationNumber: string,
  ): Promise<void> {
    try {
      const payload = {
        to: email,
        subject:
          'Application Approved - Certificate Ready - Bauchi Cooperative Registry',
        template: 'application-approved',
        templateData: {
          cooperativeName,
          certificateDownloadUrl,
          registrationNumber,
          validFrom: new Date().toLocaleDateString('en-NG'),
        },
      };

      await this.sendEmail(payload);
      this.logger.log(`Application approval email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send application approval email: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Send application rejected email
   */
  async sendApplicationRejected(
    email: string,
    cooperativeName: string,
    reason: string,
  ): Promise<void> {
    try {
      const payload = {
        to: email,
        subject: 'Application Status Update - Bauchi Cooperative Registry',
        template: 'application-rejected',
        templateData: {
          cooperativeName,
          reason,
          contactEmail: 'support@bauchicooperative.ng',
        },
      };

      await this.sendEmail(payload);
      this.logger.log(`Application rejection email sent to ${email}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to send application rejection email: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Internal method to send email via Mailjet
   */
  private async sendEmail(payload: EmailPayload): Promise<void> {
    if (!this.mailjetApiKey || !this.mailjetApiSecret) {
      this.logger.warn(
        'Mailjet credentials not configured. Skipping email send.',
      );
      return;
    }

    try {
      const mailjetUrl = 'https://api.mailjet.com/v3.1/send';

      const emailData = {
        Messages: [
          {
            From: {
              Email: this.senderEmail,
              Name: this.senderName,
            },
            To: [
              {
                Email: payload.to,
              },
            ],
            Subject: payload.subject,
            HTMLPart: this.getEmailTemplate(
              payload.template,
              payload.templateData,
            ),
            TextPart: payload.subject,
          },
        ],
      };

      const response = await fetch(mailjetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${this.mailjetApiKey}:${this.mailjetApiSecret}`).toString('base64')}`,
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        throw new Error(`Mailjet API error: ${response.statusText}`);
      }

      this.logger.log(`Email sent successfully to ${payload.to}`);
    } catch (error: any) {
      this.logger.error(
        `Email sending failed: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Get email template HTML
   */
  private getEmailTemplate(
    template: string,
    data: Record<string, any>,
  ): string {
    const templates: Record<string, (data: Record<string, any>) => string> = {
      'registration-confirmation': (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Application Submitted Successfully</h2>
          <p>Dear ${d.cooperativeName},</p>
          <p>Thank you for submitting your cooperative registration application.</p>
          <p><strong>Application ID:</strong> ${d.applicationId}</p>
          <p>Your application is now under review. You will receive a notification once our team has reviewed your application.</p>
          <p><a href="${d.dashboardLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Track Application</a></p>
          <p>Best regards,<br/>Bauchi Cooperative Registry</p>
        </div>
      `,

      'payment-successful': (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment Received</h2>
          <p>Dear ${d.cooperativeName},</p>
          <p>Your payment has been received successfully.</p>
          <p><strong>Amount:</strong> ${d.amount}</p>
          <p><strong>Transaction Reference:</strong> ${d.transactionRef}</p>
          <p>${d.message}</p>
          <p>You will be notified once payment verification is complete.</p>
          <p>Best regards,<br/>Bauchi Cooperative Registry</p>
        </div>
      `,

      'payment-failed': (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment Failed</h2>
          <p>Dear ${d.cooperativeName},</p>
          <p>Unfortunately, your payment could not be processed.</p>
          <p><strong>Reason:</strong> ${d.reason}</p>
          <p><a href="${d.retryLink}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Retry Payment</a></p>
          <p>Best regards,<br/>Bauchi Cooperative Registry</p>
        </div>
      `,

      'admin-payment-verification': (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Payment Verification Required</h2>
          <p>A new payment has been received and requires verification.</p>
          <p><strong>Cooperative:</strong> ${d.cooperativeName}</p>
          <p><strong>Amount:</strong> ${d.amount}</p>
          <p><strong>Reference:</strong> ${d.transactionRef}</p>
          <p><a href="${d.verificationLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Payment</a></p>
          <p>Best regards,<br/>System Admin</p>
        </div>
      `,

      'application-approved': (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Application Approved - Certificate Ready</h2>
          <p>Dear ${d.cooperativeName},</p>
          <p>Congratulations! Your cooperative registration application has been approved.</p>
          <p><strong>Registration Number:</strong> ${d.registrationNumber}</p>
          <p><strong>Certificate Valid From:</strong> ${d.validFrom}</p>
          <p><a href="${d.certificateDownloadUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Certificate</a></p>
          <p>Your digital certificate is now available for download. Please keep it safe for future reference.</p>
          <p>Best regards,<br/>Bauchi Cooperative Registry</p>
        </div>
      `,

      'application-rejected': (d) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Application Status Update</h2>
          <p>Dear ${d.cooperativeName},</p>
          <p>Unfortunately, your application could not be approved at this time.</p>
          <p><strong>Reason:</strong> ${d.reason}</p>
          <p>Please contact us at <a href="mailto:${d.contactEmail}">${d.contactEmail}</a> for more information.</p>
          <p>Best regards,<br/>Bauchi Cooperative Registry</p>
        </div>
      `,
    };

    return templates[template]?.(data) || '';
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  }
}
