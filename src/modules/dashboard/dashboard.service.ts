import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Dashboard Service
 * Provides KPI aggregations for admin dashboard
 */
@Injectable()
export class DashboardService {
  private readonly logger = new Logger('DashboardService');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get dashboard KPIs
   */
  async getKPIs(): Promise<{
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    totalFeesCollected: number;
    certificatesIssued: number;
    activeUsers: number;
  }> {
    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      totalFeesCollected,
      certificatesIssued,
      activeUsers,
    ] = await Promise.all([
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
}
