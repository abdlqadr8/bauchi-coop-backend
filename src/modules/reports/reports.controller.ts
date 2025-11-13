import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Reports Controller
 */
@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SYSTEM_ADMIN', 'ADMIN')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * GET /admin/reports/applications
   * Get applications summary
   */
  @Get('applications')
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
  async getPaymentSummary(): Promise<{
    totalRevenue: number;
    totalTransactions: number;
    byStatus: Array<{ status: string; count: number; amount: number }>;
  }> {
    return this.reportsService.getPaymentSummary();
  }

  /**
   * GET /admin/reports/users
   * Get user activity summary
   */
  @Get('users')
  async getUserActivity(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    lastWeekLogins: number;
  }> {
    return this.reportsService.getUserActivity();
  }
}
