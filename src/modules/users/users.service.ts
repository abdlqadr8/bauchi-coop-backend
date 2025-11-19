import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { EmailService } from '../email/email.service';

/**
 * Users Service
 * Handles user CRUD operations and admin functions
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly activityLogsService: ActivityLogsService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Get all users (admin only)
   */
  async findAll(
    skip: number = 0,
    take: number = 10,
  ): Promise<{
    users: Array<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      status: string;
      lastLogin: Date | null;
      createdAt: Date;
    }>;
    total: number;
  }> {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          lastLogin: true,
          createdAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return { users, total };
  }

  /**
   * Get user by ID
   */
  async findById(id: string): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
  } | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Generate a secure temporary password
   */
  private generateTemporaryPassword(): string {
    const length = 12;
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    const allChars = uppercase + lowercase + numbers + symbols;

    let password = '';
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * Create new user
   */
  async create(
    dto: CreateUserDto,
    createdBy?: string,
  ): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    createdAt: Date;
  }> {
    // Prevent creation of SYSTEM_ADMIN users
    if (dto.role === 'SYSTEM_ADMIN') {
      throw new ForbiddenException(
        'SYSTEM_ADMIN users cannot be created through this endpoint for security reasons',
      );
    }

    // Check if user with email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException(
        `User with email ${dto.email} already exists`,
      );
    }

    // Generate temporary password if not provided
    const temporaryPassword = dto.password || this.generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: (dto.role || 'USER') as any,
        mustChangePassword: true, // Force password change on first login
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    this.logger.log(`User created: ${user.email}`);

    // Send welcome email with temporary password
    try {
      await this.emailService.sendUserWelcomeEmail(
        user.email,
        user.firstName,
        user.lastName,
        temporaryPassword,
        user.role,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to send welcome email to ${user.email}: ${error?.message}`,
      );
      // Don't fail user creation if email fails
    }

    // Log activity
    await this.activityLogsService.logActivity({
      userId: createdBy,
      action: 'CREATE_USER',
      description: `Created user: ${user.email} (${user.firstName} ${user.lastName})`,
      metadata: {
        targetUserId: user.id,
        role: user.role,
      },
    });

    return user;
  }

  /**
   * Update user info
   */
  async update(
    id: string,
    dto: UpdateUserDto,
    updatedBy?: string,
  ): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    updatedAt: Date;
  }> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    // Protect SYSTEM_ADMIN accounts from modification
    if (user.role === 'SYSTEM_ADMIN') {
      throw new ForbiddenException(
        'SYSTEM_ADMIN accounts cannot be modified for security reasons',
      );
    }

    // Prevent promotion to SYSTEM_ADMIN role
    if (dto.role === 'SYSTEM_ADMIN') {
      throw new ForbiddenException(
        'Users cannot be promoted to SYSTEM_ADMIN role through this endpoint',
      );
    }

    // Check email uniqueness if changing email
    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existing) {
        throw new ConflictException(`Email ${dto.email} is already in use`);
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role as any,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    this.logger.log(`User updated: ${updated.email}`);

    // Log activity
    await this.activityLogsService.logActivity({
      userId: updatedBy,
      action: 'UPDATE_USER',
      description: `Updated user: ${updated.email}`,
      metadata: {
        targetUserId: updated.id,
        changes: dto,
      },
    });

    return updated;
  }

  /**
   * Update user status (activate/deactivate/suspend)
   */
  async updateStatus(
    id: string,
    status: string,
    updatedBy?: string,
  ): Promise<{
    id: string;
    email: string;
    status: string;
  }> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    // Protect SYSTEM_ADMIN accounts from status changes
    if (user.role === 'SYSTEM_ADMIN') {
      throw new ForbiddenException(
        'SYSTEM_ADMIN accounts cannot be suspended or deactivated',
      );
    }

    // Prevent users from changing their own status
    if (updatedBy && user.id === updatedBy) {
      throw new ForbiddenException('You cannot change your own account status');
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: status as any },
      select: {
        id: true,
        email: true,
        status: true,
      },
    });

    this.logger.log(`User status updated: ${updated.email} -> ${status}`);

    // Log activity
    await this.activityLogsService.logActivity({
      userId: updatedBy,
      action: 'UPDATE_USER_STATUS',
      description: `Changed user ${updated.email} status to ${status}`,
      metadata: {
        targetUserId: updated.id,
        previousStatus: user.status,
        newStatus: status,
      },
    });

    return updated;
  }

  /**
   * Delete user
   */
  async delete(
    id: string,
    deletedBy?: string,
  ): Promise<{ id: string; email: string }> {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    // Protect SYSTEM_ADMIN accounts from deletion
    if (user.role === 'SYSTEM_ADMIN') {
      throw new ForbiddenException(
        'SYSTEM_ADMIN accounts cannot be deleted for security reasons',
      );
    }

    const deleted = await this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        email: true,
      },
    });

    this.logger.log(`User deleted: ${deleted.email}`);

    // Log activity
    await this.activityLogsService.logActivity({
      userId: deletedBy,
      action: 'DELETE_USER',
      description: `Deleted user: ${deleted.email}`,
      metadata: {
        targetUserId: deleted.id,
        role: user.role,
      },
    });

    return deleted;
  }

  /**
   * Get current user's profile
   */
  async getProfile(userId: string): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: string;
    status: string;
    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Update current user's profile
   */
  async updateProfile(
    userId: string,
    dto: { firstName: string; lastName: string; phone?: string },
  ): Promise<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    updatedAt: Date;
  }> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone || null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Profile updated for user: ${user.email}`);

    // Log activity
    await this.activityLogsService.logActivity({
      userId: userId,
      action: 'UPDATE_PROFILE',
      description: `Updated own profile`,
    });

    return user;
  }
}
