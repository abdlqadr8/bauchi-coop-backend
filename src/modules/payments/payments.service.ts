import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { PaystackService } from './paystack.service';
import { EmailService } from '@/modules/email/email.service';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';

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
    private readonly paystackService: PaystackService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Initialize payment for application
   */
  async initializePayment(dto: InitializePaymentDto): Promise<{
    status: string;
    paymentUrl: string;
    reference: string;
    accessCode: string;
  }> {
    try {
      // Verify application exists
      const application = await this.prisma.application.findUnique({
        where: { id: dto.applicationId },
      });

      if (!application) {
        throw new BadRequestException('Application not found');
      }

      // Check if payment already exists
      const existingPayment = await this.prisma.payment.findFirst({
        where: { applicationId: dto.applicationId },
      });

      if (existingPayment && existingPayment.status === 'COMPLETED') {
        throw new BadRequestException(
          'Payment already completed for this application',
        );
      }

      // Generate unique transaction reference
      const reference = this.paystackService.generateReference();

      // Initialize Paystack payment
      const paystackResponse = await this.paystackService.initializePayment(
        dto.email,
        dto.amount,
        reference,
        {
          applicationId: dto.applicationId,
          cooperativeName: dto.cooperativeName,
        },
      );

      if (!paystackResponse.status || !paystackResponse.data) {
        throw new BadRequestException('Failed to initialize payment');
      }

      // Create payment record
      await this.prisma.payment.create({
        data: {
          applicationId: dto.applicationId,
          amount: dto.amount,
          currency: 'NGN',
          status: 'PENDING',
          paymentMethod: 'PAYSTACK',
          transactionRef: reference,
          rawPayload: JSON.stringify(paystackResponse.data),
        },
      });

      this.logger.log(`Payment initialized: ${reference}`);

      return {
        status: 'success',
        paymentUrl: paystackResponse.data.authorization_url,
        reference,
        accessCode: paystackResponse.data.access_code,
      };
    } catch (error: any) {
      this.logger.error(
        `Payment initialization failed: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Verify payment with Paystack
   */
  async verifyPayment(dto: VerifyPaymentDto): Promise<{
    status: string;
    message: string;
    paymentStatus: string;
    amount: number;
  }> {
    try {
      // Check if payment exists in database
      const payment = await this.prisma.payment.findUnique({
        where: { transactionRef: dto.reference },
        include: { application: true },
      });

      if (!payment) {
        throw new BadRequestException('Payment record not found');
      }

      // Verify with Paystack
      const paystackResponse = await this.paystackService.verifyPayment(
        dto.reference,
      );

      if (!paystackResponse.status || !paystackResponse.data) {
        throw new BadRequestException('Payment verification failed');
      }

      const paystackData = paystackResponse.data;

      // Check if payment is successful
      if (paystackData.status === 'success') {
        // Update payment status
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            paymentDate: new Date(paystackData.paid_at),
            rawPayload: JSON.stringify(paystackData),
          },
        });

        // Send success email to user
        await this.emailService.sendPaymentSuccessful(
          payment.application.email,
          payment.application.cooperativeName,
          payment.amount,
          dto.reference,
        );

        // Send admin notification
        await this.emailService.sendAdminVerificationNotice(
          payment.application.cooperativeName,
          payment.amount,
          dto.reference,
        );

        this.logger.log(`Payment verified successfully: ${dto.reference}`);

        return {
          status: 'success',
          message: 'Payment verified successfully',
          paymentStatus: 'COMPLETED',
          amount: paystackData.amount / 100, // Convert from kobo to naira
        };
      } else {
        // Payment failed
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
          },
        });

        await this.emailService.sendPaymentFailed(
          payment.application.email,
          payment.application.cooperativeName,
          'Payment was not completed. Please try again.',
        );

        return {
          status: 'failed',
          message: 'Payment was not successful',
          paymentStatus: 'FAILED',
          amount: paystackData.amount / 100,
        };
      }
    } catch (error: any) {
      this.logger.error(
        `Payment verification failed: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Get payment by reference
   */
  async getPaymentByReference(reference: string): Promise<any> {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { transactionRef: reference },
        include: {
          application: {
            select: {
              id: true,
              cooperativeName: true,
              email: true,
              status: true,
            },
          },
        },
      });

      return payment;
    } catch (error: any) {
      this.logger.error(
        `Failed to get payment: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
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
      application: {
        cooperativeName: string;
        email: string;
      };
    }>;
    total: number;
  }> {
    try {
      const where = status ? { status: status as any } : {};

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
            application: {
              select: {
                cooperativeName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.payment.count({ where }),
      ]);

      return { payments, total };
    } catch (error: any) {
      this.logger.error(
        `Failed to get payments: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
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
    try {
      const [allPayments, completedPayments, failedPayments, pendingPayments] =
        await Promise.all([
          this.prisma.payment.findMany(),
          this.prisma.payment.findMany({
            where: { status: 'COMPLETED' },
          }),
          this.prisma.payment.findMany({
            where: { status: 'FAILED' },
          }),
          this.prisma.payment.findMany({
            where: { status: 'PENDING' },
          }),
        ]);

      const totalAmount = allPayments.reduce((sum, p) => sum + p.amount, 0);

      return {
        totalAmount,
        totalCount: allPayments.length,
        completed: completedPayments.length,
        failed: failedPayments.length,
        pending: pendingPayments.length,
      };
    } catch (error: any) {
      this.logger.error(
        `Failed to get stats: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Get monthly revenue breakdown
   */
  async getMonthlyBreakdown(): Promise<{
    data: Array<{
      month: string;
      totalTransactions: number;
      totalAmount: number;
    }>;
  }> {
    try {
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      const allPayments = await this.prisma.payment.findMany();
      const monthlyData: {
        [key: number]: { totalTransactions: number; totalAmount: number };
      } = {};

      // Initialize all months
      for (let i = 0; i < 12; i++) {
        monthlyData[i] = { totalTransactions: 0, totalAmount: 0 };
      }

      // Aggregate data by month
      allPayments.forEach((payment) => {
        const paymentDate = new Date(payment.paymentDate || payment.createdAt);
        const month = paymentDate.getMonth();

        if (payment.status === 'COMPLETED') {
          monthlyData[month].totalTransactions += 1;
          monthlyData[month].totalAmount += payment.amount;
        }
      });

      // Format response
      const data = months.map((month, index) => ({
        month,
        totalTransactions: monthlyData[index].totalTransactions,
        totalAmount: monthlyData[index].totalAmount,
      }));

      return { data };
    } catch (error: any) {
      this.logger.error(
        `Failed to get monthly breakdown: ${error?.message || 'Unknown error'}`,
      );
      throw error;
    }
  }

  /**
   * Get Paystack public key (for frontend)
   */
  getPaystackPublicKey(): string {
    return this.paystackService.getPublicKey();
  }

  /**
   * Process Paystack webhook
   */
  async processPaystackWebhook(payload: any, signature: string): Promise<void> {
    try {
      // Verify signature
      const isValid = this.paystackService.verifyWebhookSignature(
        signature,
        JSON.stringify(payload),
      );

      if (!isValid) {
        this.logger.warn('Invalid webhook signature');
        return;
      }

      // Handle different events
      if (payload.event === 'charge.success') {
        const data = payload.data;
        const payment = await this.prisma.payment.findUnique({
          where: { transactionRef: data.reference },
          include: { application: true },
        });

        if (payment && payment.status === 'PENDING') {
          await this.prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'COMPLETED',
              paymentDate: new Date(data.paid_at),
              rawPayload: JSON.stringify(data),
            },
          });

          // Send email notifications
          await this.emailService.sendPaymentSuccessful(
            payment.application.email,
            payment.application.cooperativeName,
            payment.amount,
            data.reference,
          );

          await this.emailService.sendAdminVerificationNotice(
            payment.application.cooperativeName,
            payment.amount,
            data.reference,
          );

          this.logger.log(`Payment confirmed via webhook: ${data.reference}`);
        }
      }
    } catch (error: any) {
      this.logger.error(
        `Webhook processing failed: ${error?.message || 'Unknown error'}`,
      );
    }
  }

  /**
   * Handle webhook from payment processor (wrapper for controller)
   */
  async handleWebhook(
    payload: any,
    signature: string,
  ): Promise<{
    status: string;
    reference: string;
    message: string;
  }> {
    try {
      await this.processPaystackWebhook(payload, signature);
      return {
        status: 'success',
        reference: payload.data?.reference || 'unknown',
        message: 'Webhook processed successfully',
      };
    } catch (error: any) {
      this.logger.error(`Webhook handling failed: ${error?.message}`);
      return {
        status: 'error',
        reference: payload.data?.reference || 'unknown',
        message: 'Webhook processing failed',
      };
    }
  }
}
