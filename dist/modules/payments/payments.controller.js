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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const payment_webhook_dto_1 = require("./dto/payment-webhook.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
/**
 * Payments Controller
 * Handles payment webhooks and admin operations
 */
let PaymentsController = class PaymentsController {
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    /**
     * POST /payments/webhook
     * Receive webhook from payment processor (Paystack, etc.)
     * No authentication required (use signature verification)
     */
    async handleWebhook(payload, signature) {
        return this.paymentsService.handleWebhook(payload, signature || "");
    }
    /**
     * GET /admin/payments
     * List all payments (admin)
     */
    async findAll(skip, take, status) {
        return this.paymentsService.findAll(skip ? parseInt(skip) : 0, take ? parseInt(take) : 10, status);
    }
    /**
     * GET /admin/payments/stats/overview
     * Get payment statistics
     */
    async getStats() {
        return this.paymentsService.getStats();
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)("webhook"),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)("x-paystack-signature")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [payment_webhook_dto_1.PaymentWebhookDto, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)("admin"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("SYSTEM_ADMIN", "ADMIN"),
    __param(0, (0, common_1.Query)("skip")),
    __param(1, (0, common_1.Query)("take")),
    __param(2, (0, common_1.Query)("status")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)("admin/stats/overview"),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)("SYSTEM_ADMIN", "ADMIN"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "getStats", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)("payments"),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map