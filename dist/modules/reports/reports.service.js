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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("@/prisma/prisma.service");
/**
 * Reports Service
 * Generates reports and aggregates data
 */
let ReportsService = class ReportsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger('ReportsService');
    }
    /**
     * Get application summary report
     */
    async getApplicationSummary() {
        const statuses = ['NEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'FLAGGED'];
        const byStatus = await Promise.all(statuses.map(async (status) => ({
            status,
            count: await this.prisma.application.count({
                where: { status: status },
            }),
        })));
        const total = byStatus.reduce((sum, s) => sum + s.count, 0);
        return { total, byStatus };
    }
    /**
     * Get payment summary report
     */
    async getPaymentSummary() {
        const statuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];
        const byStatus = await Promise.all(statuses.map(async (status) => {
            const aggregation = await this.prisma.payment.aggregate({
                where: { status: status },
                _sum: { amount: true },
                _count: true,
            });
            return {
                status,
                count: aggregation._count || 0,
                amount: aggregation._sum?.amount || 0,
            };
        }));
        const totalRevenue = byStatus.reduce((sum, s) => sum + s.amount, 0);
        const totalTransactions = byStatus.reduce((sum, s) => sum + s.count, 0);
        return { totalRevenue, totalTransactions, byStatus };
    }
    /**
     * Get user activity summary
     */
    async getUserActivity() {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [totalUsers, activeUsers, inactiveUsers, lastWeekLogins] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { status: 'ACTIVE' } }),
            this.prisma.user.count({ where: { status: 'INACTIVE' } }),
            this.prisma.user.count({
                where: {
                    lastLogin: {
                        gte: sevenDaysAgo,
                    },
                },
            }),
        ]);
        return {
            totalUsers,
            activeUsers,
            inactiveUsers,
            lastWeekLogins,
        };
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map