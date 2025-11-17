import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Query,
  UseGuards,
  RawBodyRequest,
  Req,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { InitializePaymentDto } from './dto/initialize-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Payments Controller
 * Handles payment webhooks and admin operations
 */
@Controller('api/v1/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * POST /api/v1/payments/initialize
   * Initialize a new payment
   */
  @Post('initialize')
  async initializePayment(@Body() dto: InitializePaymentDto): Promise<{
    paymentUrl: string;
    reference: string;
    accessCode: string;
  }> {
    return this.paymentsService.initializePayment(dto);
  }

  /**
   * POST /api/v1/payments/verify
   * Verify a payment
   */
  @Post('verify')
  async verifyPayment(@Body() dto: VerifyPaymentDto): Promise<{
    status: string;
    message: string;
    paymentStatus: string;
    amount: number;
  }> {
    return this.paymentsService.verifyPayment(dto);
  }

  /**
   * GET /api/v1/payments/public-key
   * Get Paystack public key for frontend
   */
  @Get('public-key')
  async getPublicKey(): Promise<{ publicKey: string }> {
    const publicKey = this.paymentsService.getPaystackPublicKey();
    return { publicKey };
  }

  /**
   * POST /api/v1/payments/webhook
   * Receive webhook from payment processor (Paystack, etc.)
   * No authentication required (use signature verification)
   */
  @Post('webhook')
  async handleWebhook(
    @Body(new ValidationPipe({ forbidNonWhitelisted: false, transform: true }))
    payload: any,
    @Headers('x-paystack-signature') signature?: string,
  ): Promise<{
    status: string;
    reference: string;
    message: string;
  }> {
    return this.paymentsService.handleWebhook(payload, signature || '');
  }

  /**
   * GET /admin/payments
   * List all payments (admin)
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('status') status?: string,
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
    return this.paymentsService.findAll(
      skip ? parseInt(skip) : 0,
      take ? parseInt(take) : 10,
      status,
    );
  }

  /**
   * GET /admin/payments/stats/overview
   * Get payment statistics
   */
  @Get('admin/stats/overview')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  async getStats(): Promise<{
    totalAmount: number;
    totalCount: number;
    completed: number;
    failed: number;
    pending: number;
  }> {
    return this.paymentsService.getStats();
  }

  /**
   * GET /admin/payments/stats/monthly
   * Get monthly revenue breakdown
   */
  @Get('admin/stats/monthly')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  async getMonthlyBreakdown(): Promise<{
    data: Array<{
      month: string;
      totalTransactions: number;
      totalAmount: number;
    }>;
  }> {
    return this.paymentsService.getMonthlyBreakdown();
  }
}
