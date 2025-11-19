import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '@/prisma/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

/**
 * AuthService handles authentication logic:
 * - User validation
 * - JWT token generation
 * - Refresh token rotation
 * - Token revocation
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger('AuthService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly activityLogsService: ActivityLogsService,
  ) {}

  /**
   * Validate user credentials (email + password)
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<{
    id: string;
    email: string;
    password: string;
    role: string;
    firstName: string;
    lastName: string;
  } | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      return null;
    }

    // Check if user account is active
    if (user.status !== 'ACTIVE') {
      this.logger.warn(`Login attempt for ${user.status} account: ${email}`);
      throw new UnauthorizedException(
        user.status === 'INACTIVE'
          ? 'Your account has been disabled. Please contact an administrator.'
          : 'Your account has been suspended. Please contact an administrator.',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Generate access and refresh tokens
   */
  async login(
    user: {
      id: string;
      email: string;
      role: string;
      firstName: string;
      lastName: string;
      mustChangePassword?: boolean;
    },
    ipAddress?: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    mustChangePassword?: boolean;
  }> {
    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user.id,
      mustChangePassword: user.mustChangePassword || false,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
    });

    const refreshTokenData = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    // Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.refreshToken.create({
      data: {
        token: refreshTokenData,
        userId: user.id,
        expiresAt,
      },
    });

    this.logger.log(`User logged in: ${user.email}`);

    // Log activity
    await this.activityLogsService.logActivity({
      userId: user.id,
      action: 'LOGIN',
      description: `User ${user.email} logged in`,
      ipAddress,
    });

    return {
      accessToken,
      refreshToken: refreshTokenData,
      mustChangePassword: user.mustChangePassword,
    };
  }

  /**
   * Change password (for first login or user-initiated change)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear mustChangePassword flag
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    // Revoke all existing refresh tokens for security
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    this.logger.log(`Password changed for user: ${userId}`);

    // Log activity
    await this.activityLogsService.logActivity({
      userId,
      action: 'CHANGE_PASSWORD',
      description: 'User changed their password',
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      const payload = this.jwtService.verify(refreshToken);

      // Check if token exists in DB and not revoked
      const tokenRecord = await this.prisma.refreshToken.findFirst({
        where: {
          token: refreshToken,
          userId: payload.sub,
          revokedAt: null,
        },
      });

      if (!tokenRecord || new Date() > tokenRecord.expiresAt) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Revoke old token
      await this.prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: { revokedAt: new Date() },
      });

      // Issue new tokens
      return this.login(user);
    } catch (error) {
      this.logger.error(
        `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout user by revoking all refresh tokens
   */
  async logout(userId: string, ipAddress?: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    this.logger.log(`User logged out: ${userId}`);

    // Log activity
    await this.activityLogsService.logActivity({
      userId,
      action: 'LOGOUT',
      description: 'User logged out',
      ipAddress,
    });
  }
}
