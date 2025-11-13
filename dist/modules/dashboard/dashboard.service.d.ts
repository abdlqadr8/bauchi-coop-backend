import { PrismaService } from '@/prisma/prisma.service';
/**
 * Dashboard Service
 * Provides KPI aggregations for admin dashboard
 */
export declare class DashboardService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    /**
     * Get dashboard KPIs
     */
    getKPIs(): Promise<{
        totalApplications: number;
        pendingApplications: number;
        approvedApplications: number;
        totalFeesCollected: number;
        certificatesIssued: number;
        activeUsers: number;
    }>;
}
//# sourceMappingURL=dashboard.service.d.ts.map