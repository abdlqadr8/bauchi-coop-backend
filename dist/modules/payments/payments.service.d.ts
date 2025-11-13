import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
/**
 * Payments Service
 * Handles payment processing, webhooks, and admin operations
 */
export declare class PaymentsService {
    private readonly prisma;
    private readonly configService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: ConfigService);
    /**
     * Process payment webhook (e.g., from Paystack)
     * Validates signature and updates payment record
     */
    handleWebhook(payload: PaymentWebhookDto, signature: string): Promise<{
        status: string;
        reference: string;
        message: string;
    }>;
    /**
     * Get all payments (admin)
     */
    findAll(skip?: number, take?: number, status?: string): Promise<{
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
    }>;
    /**
     * Get payment statistics
     */
    getStats(): Promise<{
        totalAmount: number;
        totalCount: number;
        completed: number;
        failed: number;
        pending: number;
    }>;
}
//# sourceMappingURL=payments.service.d.ts.map