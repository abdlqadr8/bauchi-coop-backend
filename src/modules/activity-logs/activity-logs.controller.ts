import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ActivityLogsService } from './activity-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

/**
 * Activity Logs Controller
 * Admin endpoints for viewing activity logs
 */
@Controller('api/v1/admin/activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  /**
   * GET /admin/activity-logs
   * Get activity logs with filters
   */
  @Get()
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  async getActivityLogs(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('userId') userId?: string,
    @Query('applicationId') applicationId?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{
    logs: Array<{
      id: string;
      userId: string | null;
      userName: string | null;
      userRole: string | null;
      applicationId: string | null;
      cooperativeName: string | null;
      action: string;
      description: string | null;
      ipAddress: string | null;
      createdAt: Date;
    }>;
    total: number;
  }> {
    return this.activityLogsService.getActivityLogs({
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 20,
      userId,
      applicationId,
      action,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  /**
   * GET /admin/activity-logs/stats
   * Get activity statistics
   */
  @Get('stats')
  @Roles('SYSTEM_ADMIN', 'ADMIN')
  async getActivityStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<{
    totalActivities: number;
    byAction: Array<{ action: string; count: number }>;
    byUser: Array<{ userId: string; userName: string; count: number }>;
  }> {
    return this.activityLogsService.getActivityStats({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }
}
