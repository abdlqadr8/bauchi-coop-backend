import { DashboardService } from './dashboard.service';
/**
 * Dashboard Controller
 */
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    /**
     * GET /admin/dashboard
     * Get KPIs for dashboard
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
//# sourceMappingURL=dashboard.controller.d.ts.map