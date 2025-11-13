import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Dashboard Controller
 */
@Controller('admin/dashboard')
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
}
