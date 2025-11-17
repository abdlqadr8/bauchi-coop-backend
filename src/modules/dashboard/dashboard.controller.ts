import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Dashboard Controller
 */
@Controller('api/v1/admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SYSTEM_ADMIN', 'ADMIN')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * GET /admin/dashboard
   * Get KPIs for dashboard
   */
  @Get()
  async getKPIs(): Promise<{
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    totalFeesCollected: number;
    certificatesIssued: number;
    activeUsers: number;
  }> {
    return this.dashboardService.getKPIs();
  }

  /**
   * GET /admin/dashboard/fees
   * Get fees collected by period
   */
  @Get('fees')
  async getFeesByPeriod(
    @Query('period')
    period: 'thisMonth' | 'thisQuarter' | 'thisYear' | 'allTime' = 'thisMonth',
  ): Promise<{ amount: number; period: string }> {
    return this.dashboardService.getFeesByPeriod(period);
  }

  /**
   * GET /admin/dashboard/trends
   * Get registration trends for the past 12 months
   */
  @Get('trends')
  async getRegistrationTrends(): Promise<
    Array<{
      month: string;
      registrations: number;
      recertifications: number;
    }>
  > {
    return this.dashboardService.getRegistrationTrends();
  }

  /**
   * GET /admin/dashboard/recent-applications
   * Get 6 most recent applications
   */
  @Get('recent-applications')
  async getRecentApplications(): Promise<
    Array<{
      id: string;
      cooperativeName: string;
      applicationType: string;
      status: string;
      createdAt: Date;
    }>
  > {
    return this.dashboardService.getRecentApplications();
  }
}
