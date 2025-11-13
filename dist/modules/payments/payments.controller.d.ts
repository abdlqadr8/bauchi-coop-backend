import { PaymentsService } from "./payments.service";
import { PaymentWebhookDto } from "./dto/payment-webhook.dto";
/**
 * Payments Controller
 * Handles payment webhooks and admin operations
 */
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    /**
     * POST /payments/webhook
     * Receive webhook from payment processor (Paystack, etc.)
     * No authentication required (use signature verification)
     */
    handleWebhook(payload: PaymentWebhookDto, signature?: string): Promise<{
        status: string;
        reference: string;
        message: string;
    }>;
    /**
     * GET /admin/payments
     * List all payments (admin)
     */
    findAll(skip?: string, take?: string, status?: string): Promise<{
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
     * GET /admin/payments/stats/overview
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
//# sourceMappingURL=payments.controller.d.ts.map