import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Reports Controller
 */
@Controller('api/v1/admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * GET /admin/reports/applications
   * Get applications summary
   */
  @Get('applications')
  @Roles('SYSTEM_ADMIN', 'ADMIN', 'STAFF')
  async getApplicationSummary(): Promise<{
    total: number;
    byStatus: Array<{ status: string; count: number }>;
  }> {
    return this.reportsService.getApplicationSummary();
  }

  /**
   * GET /admin/reports/payments
   * Get payments summary
   */
  @Get('payments')
  @Roles('SYSTEM_ADMIN', 'ADMIN', 'STAFF')
  async getPaymentSummary(): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    byStatus: Array<{ status: string; count: number; amount: number }>;
  }> {
    return this.reportsService.getPaymentSummary();
  }

  /**
   * GET /admin/reports/users
   * Get user activity summary (admin only)
   */
  @Get('users')
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  async getUserActivity(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    lastWeekLogins: number;
  }> {
    return this.reportsService.getUserActivity();
  }
}
