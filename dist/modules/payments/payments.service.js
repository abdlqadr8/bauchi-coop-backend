"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("@/prisma/prisma.service");
/**
 * Payments Service
 * Handles payment processing, webhooks, and admin operations
 */
let PaymentsService = class PaymentsService {
    constructor(prisma, configService) {
        this.prisma = prisma;
        this.configService = configService;
        this.logger = new common_1.Logger('PaymentsService');
    }
    /**
     * Process payment webhook (e.g., from Paystack)
     * Validates signature and updates payment record
     */
    async handleWebhook(payload, signature) {
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
        this.logger.log(`Payment webhook processed: ${payment.id} (${payload.reference})`);
        return {
            status: 'success',
            reference: payload.reference,
            message: 'Payment recorded successfully',
        };
    }
    /**
     * Get all payments (admin)
     */
    async findAll(skip = 0, take = 10, status) {
        const where = status ? { status: status } : {};
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
    async getStats() {
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
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map