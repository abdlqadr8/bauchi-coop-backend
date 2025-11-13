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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("@/prisma/prisma.service");
/**
 * Dashboard Service
 * Provides KPI aggregations for admin dashboard
 */
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger('DashboardService');
    }
    /**
     * Get dashboard KPIs
     */
    async getKPIs() {
        const [totalApplications, pendingApplications, approvedApplications, totalFeesCollected, certificatesIssued, activeUsers,] = await Promise.all([
            this.prisma.application.count(),
            this.prisma.application.count({
                where: { status: { in: ['NEW', 'UNDER_REVIEW'] } },
            }),
            this.prisma.application.count({ where: { status: 'APPROVED' } }),
            this.prisma.payment.aggregate({
                where: { status: 'COMPLETED' },
                _sum: { amount: true },
            }),
            this.prisma.certificate.count({ where: { revokedAt: null } }),
            this.prisma.user.count({ where: { status: 'ACTIVE' } }),
        ]);
        return {
            totalApplications,
            pendingApplications,
            approvedApplications,
            totalFeesCollected: totalFeesCollected._sum.amount || 0,
            certificatesIssued,
            activeUsers,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map