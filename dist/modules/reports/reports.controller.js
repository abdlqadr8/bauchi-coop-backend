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
exports.ReportsController = void 0;
const common_1 = require("@nestjs/common");
const reports_service_1 = require("./reports.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
/**
 * Reports Controller
 */
let ReportsController = class ReportsController {
    constructor(reportsService) {
        this.reportsService = reportsService;
    }
    /**
     * GET /admin/reports/applications
     * Get applications summary
     */
    async getApplicationSummary() {
        return this.reportsService.getApplicationSummary();
    }
    /**
     * GET /admin/reports/payments
     * Get payments summary
     */
    async getPaymentSummary() {
        return this.reportsService.getPaymentSummary();
    }
    /**
     * GET /admin/reports/users
     * Get user activity summary
     */
    async getUserActivity() {
        return this.reportsService.getUserActivity();
    }
};
exports.ReportsController = ReportsController;
__decorate([
    (0, common_1.Get)('applications'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getApplicationSummary", null);
__decorate([
    (0, common_1.Get)('payments'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getPaymentSummary", null);
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ReportsController.prototype, "getUserActivity", null);
exports.ReportsController = ReportsController = __decorate([
    (0, common_1.Controller)('admin/reports'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('SYSTEM_ADMIN', 'ADMIN'),
    __metadata("design:paramtypes", [reports_service_1.ReportsService])
], ReportsController);
//# sourceMappingURL=reports.controller.js.map