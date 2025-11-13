/**
 * DTO for webhook payload from payment processor (e.g., Paystack)
 */
export declare class PaymentWebhookDto {
    amount: number;
    reference: string;
    status?: string;
    applicationId?: string;
    [key: string]: unknown;
}
//# sourceMappingURL=payment-webhook.dto.d.ts.map