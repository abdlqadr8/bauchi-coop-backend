import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Reports Service
 * Generates reports and aggregates data
 */
@Injectable()
export class ReportsService {
  private readonly logger = new Logger('ReportsService');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get application summary report
   */
  async getApplicationSummary(): Promise<{
    total: number;
    byStatus: Array<{ status: string; count: number }>;
  }> {
    const statuses = ['NEW', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'FLAGGED'];

    const byStatus = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await this.prisma.application.count({
          where: { status },
        }),
      })),
    );

    const total = byStatus.reduce((sum, s) => sum + s.count, 0);

    return { total, byStatus };
  }

  /**
   * Get payment summary report
   */
  async getPaymentSummary(): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    byStatus: Array<{ status: string; count: number; amount: number }>;
  }> {
    const statuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'];

    const byStatus = await Promise.all(
      statuses.map(async (status) => {
        const aggregation = await this.prisma.payment.aggregate({
          where: { status },
          _sum: { amount: true },
          _count: true,
        });

        return {
          status,
          count: aggregation._count,
          amount: aggregation._sum.amount || 0,
        };
      }),
    );

    const totalRevenue = byStatus.reduce((sum, s) => sum + s.amount, 0);
    const totalTransactions = byStatus.reduce((sum, s) => sum + s.count, 0);

    return { totalRevenue, totalTransactions, byStatus };
  }

  /**
   * Get user activity summary
   */
  async getUserActivity(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    lastWeekLogins: number;
  }> {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalUsers, activeUsers, inactiveUsers, lastWeekLogins] =
      await Promise.all([
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
}
