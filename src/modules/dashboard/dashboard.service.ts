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
   * Get dashboard KPIs with month-over-month comparison
   */
  async getKPIs(): Promise<{
    totalApplications: number;
    totalApplicationsTrend: number;
    totalApplicationsTrendUp: boolean;
    pendingApplications: number;
    pendingApplicationsTrend: number;
    pendingApplicationsTrendUp: boolean;
    approvedApplications: number;
    approvedApplicationsTrend: number;
    approvedApplicationsTrendUp: boolean;
    certificatesIssued: number;
    certificatesIssuedTrend: number;
    certificatesIssuedTrendUp: boolean;
    totalFeesCollected: number;
    activeUsers: number;
  }> {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    // Current month data
    const currentMonthApps = await this.prisma.application.count({
      where: { createdAt: { gte: currentMonthStart } },
    });
    const currentMonthPending = await this.prisma.application.count({
      where: {
        createdAt: { gte: currentMonthStart },
        status: { in: ['NEW', 'UNDER_REVIEW'] },
      },
    });
    const currentMonthApproved = await this.prisma.application.count({
      where: {
        createdAt: { gte: currentMonthStart },
        status: 'APPROVED',
      },
    });
    const currentMonthCertificates = await this.prisma.certificate.count({
      where: {
        issuedAt: { gte: currentMonthStart },
        revokedAt: null,
      },
    });

    // Last month data
    const lastMonthApps = await this.prisma.application.count({
      where: {
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    });
    const lastMonthPending = await this.prisma.application.count({
      where: {
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        status: { in: ['NEW', 'UNDER_REVIEW'] },
      },
    });
    const lastMonthApproved = await this.prisma.application.count({
      where: {
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        status: 'APPROVED',
      },
    });
    const lastMonthCertificates = await this.prisma.certificate.count({
      where: {
        issuedAt: { gte: lastMonthStart, lte: lastMonthEnd },
        revokedAt: null,
      },
    });

    // Total counts (all time)
    const [
      totalApplications,
      totalPending,
      totalApproved,
      totalFeesCollected,
      totalCertificates,
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

    // Calculate percentage changes
    const calculateTrend = (current: number, last: number) => {
      if (last === 0) return { percentage: 0, isUp: current > 0 };
      return {
        percentage: Math.round(((current - last) / last) * 100),
        isUp: current >= last,
      };
    };

    const appsTrend = calculateTrend(currentMonthApps, lastMonthApps);
    const pendingTrend = calculateTrend(currentMonthPending, lastMonthPending);
    const approvedTrend = calculateTrend(
      currentMonthApproved,
      lastMonthApproved,
    );
    const certsTrend = calculateTrend(
      currentMonthCertificates,
      lastMonthCertificates,
    );

    return {
      totalApplications,
      totalApplicationsTrend: appsTrend.percentage,
      totalApplicationsTrendUp: appsTrend.isUp,
      pendingApplications: totalPending,
      pendingApplicationsTrend: pendingTrend.percentage,
      pendingApplicationsTrendUp: pendingTrend.isUp,
      approvedApplications: totalApproved,
      approvedApplicationsTrend: approvedTrend.percentage,
      approvedApplicationsTrendUp: approvedTrend.isUp,
      certificatesIssued: totalCertificates,
      certificatesIssuedTrend: certsTrend.percentage,
      certificatesIssuedTrendUp: certsTrend.isUp,
      totalFeesCollected: totalFeesCollected._sum.amount || 0,
      activeUsers,
    };
  }

  /**
   * Get fees collected by period
   * @param period 'thisMonth' | 'thisQuarter' | 'thisYear' | 'allTime'
   */
  async getFeesByPeriod(
    period: 'thisMonth' | 'thisQuarter' | 'thisYear' | 'allTime' = 'thisMonth',
  ): Promise<{ amount: number; period: string }> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'thisQuarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'allTime':
        startDate = new Date(0);
        break;
    }

    const result = await this.prisma.payment.aggregate({
      where: {
        status: 'COMPLETED',
        paymentDate: { gte: startDate },
      },
      _sum: { amount: true },
    });

    return {
      amount: result._sum.amount || 0,
      period,
    };
  }

  /**
   * Get registration trends for the past 12 months
   */
  async getRegistrationTrends(): Promise<
    Array<{
      month: string;
      registrations: number;
      recertifications: number;
    }>
  > {
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    // Get all applications with created date
    const applications = await this.prisma.application.findMany({
      where: {
        createdAt: {
          gte: twelveMonthsAgo,
        },
      },
      select: {
        createdAt: true,
      },
    });

    // Get certificates issued in the same period (recertifications)
    const certificates = await this.prisma.certificate.findMany({
      where: {
        issuedAt: {
          gte: twelveMonthsAgo,
        },
      },
      select: {
        issuedAt: true,
      },
    });

    // Group by month
    const monthData: Record<
      string,
      { registrations: number; recertifications: number }
    > = {};

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    // Initialize all months
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const monthKey = monthNames[date.getMonth()];
      monthData[monthKey] = { registrations: 0, recertifications: 0 };
    }

    // Count applications (new registrations)
    applications.forEach((app) => {
      const month = monthNames[app.createdAt.getMonth()];
      if (monthData[month]) {
        monthData[month].registrations++;
      }
    });

    // Count certificates (recertifications)
    certificates.forEach((cert) => {
      const month = monthNames[cert.issuedAt.getMonth()];
      if (monthData[month]) {
        monthData[month].recertifications++;
      }
    });

    return Object.entries(monthData).map(([month, data]) => ({
      month,
      ...data,
    }));
  }

  /**
   * Get recent applications (last 6)
   */
  async getRecentApplications(): Promise<
    Array<{
      id: string;
      cooperativeName: string;
      applicationType: string;
      status: string;
      createdAt: Date;
    }>
  > {
    const applications = await this.prisma.application.findMany({
      take: 6,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        cooperativeName: true,
        status: true,
        createdAt: true,
      },
    });

    // Map applications to include applicationType (derived from status or defaulting to "General")
    return applications.map((app) => ({
      id: app.id,
      cooperativeName: app.cooperativeName,
      applicationType: 'General', // Default type - can be extended with more fields in schema
      status: app.status,
      createdAt: app.createdAt,
    }));
  }
}
