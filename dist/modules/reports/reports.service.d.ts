import { PrismaService } from '@/prisma/prisma.service';
/**
 * Reports Service
 * Generates reports and aggregates data
 */
export declare class ReportsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    /**
     * Get application summary report
     */
    getApplicationSummary(): Promise<{
        total: number;
        byStatus: Array<{
            status: string;
            count: number;
        }>;
    }>;
    /**
     * Get payment summary report
     */
    getPaymentSummary(): Promise<{
        totalRevenue: number;
        totalTransactions: number;
        byStatus: Array<{
            status: string;
            count: number;
            amount: number;
        }>;
    }>;
    /**
     * Get user activity summary
     */
    getUserActivity(): Promise<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        lastWeekLogins: number;
    }>;
}
//# sourceMappingURL=reports.service.d.ts.map