import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * ActivityLogsService
 * Handles logging of user actions and system events
 */
@Injectable()
export class ActivityLogsService {
  private readonly logger = new Logger('ActivityLogsService');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create an activity log entry
   */
  async logActivity(data: {
    userId?: string;
    applicationId?: string;
    action: string;
    description?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
  }): Promise<void> {
    try {
      await this.prisma.activityLog.create({
        data: {
          userId: data.userId,
          applicationId: data.applicationId,
          action: data.action,
          description: data.description,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          ipAddress: data.ipAddress,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to log activity: ${data.action}`, error);
    }
  }

  /**
   * Get activity logs with filters
   */
  async getActivityLogs(params: {
    skip?: number;
    take?: number;
    userId?: string;
    applicationId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
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
    const {
      skip = 0,
      take = 20,
      userId,
      applicationId,
      action,
      startDate,
      endDate,
    } = params;

    const where: any = {};

    if (userId) where.userId = userId;
    if (applicationId) where.applicationId = applicationId;
    if (action) where.action = action;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          application: {
            select: {
              cooperativeName: true,
            },
          },
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      logs: logs.map((log) => ({
        id: log.id,
        userId: log.userId,
        userName: log.user
          ? `${log.user.firstName} ${log.user.lastName}`
          : null,
        userRole: log.user?.role || null,
        applicationId: log.applicationId,
        cooperativeName: log.application?.cooperativeName || null,
        action: log.action,
        description: log.description,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
      })),
      total,
    };
  }

  /**
   * Get recent activity for a user
   */
  async getUserRecentActivity(
    userId: string,
    limit: number = 10,
  ): Promise<
    Array<{
      id: string;
      action: string;
      description: string | null;
      createdAt: Date;
    }>
  > {
    const logs = await this.prisma.activityLog.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        action: true,
        description: true,
        createdAt: true,
      },
    });

    return logs;
  }

  /**
   * Get activity statistics
   */
  async getActivityStats(params: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalActivities: number;
    byAction: Array<{ action: string; count: number }>;
    byUser: Array<{ userId: string; userName: string; count: number }>;
  }> {
    const { startDate, endDate } = params;

    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const [totalActivities, byAction, byUser] = await Promise.all([
      this.prisma.activityLog.count({ where }),
      this.prisma.activityLog.groupBy({
        by: ['action'],
        where,
        _count: true,
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
      this.prisma.activityLog.groupBy({
        by: ['userId'],
        where: { ...where, userId: { not: null } },
        _count: true,
        orderBy: { _count: { userId: 'desc' } },
        take: 10,
      }),
    ]);

    // Fetch user names for top users
    const userIds = byUser
      .map((u) => u.userId)
      .filter((id): id is string => id !== null);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true },
    });

    const userMap = new Map(
      users.map((u) => [u.id, `${u.firstName} ${u.lastName}`]),
    );

    return {
      totalActivities,
      byAction: byAction.map((item) => ({
        action: item.action,
        count: item._count,
      })),
      byUser: byUser.map((item) => ({
        userId: item.userId || '',
        userName: userMap.get(item.userId || '') || 'Unknown',
        count: item._count,
      })),
    };
  }
}
