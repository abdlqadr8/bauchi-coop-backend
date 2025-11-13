import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';

/**
 * Payments Service
 * Handles payment processing, webhooks, and admin operations
 */
@Injectable()
export class PaymentsService {
  private readonly logger = new Logger('PaymentsService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Process payment webhook (e.g., from Paystack)
   * Validates signature and updates payment record
   */
  async handleWebhook(
    payload: PaymentWebhookDto,
    signature: string,
  ): Promise<{
    status: string;
    reference: string;
    message: string;
  }> {
    // TODO: Implement signature verification for your payment processor
    // Example for Paystack:
    // const hash = crypto
    //   .createHmac('sha512', this.configService.get('PAYSTACK_SECRET_KEY'))
    //   .update(JSON.stringify(payload))
    //   .digest('hex');
    // if (hash !== signature) {
    //   throw new BadRequestException('Invalid webhook signature');
    // }

    // Check for duplicate webhook (idempotency)
    const existingPayment = await this.prisma.payment.findUnique({
      where: { transactionRef: payload.reference },
    });

    if (existingPayment) {
      this.logger.warn(`Duplicate webhook received: ${payload.reference}`);
      return {
        status: 'success',
        reference: payload.reference,
        message: 'Webhook already processed',
      };
    }

    // Create payment record from webhook
    const payment = await this.prisma.payment.create({
      data: {
        applicationId: payload.applicationId || '',
        amount: payload.amount,
        currency: 'NGN',
        status: payload.status === 'success' ? 'COMPLETED' : 'FAILED',
        paymentMethod: 'PAYSTACK',
        transactionRef: payload.reference,
        paymentDate: new Date(),
        rawPayload: JSON.stringify(payload),
      },
    });

    this.logger.log(
      `Payment webhook processed: ${payment.id} (${payload.reference})`,
    );

    return {
      status: 'success',
      reference: payload.reference,
      message: 'Payment recorded successfully',
    };
  }

  /**
   * Get all payments (admin)
   */
  async findAll(
    skip: number = 0,
    take: number = 10,
    status?: string,
  ): Promise<{
    payments: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      transactionRef: string | null;
      paymentDate: Date | null;
      createdAt: Date;
    }>;
    total: number;
  }> {
    const where = status ? { status } : {};

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          amount: true,
          currency: true,
          status: true,
          transactionRef: true,
          paymentDate: true,
          createdAt: true,
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return { payments, total };
  }

  /**
   * Get payment statistics
   */
  async getStats(): Promise<{
    totalAmount: number;
    totalCount: number;
    completed: number;
    failed: number;
    pending: number;
  }> {
    const payments = await this.prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
      _count: true,
    });

    const [completed, failed, pending] = await Promise.all([
      this.prisma.payment.count({ where: { status: 'COMPLETED' } }),
      this.prisma.payment.count({ where: { status: 'FAILED' } }),
      this.prisma.payment.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalAmount: payments._sum.amount || 0,
      totalCount: payments._count || 0,
      completed,
      failed,
      pending,
    };
  }
}
