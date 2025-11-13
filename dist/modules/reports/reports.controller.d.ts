import { ReportsService } from './reports.service';
/**
 * Reports Controller
 */
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    /**
     * GET /admin/reports/applications
     * Get applications summary
     */
    getApplicationSummary(): Promise<{
        total: number;
        byStatus: Array<{
            status: string;
            count: number;
        }>;
    }>;
    /**
     * GET /admin/reports/payments
     * Get payments summary
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
     * GET /admin/reports/users
     * Get user activity summary
     */
    getUserActivity(): Promise<{
        totalUsers: number;
        activeUsers: number;
        inactiveUsers: number;
        lastWeekLogins: number;
    }>;
}
//# sourceMappingURL=reports.controller.d.ts.map