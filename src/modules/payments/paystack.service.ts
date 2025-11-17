import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data?: {
    id: number;
    reference: string;
    amount: number;
    paid_at: string;
    customer: {
      email: string;
      customer_code: string;
    };
    status: string;
    metadata?: Record<string, any>;
  };
}

export interface PaystackWebhookPayload {
  event: string;
  data: {
    id: number;
    reference: string;
    amount: number;
    paid_at: string;
    status: string;
    customer: {
      email: string;
      customer_code: string;
    };
    metadata?: Record<string, any>;
  };
}

@Injectable()
export class PaystackService {
  private readonly logger = new Logger('PaystackService');
  private publicKey: string;
  private secretKey: string;
  private baseUrl = 'https://api.paystack.co';

  constructor(private configService: ConfigService) {
    this.publicKey = this.configService.get<string>('PAYSTACK_PUBLIC_KEY', '');
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY', '');

    if (!this.publicKey || !this.secretKey) {
      this.logger.warn(
        'Paystack credentials not fully configured. Payment functionality may not work.',
      );
    }
  }

  /**
   * Initialize payment with Paystack
   */
  async initializePayment(
    email: string,
    amount: number,
    reference: string,
    metadata?: Record<string, any>,
  ): Promise<PaystackInitializeResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.secretKey}`,
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100), // Convert to kobo (Paystack uses kobo as base unit)
          reference,
          metadata,
        }),
      });

      const data = (await response.json()) as PaystackInitializeResponse;

      if (!response.ok) {
        this.logger.error(`Paystack initialization failed: ${data.message}`);
        throw new BadRequestException(
          `Payment initialization failed: ${data.message}`,
        );
      }

      this.logger.log(`Payment initialized with reference: ${reference}`);
      return data;
    } catch (error: any) {
      this.logger.error(
        `Paystack initialization error: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Verify payment with Paystack
   */
  async verifyPayment(reference: string): Promise<PaystackVerifyResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.secretKey}`,
          },
        },
      );

      const data = (await response.json()) as PaystackVerifyResponse;

      if (!response.ok) {
        this.logger.error(`Paystack verification failed: ${data.message}`);
        throw new BadRequestException(
          `Payment verification failed: ${data.message}`,
        );
      }

      this.logger.log(`Payment verified with reference: ${reference}`);
      return data;
    } catch (error: any) {
      this.logger.error(
        `Paystack verification error: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Verify webhook signature from Paystack
   */
  verifyWebhookSignature(signature: string, payload: string): boolean {
    try {
      const hash = crypto
        .createHmac('sha512', this.secretKey)
        .update(payload)
        .digest('hex');

      const isValid = hash === signature;

      if (!isValid) {
        this.logger.warn('Invalid webhook signature received');
      }

      return isValid;
    } catch (error: any) {
      this.logger.error(
        `Webhook verification error: ${error?.message || 'Unknown error'}`,
      );
      return false;
    }
  }

  /**
   * Get Paystack public key for frontend
   */
  getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Get payment status from Paystack
   */
  async getPaymentStatus(reference: string): Promise<string> {
    try {
      const data = await this.verifyPayment(reference);
      return data.data?.status || 'unknown';
    } catch (error) {
      this.logger.error(`Failed to get payment status: ${error}`);
      return 'error';
    }
  }

  /**
   * Format amount for Paystack (convert to kobo)
   */
  formatAmount(amount: number): number {
    return Math.round(amount * 100);
  }

  /**
   * Generate unique transaction reference
   */
  generateReference(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
